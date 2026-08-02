import { useGenericInfo } from "../ProblemProvider";
import { requestAllSolvers, requestAllInfo } from "../../redux";
import React, { useEffect, useState, useRef } from "react";

export function useSolver(url, problemName, problemNameMap, problemInfoMap, problemInstance) {
  const state = {};
  /// Maps each problem name to its default solver name.
  [state.defaultSolverMap] = useDefaultSolverMap(url, problemInfoMap);
  [state.solverOptions] = useSolverOptions(url, problemName);
  [state.chosenSolver, state.setChosenSolver] = useChosenSolver(problemName, state.defaultSolverMap);
  [state.solverNameMap] = useSolverNameMap(url, problemNameMap);
  [state.solvedInstance, state.setSolvedInstance] = useSolvedInstance(problemInstance, state.chosenSolver);
  return state;
}

export function useSolverInfo(url, solver) {
  return useGenericInfo(url, solver);
}

function useSolvedInstance(problemInstance, chosenSolver) {
  const [solvedInstance, setSolvedInstance] = useState("");

  useEffect(() => {
    setSolvedInstance("");
  }, [problemInstance, chosenSolver]);

  return [solvedInstance, setSolvedInstance];
}

// Builds the label shown for a solver in the dropdown. When the backend has
// classified the solver (a non-empty, non-"Unclassified" solverType plus a
// non-empty complexity), append that info; otherwise fall back to the plain
// solver name so untagged solvers don't render an ugly "(Unclassified · )".
function formatSolverLabel(info, fallback) {
  const name = info?.solverName || fallback;
  const solverType = info?.solverType;
  const complexity = info?.complexity;

  if (solverType && complexity && solverType !== "Unclassified") {
    return `${name} (${solverType} · ${complexity})`;
  }

  return name;
}

function useSolverNameMap(url, problemNameMap) {
  const [solverNameMap, setSolverNameMap] = useState(new Map());

  useEffect(() => {
    const problems = Array.from(problemNameMap.keys());
    (async () => {
      const allSolvers = (await requestAllSolvers(url)) ?? {};
      const allInfo = (await requestAllInfo(url)) ?? {};
      let map = new Map();

      for (const problem of problems) {
        const solvers = allSolvers[problem] ?? [];
        for (const s of solvers) {
          const solver = s.split(" ")[0];
          const info = allInfo[solver];
          map.set(s, formatSolverLabel(info, s));
        }
      }
      setSolverNameMap(map);
    })();
  }, [url, problemNameMap]);

  return [solverNameMap, setSolverNameMap];
}

function useDefaultSolverMap(url, problemInfoMap) {
  const [defaultSolverMap, setDefaultSolverMap] = useState(new Map());

  useEffect(() => {
  const problems = [...problemInfoMap.keys()];
  const defaultSolverNames = [...problemInfoMap.values()]
    .map((info) => info?.defaultSolver?.solverName)
    .filter(Boolean);

  (async () => {
    const allSolvers = (await requestAllSolvers(url)) ?? {};
    const allInfo = (await requestAllInfo(url)) ?? {};

    let map = new Map();
    for (const problem of problems) {
      const solvers = allSolvers[problem] ?? [];
      for (const s of solvers) {
        const solver = s.split(" ")[0];
        const info = allInfo[solver];
        if (info && defaultSolverNames.includes(info.solverName)) {
          map.set(problem, s);
        }
      }
    }
    setDefaultSolverMap(map);
  })();
}, [url, problemInfoMap]);

  return [defaultSolverMap, setDefaultSolverMap];
}

function useSolverOptions(url, problemName) {
  const [solverOptions, setSolverOptions] = useState([]);

  useEffect(() => {
    (async () => {
      if (!problemName) {
        setSolverOptions([]);
        return;
      }
      const allSolvers = (await requestAllSolvers(url)) ?? {};
      setSolverOptions(allSolvers[problemName] ?? []);
    })();
  }, [problemName, url]);

  return [solverOptions, setSolverOptions];
}

function useChosenSolver(problemName, defaultSolverMap) {
  const [chosenSolver, setChosenSolver] = useState("");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!problemName || defaultSolverMap.size === 0) return;

    let solverVar = !problemName ? "" : defaultSolverMap.get(problemName);
    const storedData = null;

    if (isFirstRender.current) {
      // First render: read from localStorage
      if (storedData) {
        const allData = JSON.parse(storedData);
        solverVar = allData.solver;
      }
      isFirstRender.current = false;
    }

    setChosenSolver(solverVar);

  }, [problemName, defaultSolverMap]);

  return [chosenSolver, setChosenSolver];
}
