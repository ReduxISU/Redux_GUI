// Simplified visualization-type categories for display (issue #378) and filtering
// (issue #379). Maps the wire-value visualizationType vocabulary
// (visualizationTypes.json) down to a small set of human-facing categories so a
// tooltip reads "Graph" instead of "GraphD3"/"GraphLaTeX", and so a problem can be
// filtered by "which kind of visualization" without the rendering-technology
// distinction (D3 vs. LaTeX vs. Q.js) leaking into the UI.
//
// Purely a display/filter-grouping concern -- does NOT change the wire value itself,
// which stays GraphD3/GraphLaTeX/etc. on the API and in Visualizations.js's renderer
// registry (see PopoverTooltipClick's toolTip prop / useProblemFilters' matching,
// which both still key off the raw wire value).
const VISUALIZATION_TYPE_CATEGORIES = {
  GraphD3: "Graph",
  GraphLaTeX: "Graph",
  BooleanSatisfiability: "Boolean Satisfiability",
  SetD3: "Set",
  QuantumCircuitD3: "Quantum Circuit",
  QuantumCircuitQjs: "Quantum Circuit",
  DynamicTable: "Table",
  PumpSchedule: "Pump Schedule",
};

/**
 * The simplified display category for a visualizationType wire value, e.g.
 * "GraphD3" -> "Graph". Falls back to the raw value itself for anything not in the
 * map (e.g. "Unimplemented", or a newly-declared type not yet categorized here) so
 * it's never silently dropped from the UI.
 */
export function visualizationTypeCategory(type) {
  return (type && VISUALIZATION_TYPE_CATEGORIES[type]) || type;
}

export default VISUALIZATION_TYPE_CATEGORIES;
