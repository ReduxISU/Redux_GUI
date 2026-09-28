// This is a holder for visualizations that passes down urls based on switch data.

import { Container } from "@mui/material";
import { useEffect, useState } from "react";
import Split from "react-split";
import { makeIdsUnique, processReductions, remapIdsDeep } from "../redux";
import { No_Renderable_Viz_Svg, Viz_Render_Error_Svg } from "../Visualization/svgs/No_Viz_SVG";
import { isRenderable } from "../Visualization/svgs/renderability";
import Visualizations from "../Visualization/svgs/Visualizations.js";

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

  const solve = visualizationState.solverOn;

  const handleBar = () => {};

  const [mappedProblemData, setMappedProblemData] = useState(null);
  const [mappedReductionData, setMappedReductionData] = useState(null);

  useEffect(() => {
    if (problemInstance && problemData) {
      processReductions(url, chosenReductionType, problemInstance).then((rawGadgetMap) => {
        const { gadgets, fromIdMap } = makeIdsUnique(rawGadgetMap);
        setGadgetMap(gadgets);
        setMappedProblemData(remapIdsDeep(problemData, fromIdMap) || problemData);
      });
    }
  }, [problemData, url, chosenReductionType, problemInstance]);

  useEffect(() => {
    if (visualizationState.reductionOn && reductionVisualization && url && problemInstance) {
      processReductions(url, chosenReductionType, problemInstance).then((rawGadgetMap) => {
        const { gadgets, toIdMap } = makeIdsUnique(rawGadgetMap);
        setGadgetMap(gadgets);
        setMappedReductionData(remapIdsDeep(reductionData, toIdMap) || reductionData);
      });
    }
  }, [
    visualizationState.reductionOn,
    reductionVisualization,
    chosenReductionType,
    problemInstance,
    reductionData,
    url,
  ]);

  if (url && problemInstance && mappedProblemData && Object.keys(mappedProblemData).length > 0) {
    if (!isRenderable(visualizationType)) {
      visualization = (
        <No_Renderable_Viz_Svg
          niceProblemName={problemNameMap.get(problemName)}
          visualizationType={visualizationType}
        />
      );
    } else {
      try {
        visualization = Visualizations.get(visualizationType)(
          solve,
          url,
          mappedProblemData,
          gadgetMap,
          visualizationState.gadgetsOn,
        );
      } catch (err) {
        console.error("visualization renderer threw", visualizationType, err);
        visualization = (
          <Viz_Render_Error_Svg
            niceProblemName={problemNameMap.get(problemName)}
            visualizationType={visualizationType}
          />
        );
      }
    }

    if (visualizationState.reductionOn) {
      if (!isRenderable(reductionVisualization)) {
        reducedVisualization = (
          <No_Renderable_Viz_Svg
            niceReductionName={reductionNameMap.get(chosenReductionType)}
            visualizationType={reductionVisualization}
          />
        );
      } else {
        try {
          reducedVisualization = Visualizations.get(reductionVisualization)(
            solve,
            url,
            mappedReductionData,
            gadgetMap,
            visualizationState.gadgetsOn,
          );

          //NOTE - Caleb, The following is a temporary fix until CLIQUE_SVG_REACT.js is fixed, currently it takes the 3sat instance,
          // but should take the clique instance, once that is fixed the following code block should be able to be removed without issue
          if (reductionName == "CLIQUE") {
            //reducedVisualization = ReducedVisualizations.get(chosenReductionType)(solve, url, problemInstance, mappedSolution)
          }
        } catch (err) {
          console.error("reduction visualization renderer threw", reductionVisualization, err);
          reducedVisualization = (
            <Viz_Render_Error_Svg
              niceReductionName={reductionNameMap.get(chosenReductionType)}
              visualizationType={reductionVisualization}
            />
          );
        }
      }
    }
  }

  if (!visualizationState.reductionOn && !loading) {
    return (
      <>
        <Container data-tour-id="viz-canvas">{visualization}</Container>
      </>
    );
  } else if (visualizationState.reductionOn && !loading) {
    return (
      <>
        <Split
          className="wrap"
          direction="horizontal"
          style={{ height: "inherit" }}
          onDragStart={handleBar}
        >
          <Container data-tour-id="viz-canvas">
            {/* {"Container1"} */}
            {visualization}
          </Container>

          <Container>
            {/* {"Container2"} */}
            {reducedVisualization}
          </Container>
        </Split>
      </>
    );
  }

  return <></>;
}
