import QuantumCircuitVis from "../QuantumCircuitVis";
import DFATableVisualization from "./DFATableSvgReact";
import DynamicTableSvgReact from "./DynamicTableSvgReact";
import LaTeXGraphSvgReact from "./LaTeXGraphSvgReact";
import NFATableVisualization from "./NFATableSvgReact";
import PumpSchedulingSvgReact from "./PumpSchedulingSvgReact";
import StandardCircuitSvgReact from "./StandardCircuitSvgReact";
import StandardGraphSvgReact from "./StandardGraphSvgReact";
import StandardSATSvgReact from "./StandardSATSvgReact";
import StandardSetSvgReact from "./StandardSetSvgReact";

const renderBooleanSatisfiability = (solve, url, problemData, gadgetMap, gadgetsOn) => {
  return (
    <StandardSATSvgReact
      problemData={problemData}
      solve={solve}
      url={url}
      gadgetMap={gadgetMap}
      gadgetsOn={gadgetsOn}
    ></StandardSATSvgReact>
  );
};

const renderSetD3 = (solve, url, problemData, gadgetMap, gadgetsOn) => {
  return (
    <StandardSetSvgReact
      problemData={problemData}
      solve={solve}
      url={url}
      gadgetMap={gadgetMap}
      gadgetsOn={gadgetsOn}
    ></StandardSetSvgReact>
  );
};

const renderGraphD3 = (solve, url, problemData, gadgetMap, gadgetsOn) => {
  return (
    <StandardGraphSvgReact
      problemData={problemData}
      solve={solve}
      url={url}
      gadgetMap={gadgetMap}
      gadgetsOn={gadgetsOn}
    ></StandardGraphSvgReact>
  );
};

const renderGraphLaTeX = (solve, url, problemData, gadgetMap, gadgetsOn) => {
  return (
    <LaTeXGraphSvgReact
      problemData={problemData}
      solve={solve}
      url={url}
      gadgetMap={gadgetMap}
      gadgetsOn={gadgetsOn}
    ></LaTeXGraphSvgReact>
  );
};

const renderQuantumCircuitD3 = (solve, url, problemData, gadgetMap, gadgetsOn) => {
  return (
    <StandardCircuitSvgReact
      problemData={problemData}
      solve={solve}
      url={url}
      gadgetMap={gadgetMap}
      gadgetsOn={gadgetsOn}
    ></StandardCircuitSvgReact>
  );
};

const renderQuantumCircuitQjs = (solve, url, problemData, gadgetMap, gadgetsOn) => {
  return (
    <QuantumCircuitVis
      problemData={problemData}
      solve={solve}
      url={url}
      gadgetMap={gadgetMap}
      gadgetsOn={gadgetsOn}
    />
  );
};

const renderPumpSchedule = (solve, url, problemData) => {
  return <PumpSchedulingSvgReact problemData={problemData} solve={solve} url={url} />;
};

const renderDynamicTable = (solve, url, problemData) => {
  return <DynamicTableSvgReact problemData={problemData} solve={solve} url={url} />;
};

const renderDFATable = (solve, url, problemData) => {
  return <DFATableVisualization problemData={problemData} solve={solve} url={url} />;
};

const renderNFATable = (solve, url, problemData) => {
  return <NFATableVisualization problemData={problemData} solve={solve} url={url} />;
};

/**
 * Registry of visualization renderers, keyed by `visualizationType`.
 *
 * Keys MUST remain double-quoted string literals in first position within each Map entry's
 * array (opening bracket, then immediately a double-quoted key, then a comma, then the factory)
 * -- Tools/check-visualization-coverage.mjs extracts them with a regex, not a JS parser, and CI
 * fails loudly if it can no longer find enough of them.
 *
 * Dual-accept window: the API is mid-rename from space-separated wire values (e.g. "Graph D3")
 * to clean identifiers (e.g. "GraphD3"). Both are registered here, pointing at the same
 * renderer, so this GUI image works against either the old or the new API image. The legacy
 * aliases are scheduled for deletion once the rename has been deployed for one full release --
 * see the implementation plan, section 2.10. Do not register a new renderer under a
 * legacy-style key.
 *
 * "DFA Table"/"NFA Table" are a separate case from the legacy aliases above: there is no
 * current backend `VisualizationType` for either (old-style or renamed) -- no DFA/NFA problem's
 * `visualizationType` is wired to emit these keys yet. Kept registered because the renderer
 * components already exist; see NOT_YET_BACKEND_WIRED in Tools/check-visualization-coverage.mjs
 * for the matching CI exemption.
 *
 * "Unimplemented" is a sentinel meaning "no renderer is claimed" and is deliberately NOT a
 * registry key -- see isRenderable() in ./renderability.js.
 */
const Visualizations = new Map([
  // -- current wire values --
  ["BooleanSatisfiability", renderBooleanSatisfiability],
  ["SetD3", renderSetD3],
  ["GraphD3", renderGraphD3],
  ["GraphLaTeX", renderGraphLaTeX],
  ["QuantumCircuitD3", renderQuantumCircuitD3],
  ["QuantumCircuitQjs", renderQuantumCircuitQjs],
  ["PumpSchedule", renderPumpSchedule],
  ["DynamicTable", renderDynamicTable],

  // -- legacy aliases (dual-accept window; scheduled for deletion, see plan 2.10) --
  ["Boolean Satisfiability", renderBooleanSatisfiability],
  ["Set D3", renderSetD3],
  ["Graph D3", renderGraphD3],
  ["Graph LaTeX", renderGraphLaTeX],
  ["Quantum Circuit D3", renderQuantumCircuitD3],
  ["Quantum Circuit Q.js", renderQuantumCircuitQjs],
  ["pump", renderPumpSchedule],
  ["Dynamic Table", renderDynamicTable],

  // -- not yet backend-wired (no matching VisualizationType exists yet) --
  ["DFA Table", renderDFATable],
  ["NFA Table", renderNFATable],
]);

export default Visualizations;
