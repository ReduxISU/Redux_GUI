// This is a holder for visualizations that passes down urls based on switch data.


import Split from 'react-split'
import { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import {No_Viz_Svg, No_Reduction_Viz_Svg} from '../Visualization/svgs/No_Viz_SVG';
import Visualizations from '../Visualization/svgs/Visualizations.js'
import ReducedVisualizations from '../Visualization/svgs/ReducedVizualizations';
import defaultSolvers from '../Visualization/constants/DefaultSolvers';
import { requestMappedSolution, requestMappedSolutionTransitive, requestSolvedInstanceTemporarySat3CliqueSolver } from '../redux';

export default function VisualizationLogic({
  url,
  defaultSolverMap,
  problemName,
  problemNameMap,
  problemInstance,
  reductionName,
  chosenReductionType,
  reductionNameMap,
  reducedInstance,
  visualizationState,
  loading,
}) {
    const [solution, setSolution] = useState("");
    const [mappedSolution, setMappedSolution] = useState();
    let visualization;
    let reducedVisualization;

    const solve = visualizationState.solverOn

    const handleBar = (sizes) => {}

    useEffect(() => {
      if (url && problemInstance && defaultSolverMap.has(problemName)) {
        requestSolvedInstanceTemporarySat3CliqueSolver(url, /*defaultSolvers.get(problemName) || */defaultSolverMap.get(problemName), problemInstance).then(
          (data) => {
            setSolution(data ?? "");
          }
        );
      }
    }, [problemInstance, problemName, defaultSolverMap, chosenReductionType, reducedInstance]);

    useEffect(() => {
      if (url && problemInstance && chosenReductionType && solution) {
        if (chosenReductionType.includes("-")) {
          requestMappedSolutionTransitive(url, chosenReductionType, problemInstance, solution).then((data) => {
            setMappedSolution(data ?? "");
          });
        } else if (reducedInstance) {
          requestMappedSolution(url, chosenReductionType, problemInstance, reducedInstance, solution).then((data) => {
            setMappedSolution(data ?? "");
          });
        }
      }
    }, [solution])
    
    if(url && problemInstance){
        try{
            visualization = Visualizations.get(problemName)(solve, url, problemInstance, solution)
        } catch{
            visualization = <No_Viz_Svg niceProblemName={problemNameMap.get(problemName)}/>
        }

        if(visualizationState.reductionOn){
            try{
                reducedVisualization = ReducedVisualizations.get(chosenReductionType)(solve, url, reducedInstance, mappedSolution)

                //NOTE - Caleb, The following is a temporary fix until CLIQUE_SVG_REACT.js is fixed, currently it takes the 3sat instance, 
                // but should take the clique instance, once that is fixed the following code block should be able to be removed without issue
                if(reductionName == "CLIQUE"){
                    reducedVisualization = ReducedVisualizations.get(chosenReductionType)(solve, url, problemInstance, mappedSolution)
                }

            } catch{
                reducedVisualization = <No_Reduction_Viz_Svg reducedVisualization={reductionNameMap.get(chosenReductionType)}/>
            }
        }
    }


    if (!visualizationState.reductionOn && !loading) {
        return (
            <>
                <Container>
                    {visualization}
                </Container>
            </>
        )
    }
    else if (visualizationState.reductionOn && !loading) {

        return (
            <>
                <Split
                    className="wrap"
                    direction="horizontal"
                    style={{ height: 'inherit' }}
                    onDragStart={handleBar}
                >
                    <Container>
                        {/* {"Container1"} */}
                        {visualization}
                    </Container>

                    <Container>
                        {/* {"Container2"} */}
                        {reducedVisualization}
                    </Container>
                </Split>

            </>
        )
    }

    return (
        <>
        </>
    )
}
