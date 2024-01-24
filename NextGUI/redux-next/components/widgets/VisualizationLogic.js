// This is a holder for visualizations that passes down urls based on switch data.


import Split from 'react-split'
import { useState } from 'react';
import { Container } from '@mui/material';
import {No_Viz_Svg, No_Reduction_Viz_Svg} from '../Visualization/svgs/No_Viz_SVG';
import Visualizations from '../Visualization/svgs/Visualizations.js'
import ReducedVisualizations from '../Visualization/svgs/ReducedVizualizations';
import { requestMappedSolution, requestMappedSolutionTransitive, requestSolvedInstanceTemporarySat3CliqueSolver } from '../redux';

export default function VisualizationLogic(props) {

    const [solution, setSolution] = useState();
    const [mappedSolution, setMappedSolution] = useState();
    let visualization;
    let reducedVisualization;
    let defaultSolverMap = props.defaultSolverMap;
    let problemName = props.problemName;
    let problemInstance = props.problemInstance;
    let reductionName = props.reductionName;
    let reductionType = props.reductionType;
    let reducedInstance = props.reducedInstance;
    let visualizationState = props.visualizationState
    let loading = props.loading
    let url = props.url;
    let solve = props.visualizationState.solverOn

    const handleBar = (sizes) => {}

    
    if(props.url && props.problemInstance){
        if (defaultSolverMap.has(problemName)) {
            requestSolvedInstanceTemporarySat3CliqueSolver(url,  defaultSolverMap.get(problemName), problemInstance ).then(data => {
                if (data) {
                    setSolution(data);
                }
            });
        }

        if(reductionType && reductionType.includes('-')){
            requestMappedSolutionTransitive(url, reductionType, problemInstance, solution).then(data => {
                if (data) {
                    setMappedSolution(data);
                }
            });
        }
        else if (reductionType && reducedInstance) {
            requestMappedSolution(url, reductionType, problemInstance, reducedInstance, solution).then(data => {
                if (data) {
                    setMappedSolution(data);
                }
            });
        }

        try{
            visualization = Visualizations.get(problemName)(solve, url, problemInstance, solution)
        } catch{
            visualization = <No_Viz_Svg></No_Viz_Svg>
        }

        if(props.visualizationState.reductionOn){
            try{
                reducedVisualization = ReducedVisualizations.get(reductionType)(solve, url, reducedInstance, mappedSolution)

                //NOTE - Caleb, The following is a temporary fix until CLIQUE_SVG_REACT.js is fixed, currently it takes the 3sat instance, 
                // but should take the clique instance, once that is fixed the following code block should be able to be removed without issue
                if(reductionName == "CLIQUE"){
                    reducedVisualization = ReducedVisualizations.get(reductionType)(solve, url, problemInstance, mappedSolution)
                }

            } catch{
                reducedVisualization = <No_Reduction_Viz_Svg></No_Reduction_Viz_Svg>
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
                    class="wrap"
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
