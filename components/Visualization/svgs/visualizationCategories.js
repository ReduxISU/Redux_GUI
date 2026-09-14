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

/** Category label for the visualization-status sentinel and for anything that
 * doesn't (yet) have a real category -- "Unimplemented" itself, and any future
 * VisualizationType.cs value added before this map is updated to categorize it. */
export const UNIMPLEMENTED_CATEGORY = "Unimplemented";

/** Sentinel `selectedVisualizationTypes` key for the "All Visualizations" filter
 * option -- matches every problem with a renderable visualization (i.e. every
 * category except Unimplemented), regardless of which specific category. Not a
 * real visualizationType wire value, so it can't collide with one. */
export const ALL_VISUALIZATIONS_KEY = "__all_visualizations__";

/**
 * The simplified display category for a visualizationType wire value, e.g.
 * "GraphD3" -> "Graph". Falls back to `UNIMPLEMENTED_CATEGORY` for anything not
 * in the map -- "Unimplemented" itself, and also any newly-declared
 * VisualizationType.cs value not yet categorized here, so an uncategorized type
 * groups with "no renderer" instead of appearing as its own raw-value category.
 */
export function visualizationTypeCategory(type) {
  return (type && VISUALIZATION_TYPE_CATEGORIES[type]) || UNIMPLEMENTED_CATEGORY;
}

export default VISUALIZATION_TYPE_CATEGORIES;
