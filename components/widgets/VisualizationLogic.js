// This is a holder for visualizations that passes down urls based on switch data.

import { Container } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import Split from "react-split";
import { makeIdsUnique, processReductions, remapIdsDeep, userFacingError } from "../redux";
import {
  Failed_Viz_Svg,
  Loading_Viz_Svg,
  No_Picture_Viz_Svg,
  No_Renderable_Viz_Svg,
  Viz_Render_Error_Svg,
} from "../Visualization/svgs/No_Viz_SVG";
import { isRenderable } from "../Visualization/svgs/renderability";
import Visualizations from "../Visualization/svgs/Visualizations.js";
import VisualizationErrorBoundary from "./VisualizationErrorBoundary";

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
      (step, ...requestFailure) => {
        failure = { step, ...userFacingError(...requestFailure) };
      },
    )
      .catch((err) => {
        console.error("gadget map request failed", err);
        failure = { step: "Gadget map", ...userFacingError(String(err?.message ?? err)) };
      })
      .then((rawGadgetMap) => {
        if (ignore) return;
        // processReductions answers undefined when a gadget or reduce request failed.
        if (rawGadgetMap === undefined) {
          failure ??= { step: "Gadget map", ...userFacingError("No answer.") };
        }
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

  // "Failed to Visualize" for a renderer that crashed, whether it threw while its element was built
  // (the try/catch below) or while React rendered it (the error boundary).
  const pictureRenderError = (err) => (
    <Viz_Render_Error_Svg
      niceProblemName={problemNameMap.get(problemName)}
      visualizationName={visualizationName}
      visualizationType={visualizationType}
      error={err}
    />
  );
  const reductionRenderError = (err) => (
    <Viz_Render_Error_Svg
      niceReductionName={reductionNameMap.get(chosenReductionType) ?? chosenReductionType}
      visualizationType={reductionVisualization}
      error={err}
    />
  );

  // Draws a picture with its renderer. A renderer can crash in two places: while its element is
  // built (caught here) or while React renders it or runs its effects, which a try/catch cannot
  // see (caught by the error boundary). Either way the pane shows `fallback(error)` and the error
  // is logged. The boundary keeps showing the card only until a reset key or anything the picture
  // is drawn from changes; then the renderer gets another try, so a crash never sticks after a
  // switch.
  function drawPicture(type, data, { fallback, logMessage, resetKeys }) {
    let element;
    try {
      element = Visualizations.get(type)(solve, url, data, gadgetMap, visualizationState.gadgetsOn);
    } catch (err) {
      console.error(logMessage, type, err);
      return fallback(err);
    }
    return (
      <VisualizationErrorBoundary
        resetKeys={[...resetKeys, data, gadgetMap, solve, visualizationState.gadgetsOn]}
        fallback={fallback}
        logMessage={logMessage}
        logDetails={[type]}
      >
        {element}
      </VisualizationErrorBoundary>
    );
  }

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
      visualization = drawPicture(visualizationType, mappedProblemData, {
        fallback: pictureRenderError,
        logMessage: "visualization renderer threw",
        resetKeys: [problemName, problemInstance, visualizationName, visualizationType],
      });
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
          message={fetchedGadgets.failure.message}
          hint={fetchedGadgets.failure.hint}
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
      reducedVisualization = drawPicture(reductionVisualization, mappedReductionData, {
        fallback: reductionRenderError,
        logMessage: "reduction visualization renderer threw",
        resetKeys: [problemName, problemInstance, chosenReductionType, reductionVisualization],
      });

      //NOTE - Caleb, The following is a temporary fix until CLIQUE_SVG_REACT.js is fixed, currently it takes the 3sat instance,
      // but should take the clique instance, once that is fixed the following code block should be able to be removed without issue
      if (reductionName == "CLIQUE") {
        //reducedVisualization = ReducedVisualizations.get(chosenReductionType)(solve, url, problemInstance, mappedSolution)
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
