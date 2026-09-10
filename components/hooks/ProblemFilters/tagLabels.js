// Official display labels for tag vocabularies whose wire values are PascalCase
// identifiers (C# enum member names), not intended for direct display -- e.g.
// "BruteForce" rather than "Brute Force". Hand-authored per value, same convention
// as complexityClassOrder.js's COMPLEXITY_CLASS_LABELS and ReduceToRowReact.js's
// existing REDUCTION_COST_LABELS, rather than a generic PascalCase-splitting
// function: a handful of these are compound terms with their own fixed spelling
// ("Divide and Conquer" keeps "and" lowercase; NP-prefixed complexity classes use a
// hyphen, not a space -- see complexityClassOrder.js) that a mechanical splitter
// would get wrong.

/** Interfaces/SolverType.cs's vocabulary. */
export const SOLVER_TYPE_LABELS = {
  Unclassified: "Unclassified",
  BruteForce: "Brute Force",
  Greedy: "Greedy",
  DynamicProgramming: "Dynamic Programming",
  Approximation: "Approximation",
  Heuristic: "Heuristic",
  DivideAndConquer: "Divide and Conquer",
  Quantum: "Quantum",
  StateTransition: "State Transition",
  BreadthFirstSearch: "Breadth First Search",
  DepthFirstSearch: "Depth First Search",
  Backtracking: "Backtracking",
  Constructive: "Constructive",
};

/** `SOLVER_TYPE_LABELS[value]`, falling back to the raw value itself for anything
 * not in the map so a not-yet-labeled value is never silently dropped. */
export function solverTypeLabel(solverType) {
  return SOLVER_TYPE_LABELS[solverType] ?? solverType;
}

/** Interfaces/ReductionType.cs's vocabulary (ReduxISU/Redux#396) -- the Garey &
 * Johnson NP-completeness proof-technique taxonomy. */
export const REDUCTION_TYPE_LABELS = {
  Unclassified: "Unclassified",
  Restriction: "Restriction",
  LocalReplacement: "Local Replacement",
  ComponentDesign: "Component Design",
};

/** `REDUCTION_TYPE_LABELS[value]`, falling back to the raw value itself for
 * anything not in the map so a not-yet-labeled value is never silently dropped. */
export function reductionTypeLabel(reductionType) {
  return REDUCTION_TYPE_LABELS[reductionType] ?? reductionType;
}
