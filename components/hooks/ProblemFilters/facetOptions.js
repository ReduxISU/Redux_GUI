// Builds `[{key, label, count}]` for a facet: how many problems have each
// distinct value, derived from the actual data rather than a hardcoded enum
// list, so newly-declared tag values show up automatically. Options are
// alphabetical by key unless `compareKeys` is given (e.g. complexityClassRank-based
// ordering for the Complexity Class facet); the label is the raw key unless
// `labelFor` is given (e.g. complexityClassLabel/solverTypeLabel for a wire value
// that isn't meant for direct display, like "NPComplete" or "BruteForce").
export function buildFacetOptions(
  problemIndex,
  pickValues,
  compareKeys = (a, b) => a.localeCompare(b),
  labelFor = (key) => key,
) {
  const counts = new Map();
  for (const tags of problemIndex.values()) {
    const values = pickValues(tags);
    for (const value of values) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => compareKeys(a[0], b[0]))
    .map(([key, count]) => ({ key, label: labelFor(key), count }));
}

/**
 * Builds `[{key, label, count}]` for a facet with a caller-fixed key order and
 * display labels, rather than deriving the option list (and its alphabetical order)
 * from what's actually present in the data. Every key in `orderedKeys` is included
 * even if its count is 0 -- unlike `buildFacetOptions`, this is for facets whose
 * option set is a fixed, closed vocabulary the caller wants to always render in a
 * specific order (e.g. the P/NP/NP-Complete/NP-Hard complexity-class ladder, or the
 * Problem Type taxonomy).
 *
 * @param orderedKeys Raw values, in the exact order they should render.
 * @param pickValues `(tags) => iterable of raw values` -- a problem counts toward a
 * key if that key is among the values returned for it (supports both a
 * single-value-per-problem facet and a multi-value one, e.g. Complexity Class's
 * NP-Complete-implies-NP expansion).
 * @param labelFor Optional `(key) => displayLabel`; defaults to the raw key.
 */
export function buildFixedOrderFacetOptions(problemIndex, orderedKeys, pickValues, labelFor = (key) => key) {
  const counts = new Map(orderedKeys.map((key) => [key, 0]));
  for (const tags of problemIndex.values()) {
    for (const value of pickValues(tags)) {
      if (counts.has(value)) {
        counts.set(value, counts.get(value) + 1);
      }
    }
  }
  return orderedKeys.map((key) => ({ key, label: labelFor(key), count: counts.get(key) }));
}
