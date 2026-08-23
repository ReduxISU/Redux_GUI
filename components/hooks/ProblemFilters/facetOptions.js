// Builds `[{key, label, count}]` for a facet: how many problems have each
// distinct value, derived from the actual data rather than a hardcoded enum
// list, so newly-declared tag values show up automatically.
export function buildFacetOptions(problemIndex, pickValues) {
  const counts = new Map();
  for (const tags of problemIndex.values()) {
    const values = pickValues(tags);
    for (const value of values) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, count]) => ({ key, label: key, count }));
}

/**
 * Same option-building as `buildFacetOptions`, but grouped under a coarser display
 * category (e.g. visualizationType "GraphD3"/"GraphLaTeX" grouped under "Graph",
 * issue #378/#379). The underlying option `key` stays the raw value -- selecting it
 * still toggles the raw value into filter state, so matching logic elsewhere
 * (`useProblemFilters`) is untouched; `categorize` only changes how options are
 * grouped/labeled for display.
 *
 * @returns `[{category, options: [{key, label, count}]}]`, categories and options
 * both sorted alphabetically.
 */
export function buildGroupedFacetOptions(problemIndex, pickValues, categorize) {
  const flat = buildFacetOptions(problemIndex, pickValues);
  const groups = new Map();
  for (const option of flat) {
    const category = categorize(option.key) || option.key;
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(option);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([category, options]) => ({ category, options }));
}
