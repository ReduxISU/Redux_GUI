import Visualizations from "./Visualizations";

/**
 * Single chokepoint for "can this GUI actually draw this visualization type".
 * Used by the picker (to disable unrenderable options), the auto-selection
 * hook (to never auto-select an unrenderable option), and VisualizationLogic
 * (to distinguish "no renderer" from "renderer crashed").
 *
 * `type` is a `visualizationType` wire value (e.g. "GraphD3"), not a
 * visualization class name. "Unimplemented" is explicitly excluded: it is a
 * declared sentinel meaning "no renderer is claimed", never a registry key.
 */
export function isRenderable(type) {
  return Boolean(type) && type !== "Unimplemented" && Visualizations.has(type);
}
