/**
 * Canonical low-to-high ordering for `complexityClass` values: classical first
 * (P, NP, NP-Complete, NP-Hard), then quantum (EQP, BQP, QCMA, QMA, QIP, MIP*) by
 * known containment -- EQP subset-of BQP subset-of QCMA subset-of QMA subset-of QIP
 * subset-of MIP* (the last jump is enormous: MIP* was proven equal to RE, i.e.
 * undecidable-scope, by Ji/Natarajan/Vidick/Wright/Yuen 2020). The quantum classes
 * (ReduxISU/Redux#396) replaced the single QuantumOracle bucket and are incomparable
 * with the classical hierarchy (see Interfaces/ComplexityClass.cs), so they sort
 * after it rather than interleaved. Unclassified last -- it's the "not yet tagged"
 * bucket, not a real complexity class.
 *
 * Single source of truth shared by the problem-picker dropdown's group order
 * (`ProblemRowReact.js`) and the filtered-results sort (`useProblemFilters.js`) so
 * the two can't drift apart.
 */
export const COMPLEXITY_CLASS_ORDER = [
  "P",
  "NP",
  "NPComplete",
  "NPHard",
  "EQP",
  "BQP",
  "QCMA",
  "QMA",
  "QIP",
  "MIPStar",
  "Unclassified",
];

/**
 * `COMPLEXITY_CLASS_ORDER`'s index for `complexityClass`, with any value not in the
 * list (a future enum addition nobody's added here yet) pushed to the very end
 * rather than resolving to `indexOf`'s -1 -- which would otherwise sort it *before*
 * P, not after NP-Hard/MIPStar. Use this instead of `COMPLEXITY_CLASS_ORDER.indexOf`
 * directly whenever the value isn't guaranteed to be a member of the list.
 */
export function complexityClassRank(complexityClass) {
  const index = COMPLEXITY_CLASS_ORDER.indexOf(complexityClass);
  return index === -1 ? COMPLEXITY_CLASS_ORDER.length : index;
}

/**
 * Official display label for each `complexityClass` wire value -- Wikipedia casing
 * for the classical ladder (P, NP, NP-Complete, NP-Hard; the raw `NPComplete`/
 * `NPHard` values have no hyphen, the display label does), and the standard acronym
 * spelling for the quantum classes (`MIPStar` -> "MIP*", since `*` isn't a valid C#/
 * JS identifier character). Single source of truth for every surface that shows a
 * complexity class to a user -- the problem-picker dropdown tooltip, the `/browse`
 * results grid and its Complexity Class filter, and the reduction tooltip's
 * "Complexity class" field.
 */
export const COMPLEXITY_CLASS_LABELS = {
  Unclassified: "Unclassified",
  P: "P",
  NP: "NP",
  NPComplete: "NP-Complete",
  NPHard: "NP-Hard",
  EQP: "EQP",
  BQP: "BQP",
  QCMA: "QCMA",
  QMA: "QMA",
  QIP: "QIP",
  MIPStar: "MIP*",
};

/** `COMPLEXITY_CLASS_LABELS[value]`, falling back to the raw value itself for
 * anything not in the map so a not-yet-labeled value is never silently dropped. */
export function complexityClassLabel(complexityClass) {
  return COMPLEXITY_CLASS_LABELS[complexityClass] ?? complexityClass;
}
