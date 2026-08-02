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
