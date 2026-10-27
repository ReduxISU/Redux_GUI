// Reading an item's tag LISTS off an API object, and the any-tag-matches rules the
// filters built on them use (issue #409). Since ReduxISU/Redux#946 an item can carry
// several tags from one category, so the API sends `problemTypes`, `solverTypes`,
// `reductionTypes` and `visualizationTypes` as arrays in a fixed order, plus
// `problemVariants` (Decision / Optimization) on every problem. The old single fields
// (`problemType`, `solverType`, ...) are deprecated stand-ins holding only the first
// entry of each list. tagList() is the one place allowed to fall back to them, so the
// GUI keeps working against a backend that predates the lists.
//
// Deliberately free of imports (React, other modules): node --test loads this file
// directly (tests/unit/tag-lists.test.mjs), the same way it would any plain module.

/** The fallback tag for an item that declares none, same as every other facet's. */
export const UNCLASSIFIED = "Unclassified";

function capitalize(field) {
  return field.charAt(0).toUpperCase() + field.slice(1);
}

/**
 * Every tag `obj` declares in one category, in the backend's order. Reads the list
 * field (`listField`, e.g. "solverTypes") when present and non-empty; otherwise
 * falls back to the deprecated single field (`singleField`, e.g. "solverType") as a
 * one-entry list, so an older backend still yields that item's only tag; otherwise
 * `[]`. Each field is also tried PascalCased ("SolverTypes"/"SolverType"), matching
 * the camel-then-Pascal fallback the rest of the GUI reads API fields with. Blank
 * entries are dropped. Omit `singleField` for a category with no single-field
 * predecessor (`problemVariants`).
 *
 * @example tagList({ solverTypes: ["Greedy", "Approximation"] }, "solverTypes", "solverType")
 * // ["Greedy", "Approximation"]
 * @example tagList({ solverType: "Greedy" }, "solverTypes", "solverType") // ["Greedy"]
 */
export function tagList(obj, listField, singleField) {
  const list = obj?.[listField] ?? obj?.[capitalize(listField)];
  if (Array.isArray(list)) {
    const tags = list.filter((tag) => typeof tag === "string" && tag !== "");
    if (tags.length > 0) return tags;
  }
  if (singleField) {
    const single = obj?.[singleField] || obj?.[capitalize(singleField)];
    if (typeof single === "string" && single !== "") return [single];
  }
  return [];
}

/**
 * `tagList`, or `["Unclassified"]` when the item declares nothing -- for facets,
 * where an untagged item still has to be countable and selectable as "Unclassified"
 * (e.g. every problem's variant, against a backend without `problemVariants`).
 */
export function tagListOrUnclassified(obj, listField, singleField) {
  const tags = tagList(obj, listField, singleField);
  return tags.length > 0 ? tags : [UNCLASSIFIED];
}

/**
 * Any-tag-matches rule for one facet: true when `selected` (a Set of raw wire
 * values) is empty, meaning no filter on that facet, or when at least one of `tags`
 * (any iterable -- an Array or a Set) is selected. An item with tags
 * ["Greedy", "Approximation"] therefore matches a Greedy filter, an Approximation
 * filter, or both.
 */
export function anyTagMatches(tags, selected) {
  if (!selected || selected.size === 0) return true;
  for (const tag of tags ?? []) {
    if (selected.has(tag)) return true;
  }
  return false;
}

/**
 * Combined Solver Type + Solver Complexity rule. Both facets describe the SAME
 * solver, so when both have a selection a problem matches only if at least one
 * single solver has a type in `types` AND a complexity bucket in `complexities`
 * (a problem with a Brute Force solver that is exponential and a different,
 * polynomial solver of another type must NOT match "Brute Force + Polynomial").
 * A solver's type matches when any of its tags does (`solver.types` is its whole
 * `solverTypes` list). When only one facet has a selection it falls back to the
 * plain per-facet check against that facet's aggregate Set; an empty selection
 * never filters. OR semantics hold within each facet.
 *
 * @param tags A problem's entry from useProblemIndex: `solvers: [{types, complexity}]`
 * plus the aggregate `solverTypes`/`solverComplexities` Sets.
 */
export function solverFiltersMatch(tags, types, complexities) {
  if (types.size > 0 && complexities.size > 0) {
    return tags.solvers.some(
      (solver) => anyTagMatches(solver.types, types) && complexities.has(solver.complexity),
    );
  }
  if (types.size > 0) return anyTagMatches(tags.solverTypes, types);
  if (complexities.size > 0) return anyTagMatches(tags.solverComplexities, complexities);
  return true;
}

/**
 * A `compareKeys` for buildFacetOptions that sorts by position in `order` (e.g. the
 * `/Navigation/ProblemVariants` list), with values missing from it after every listed
 * one and alphabetical among themselves -- so a facet still renders sensibly when
 * that list failed to load (older backend) and `order` is empty.
 */
export function compareByOrder(order) {
  const rank = (value) => {
    const index = (order ?? []).indexOf(value);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  return (a, b) => rank(a) - rank(b) || a.localeCompare(b);
}
