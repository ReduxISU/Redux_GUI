/**
 * Canonical best-to-worst ordering for `solverComplexity` values (a solver's
 * declared `complexityBucket`, Interfaces/SolverComplexityBucket.cs) -- a coarse
 * worst-case-growth classification distinct from a problem's `complexityClass`.
 * Polynomial first, then Exponential, then Factorial (each strictly worse
 * asymptotic growth than the last). Unclassified last -- it's the "not yet tagged"
 * bucket, not a real growth class, same convention as complexityClassOrder.js's
 * COMPLEXITY_CLASS_ORDER.
 *
 * Single source of truth for the `/browse` Solver Complexity facet's sort order.
 */
export const SOLVER_COMPLEXITY_ORDER = ["Polynomial", "Exponential", "Factorial", "Unclassified"];

/**
 * `SOLVER_COMPLEXITY_ORDER`'s index for `solverComplexity`, with any value not in
 * the list (a future enum addition nobody's added here yet) pushed to the very end
 * rather than resolving to `indexOf`'s -1 -- which would otherwise sort it *before*
 * Polynomial, not after Factorial/Unclassified. Use this instead of
 * `SOLVER_COMPLEXITY_ORDER.indexOf` directly whenever the value isn't guaranteed to
 * be a member of the list.
 */
export function solverComplexityRank(solverComplexity) {
  const index = SOLVER_COMPLEXITY_ORDER.indexOf(solverComplexity);
  return index === -1 ? SOLVER_COMPLEXITY_ORDER.length : index;
}

/**
 * Official display label for each `solverComplexity` wire value. The wire values
 * are already human-readable ("Polynomial", "Exponential", ...) so this is
 * currently an identity mapping, but kept as its own function -- same indirection
 * as complexityClassLabel/solverTypeLabel -- for consistency with the house pattern
 * and in case a nicer display string (e.g. "Exponential (worst-case)") is wanted
 * later without touching every call site.
 */
export const SOLVER_COMPLEXITY_LABELS = {
  Unclassified: "Unclassified",
  Polynomial: "Polynomial",
  Exponential: "Exponential",
  Factorial: "Factorial",
};

/** `SOLVER_COMPLEXITY_LABELS[value]`, falling back to the raw value itself for
 * anything not in the map so a not-yet-labeled value is never silently dropped. */
export function solverComplexityLabel(solverComplexity) {
  return SOLVER_COMPLEXITY_LABELS[solverComplexity] ?? solverComplexity;
}
