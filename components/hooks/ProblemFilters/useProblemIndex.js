import { useEffect, useState } from "react";
import {
  requestAllInfo,
  requestAllProblems,
  requestAllSolvers,
  requestAllVisualizations,
  requestAllVisualizationTypes,
  requestReductionGraph,
} from "../../redux";
import { isRenderable } from "../../Visualization/svgs/renderability";

/**
 * Read-only, derived index over every problem's declared metadata tags --
 * complexity class (both the raw declared value and the NP-Complete-implies-NP
 * expanded set), problem type, the set of solver types it has solvers for, the
 * set of visualization types it has visualizations for, and whether any of
 * those visualizations are actually renderable by this GUI. Deliberately
 * independent of `useProblemProvider`'s stateful selection-reducer tree:
 * `/browse` needs a read-only index of ALL problems at once, not a
 * single-selection flow.
 *
 * Also returns the raw reduction graph (from `requestReductionGraph`) for
 * reachability filtering -- see `useProblemFilters`.
 *
 * @param url Base API URL, e.g. `/api/redux/`.
 * @returns `{ problemIndex: Map<problemName, {complexityClass: string,
 * complexityClasses: Set<string>, problemType: string, solverTypes: Set<string>,
 * visualizationTypes: Set<string>, hasRenderableVisualization: boolean}>,
 * reductionGraph: object, loading: boolean }`.
 */
export function useProblemIndex(url) {
  const [problemIndex, setProblemIndex] = useState(new Map());
  const [reductionGraph, setReductionGraph] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      const [problems, allInfo, allSolvers, allVisualizations, allVisualizationTypes, graph] =
        await Promise.all([
          requestAllProblems(url),
          requestAllInfo(url),
          requestAllSolvers(url),
          requestAllVisualizations(url),
          requestAllVisualizationTypes(url),
          requestReductionGraph(url),
        ]);

      if (cancelled) return;

      const problemNames = problems ?? [];
      const info = allInfo ?? {};
      const solversByProblem = allSolvers ?? {};
      const visualizationsByProblem = allVisualizations ?? {};
      const visualizationTypes = allVisualizationTypes ?? null;

      // Same fallback shape as useVisualizationTypeMap
      // (components/hooks/ProblemProvider/Visualization.js): prefer the
      // dedicated allVisualizationTypes endpoint, fall back to reading
      // visualizationType off allInfo when that endpoint isn't deployed yet.
      const resolveVisualizationType = (className) => {
        if (visualizationTypes) {
          return visualizationTypes[className];
        }
        return info[className]?.visualizationType || info[className]?.VisualizationType;
      };

      const map = new Map();
      for (const problemName of problemNames) {
        const problemInfo = info[problemName];
        const complexityClass =
          problemInfo?.complexityClass || problemInfo?.ComplexityClass || "Unclassified";
        // NP-Complete is a subset of NP by definition (Interfaces/ComplexityClass.cs's
        // doc comment on NP) -- the engine expands that implication here rather than
        // requiring every NP-Complete problem to redundantly declare both, so a problem
        // counts toward (and can be filtered by) both facet options.
        const complexityClasses = new Set([complexityClass]);
        if (complexityClass === "NPComplete") complexityClasses.add("NP");

        const problemType =
          problemInfo?.problemType || problemInfo?.ProblemType || "Unclassified";

        const solverTypes = new Set();
        for (const solverClassName of solversByProblem[problemName] ?? []) {
          const solverInfo = info[solverClassName];
          const solverType = solverInfo?.solverType || solverInfo?.SolverType || "Unclassified";
          solverTypes.add(solverType);
        }

        const visualizationTypeSet = new Set();
        let hasRenderableVisualization = false;
        for (const visClassName of visualizationsByProblem[problemName] ?? []) {
          const type = resolveVisualizationType(visClassName);
          if (type) {
            visualizationTypeSet.add(type);
          }
          if (isRenderable(type)) {
            hasRenderableVisualization = true;
          }
        }

        map.set(problemName, {
          complexityClass,
          complexityClasses,
          problemType,
          solverTypes,
          visualizationTypes: visualizationTypeSet,
          hasRenderableVisualization,
        });
      }

      setProblemIndex(map);
      setReductionGraph(graph ?? {});
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { problemIndex, reductionGraph, loading };
}
