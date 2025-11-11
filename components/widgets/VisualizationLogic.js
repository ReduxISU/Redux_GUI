// This is a holder for visualizations that passes down urls based on switch data.


import Split from 'react-split'
import { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { No_Viz_Svg, No_Reduction_Viz_Svg } from '../Visualization/svgs/No_Viz_SVG';
import Visualizations from '../Visualization/svgs/Visualizations.js'
import { processReductions } from '../redux';

export default function VisualizationLogic({
  url,
  problemName,
  problemNameMap,
  problemInstance,
  reductionName,
  chosenReductionType,
  reductionNameMap,
  reducedInstance,
  visualizationState,
  loading,
  visualizationType,
  problemData,
  reductionData,
  reductionVisualization,
  chosenReduceTo,
}) {
  const [gadgetMap, setGadgetMap] = useState([]);
  let visualization;
  let reducedVisualization;

  const solve = visualizationState.solverOn

  const handleBar = (sizes) => { }

  useEffect(() => {
    if (visualizationState.reductionOn && reductionVisualization !== "") {
        processReductions(url, chosenReductionType, problemInstance)
            .then(setGadgetMap);
    }
  }, [visualizationState.reductionOn, reductionVisualization, chosenReductionType, problemInstance]);

  if (url && problemInstance && problemData && Object.keys(problemData).length > 0) {
    try {
      visualization = Visualizations.get(visualizationType)(solve, url, problemData, gadgetMap)
    } catch {
      visualization = <No_Viz_Svg niceProblemName={problemNameMap.get(problemName)} />
    }

    if (visualizationState.reductionOn) {
      try {
        reducedVisualization = Visualizations.get(reductionVisualization)(solve, url, reductionData, gadgetMap)

        //NOTE - Caleb, The following is a temporary fix until CLIQUE_SVG_REACT.js is fixed, currently it takes the 3sat instance, 
        // but should take the clique instance, once that is fixed the following code block should be able to be removed without issue
        if (reductionName == "CLIQUE") {
          //reducedVisualization = ReducedVisualizations.get(chosenReductionType)(solve, url, problemInstance, mappedSolution)
        }

      } catch {
        reducedVisualization = <No_Reduction_Viz_Svg reducedVisualization={reductionNameMap.get(chosenReductionType)} />
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
