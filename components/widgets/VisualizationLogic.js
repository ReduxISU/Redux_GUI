// This is a holder for visualizations that passes down urls based on switch data.

import { Container } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import Split from "react-split";
import { makeIdsUnique, processReductions, remapIdsDeep } from "../redux";
import {
  Failed_Viz_Svg,
  Loading_Viz_Svg,
  No_Picture_Viz_Svg,
  No_Renderable_Viz_Svg,
  Viz_Render_Error_Svg,
} from "../Visualization/svgs/No_Viz_SVG";
import { isRenderable } from "../Visualization/svgs/renderability";
import Visualizations from "../Visualization/svgs/Visualizations.js";

const NO_GADGETS = {
  key: null,
  failure: null,
  gadgets: [],
  fromIdMap: new Map(),
  toIdMap: new Map(),
};

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
  visualizationName,
  problemData,
  problemStatus,
  problemFailure,
  reductionData,
  reductionStatus,
  reductionFailure,
  reductionVisualization,
}) {
  let visualization;
  let reducedVisualization;

  const solve = visualizationState.solverOn;

  const handleBar = () => {};

  // The gadget map is only needed to draw the reduction or highlight gadgets, so it is not
  // requested otherwise. It is stored with the reduction and instance it was built for, and the
  // pictures are remapped from the current data on each render, so an answer for an earlier
  // problem or reduction can never be drawn.
  const wantGadgets = visualizationState.reductionOn || visualizationState.gadgetsOn;
  const gadgetKey =
    wantGadgets && url && chosenReductionType && problemInstance
      ? `${chosenReductionType}|${problemInstance}`
      : null;
  const [fetchedGadgets, setFetchedGadgets] = useState(NO_GADGETS);

  useEffect(() => {
    if (!gadgetKey) return;
    let ignore = false;
    let failure = null;
    processReductions(
      url,
      chosenReductionType,
      problemInstance,
      () => !ignore,
      (step, detail) => {
        failure = { step, detail };
      },
    )
      .catch((err) => {
        console.error("gadget map request failed", err);
        failure = { step: "Gadget map", detail: String(err?.message ?? err) };
      })
      .then((rawGadgetMap) => {
        if (ignore) return;
        // processReductions answers undefined when a gadget or reduce request failed.
        if (rawGadgetMap === undefined) failure ??= { step: "Gadget map", detail: "No answer." };
        setFetchedGadgets({ key: gadgetKey, failure, ...makeIdsUnique(rawGadgetMap) });
      });
    return () => {
      ignore = true;
    };
  }, [gadgetKey, url, chosenReductionType, problemInstance]);

  const gadgetsReady = gadgetKey !== null && fetchedGadgets.key === gadgetKey;
  const gadgetMap = gadgetsReady ? fetchedGadgets.gadgets : NO_GADGETS.gadgets;
  const mappedProblemData = useMemo(
    () =>
      gadgetsReady
        ? remapIdsDeep(problemData, fetchedGadgets.fromIdMap) || problemData
        : problemData,
    [problemData, gadgetsReady, fetchedGadgets],
  );
  const mappedReductionData = useMemo(
    () =>
      gadgetsReady
        ? remapIdsDeep(reductionData, fetchedGadgets.toIdMap) || reductionData
        : reductionData,
    [reductionData, gadgetsReady, fetchedGadgets],
  );

  // The main picture is drawn without waiting for the gadget map. Statuses come from
  // VisualizeRowReact: "loading", "failed", "missing" (an empty answer), "ready" or "none".
  if (problemStatus === "loading") {
    visualization = <Loading_Viz_Svg />;
  } else if (problemStatus === "failed") {
    visualization = <Failed_Viz_Svg {...problemFailure} />;
  } else if (problemStatus === "missing") {
    visualization = <No_Picture_Viz_Svg niceProblemName={problemNameMap.get(problemName)} />;
  } else if (problemStatus === "ready") {
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
            visualizationName={visualizationName}
            visualizationType={visualizationType}
            error={err}
          />
        );
      }
    }
  }

  // The reduction picture waits for its gadget map, so both sides use the same unique ids.
  if (visualizationState.reductionOn) {
    if (reductionStatus === "failed") {
      reducedVisualization = <Failed_Viz_Svg {...reductionFailure} />;
    } else if (reductionStatus === "ready" && gadgetsReady && fetchedGadgets.failure) {
      reducedVisualization = (
        <Failed_Viz_Svg
          step={`${fetchedGadgets.failure.step} failed (needed for the reduction picture of ${
            problemNameMap.get(problemName) ?? problemName
          }).`}
          detail={fetchedGadgets.failure.detail}
        />
      );
    } else if (
      reductionStatus === "loading" ||
      (reductionStatus === "ready" && (!gadgetsReady || reductionVisualization === undefined))
    ) {
      reducedVisualization = <Loading_Viz_Svg />;
    } else if (reductionStatus === "missing") {
      reducedVisualization = <No_Picture_Viz_Svg reduction />;
    } else if (!isRenderable(reductionVisualization)) {
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
            niceReductionName={reductionNameMap.get(chosenReductionType) ?? chosenReductionType}
            visualizationType={reductionVisualization}
            error={err}
          />
        );
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
