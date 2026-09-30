/**
 * Fixed display order for `problemType` values, matching the declaration order
 * in Interfaces/ProblemType.cs (Unclassified excluded -- every problem has a
 * real declared type; see ProblemType_Tests.cs's ratchet pair). Single source
 * of truth shared by the problem-picker's filter menu (`ProblemFilterMenu.js`)
 * and anywhere else a problem type needs a stable order or display label.
 */
export const PROBLEM_TYPE_ORDER = [
  "GraphTheory",
  "NetworkDesign",
  "SetsAndPartitions",
  "StorageAndRetrieval",
  "SequencingAndScheduling",
  "MathematicalProgramming",
  "AlgebraAndNumberTheory",
  "GamesAndPuzzles",
  "Logic",
  "AutomataAndLanguages",
  "ProgramOptimization",
  "ComputationalGeometry",
  "Miscellaneous",
];

/** Official display label for each `problemType` wire value. */
export const PROBLEM_TYPE_LABELS = {
  Unclassified: "Unclassified",
  GraphTheory: "Graph Theory",
  NetworkDesign: "Network Design",
  SetsAndPartitions: "Sets and Partitions",
  StorageAndRetrieval: "Storage and Retrieval",
  SequencingAndScheduling: "Sequencing and Scheduling",
  MathematicalProgramming: "Mathematical Programming",
  AlgebraAndNumberTheory: "Algebra and Number Theory",
  GamesAndPuzzles: "Games and Puzzles",
  Logic: "Logic",
  AutomataAndLanguages: "Automata and Languages",
  ProgramOptimization: "Program Optimization",
  ComputationalGeometry: "Computational Geometry",
  Miscellaneous: "Miscellaneous",
};

/** `PROBLEM_TYPE_LABELS[value]`, falling back to the raw value itself for
 * anything not in the map so a not-yet-labeled value is never silently dropped. */
export function problemTypeLabel(problemType) {
  return PROBLEM_TYPE_LABELS[problemType] ?? problemType;
}
