import { useMemo, useState } from "react";
import { complexityClassRank } from "./complexityClassOrder";

/**
 * `oneHop`: problems directly reachable from `source` via a single reduction
 * edge -- `Object.keys(graph[source] ?? {})`.
 */
function reachableOneHop(graph, source) {
  if (!source) return null;
  return new Set(Object.keys(graph?.[source] ?? {}));
}

/**
 * `anyHops`: every problem transitively reachable from `source` via any
 * number of reduction edges, source excluded. Client-side mirror of the
 * backend's `ReductionGraphData.ReachableFrom`
 * (Redux/AdditionalControllers/Navigation/Nav_Reductions.cs) -- a plain BFS
 * over the already-fetched graph object rather than a new endpoint.
 */
function reachableAnyHops(graph, source) {
  if (!source) return null;
  const visited = new Set([source]);
  const queue = [source];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const next of Object.keys(graph?.[current] ?? {})) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  visited.delete(source);
  return visited;
}

function intersects(setA, setB) {
  for (const item of setA) {
    if (setB.has(item)) return true;
  }
  return false;
}

/**
 * Faceted filter state over the derived problem index from `useProblemIndex`,
 * plus an optional reduction-reachability filter. Facets combine with AND;
 * multiple selections within a single facet combine with OR (a problem
 * matches a facet if its value/values intersect the selected set, or the
 * set is empty meaning "no filter on that facet").
 *
 * @param problemIndex `Map<problemName, {displayName, complexityClass,
 * complexityClasses: Set, problemType, solverTypes: Set, visualizationTypes: Set,
 * hasRenderableVisualization}>` from `useProblemIndex`.
 * @param reductionGraph Raw reduction graph object from `useProblemIndex`.
 * @returns filter state, setters, the filtered problem-name list (sorted
 * classical-then-quantum, low-to-high by complexityClassRank, alphabetical by name
 * within a class -- see complexityClassOrder.js), and `clearFilters`.
 */
export function useProblemFilters(problemIndex, reductionGraph) {
  const [selectedComplexityClasses, setSelectedComplexityClasses] = useState(new Set());
  const [selectedSolverTypes, setSelectedSolverTypes] = useState(new Set());
  const [selectedProblemTypes, setSelectedProblemTypes] = useState(new Set());
  const [selectedVisualizationTypes, setSelectedVisualizationTypes] = useState(new Set());
  const [reachabilitySource, setReachabilitySource] = useState(null);
  const [reachabilityMode, setReachabilityMode] = useState("oneHop"); // "oneHop" | "anyHops"

  const reachableSet = useMemo(() => {
    if (!reachabilitySource) return null;
    return reachabilityMode === "anyHops"
      ? reachableAnyHops(reductionGraph, reachabilitySource)
      : reachableOneHop(reductionGraph, reachabilitySource);
  }, [reductionGraph, reachabilitySource, reachabilityMode]);

  const filteredProblems = useMemo(() => {
    const result = [];
    for (const [problemName, tags] of problemIndex.entries()) {
      if (
        selectedComplexityClasses.size > 0 &&
        !intersects(tags.complexityClasses, selectedComplexityClasses)
      ) {
        continue;
      }
      if (selectedSolverTypes.size > 0 && !intersects(tags.solverTypes, selectedSolverTypes)) {
        continue;
      }
      if (selectedProblemTypes.size > 0 && !selectedProblemTypes.has(tags.problemType)) {
        continue;
      }
      if (
        selectedVisualizationTypes.size > 0 &&
        !intersects(tags.visualizationTypes, selectedVisualizationTypes)
      ) {
        continue;
      }
      if (reachableSet && !reachableSet.has(problemName)) {
        continue;
      }
      result.push(problemName);
    }
    // Classical-then-quantum, low-to-high by complexityClassRank (see
    // complexityClassOrder.js); alphabetical by name as the tiebreak within a class.
    return result.sort((a, b) => {
      const rankDiff =
        complexityClassRank(problemIndex.get(a).complexityClass) -
        complexityClassRank(problemIndex.get(b).complexityClass);
      return rankDiff !== 0 ? rankDiff : a.localeCompare(b);
    });
  }, [
    problemIndex,
    selectedComplexityClasses,
    selectedSolverTypes,
    selectedProblemTypes,
    selectedVisualizationTypes,
    reachableSet,
  ]);

  function clearFilters() {
    setSelectedComplexityClasses(new Set());
    setSelectedSolverTypes(new Set());
    setSelectedProblemTypes(new Set());
    setSelectedVisualizationTypes(new Set());
    setReachabilitySource(null);
    setReachabilityMode("oneHop");
  }

  return {
    selectedComplexityClasses,
    setSelectedComplexityClasses,
    selectedSolverTypes,
    setSelectedSolverTypes,
    selectedProblemTypes,
    setSelectedProblemTypes,
    selectedVisualizationTypes,
    setSelectedVisualizationTypes,
    reachabilitySource,
    setReachabilitySource,
    reachabilityMode,
    setReachabilityMode,
    filteredProblems,
    clearFilters,
  };
}
