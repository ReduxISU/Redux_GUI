// This is a holder for visualizations that passes down urls based on switch data.


import Split from 'react-split'
import { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { No_Viz_Svg, No_Reduction_Viz_Svg } from '../Visualization/svgs/No_Viz_SVG';
import Visualizations from '../Visualization/svgs/Visualizations.js'
import { remapIdsDeep, makeIdsUnique, processReductions } from '../redux';

export default function VisualizationLogic({
  url,
  problemName,
  problemNameMap,
  problemInstance,
  reductionName,
  chosenReductionType,
  reductionNameMap,
  visualizationState,
  loading,
  visualizationType,
  problemData,
  reductionData,
  reductionVisualization,
}) {
  const [gadgetMap, setGadgetMap] = useState([]);
  let visualization;
  let reducedVisualization;

  const solve = visualizationState.solverOn

  const handleBar = () => { }

  const [mappedProblemData, setMappedProblemData] = useState(null);
  const [mappedReductionData, setMappedReductionData] = useState(null);

  useEffect(() => {
    if (problemInstance && problemData) {
      processReductions(url, chosenReductionType, problemInstance)
        .then(rawGadgetMap => {
          const { gadgets, fromIdMap } = makeIdsUnique(rawGadgetMap);
          setGadgetMap(gadgets);
          setMappedProblemData(remapIdsDeep(problemData, fromIdMap) || problemData);
        })
    }
  }, [problemData, url, chosenReductionType, problemInstance]);

useEffect(() => {
  if (visualizationState.reductionOn && reductionVisualization && url && problemInstance) {
    processReductions(url, chosenReductionType, problemInstance)
      .then(rawGadgetMap => {
        const { gadgets, toIdMap } = makeIdsUnique(rawGadgetMap);
        setGadgetMap(gadgets);
        setMappedReductionData(remapIdsDeep(reductionData, toIdMap) || reductionData);
      })
  }
}, [
  visualizationState.reductionOn,
  reductionVisualization,
  chosenReductionType,
  problemInstance,
  reductionData,
  url
]);


if (url && problemInstance && mappedProblemData && Object.keys(mappedProblemData).length > 0) {
  try {
      console.log(mappedProblemData)
    visualization = Visualizations.get(visualizationType)(solve, url, mappedProblemData, gadgetMap, visualizationState.gadgetsOn)
  } catch {
    visualization = <No_Viz_Svg niceProblemName={problemNameMap.get(problemName)} />
  }

  if (visualizationState.reductionOn) {
    try {
      reducedVisualization = Visualizations.get(reductionVisualization)(solve, url, mappedReductionData, gadgetMap, visualizationState.gadgetsOn)

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
