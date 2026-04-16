import { useGenericInfo } from "../ProblemProvider";
import { requestAllSolvers, requestAllInfo } from "../../redux";
import React, { useEffect, useState, useRef } from "react";

export function useSolver(url, problemName, problemType, problemNameMap, problemInfoMap, problemInstance) {
  const state = {};
  /// Maps each problem name to its default solver name.
  [state.defaultSolverMap] = useDefaultSolverMap(url, problemInfoMap, problemType);
  [state.solverOptions] = useSolverOptions(url, problemName, problemType);
  [state.chosenSolver, state.setChosenSolver] = useChosenSolver(problemName, state.defaultSolverMap);
  [state.solverNameMap] = useSolverNameMap(url, problemNameMap, problemType);
  [state.solvedInstance, state.setSolvedInstance] = useSolvedInstance(problemInstance, state.chosenSolver);
  return state;
}

export function useSolverInfo(url, solver) {
  // NOTE - Caleb - the following is a temporary solution to allow sat3 to be solved using the clique solver
  // remove first if once this functionality is added for all problems, the false expression was the original
  // functionality
  return useGenericInfo(
    url,
    solver === "CliqueBruteForce - via SipserReduceToCliqueStandard" ? "CliqueBruteForce" : solver
  );
}

function useSolvedInstance(problemInstance, chosenSolver) {
  const [solvedInstance, setSolvedInstance] = useState("");

  useEffect(() => {
    setSolvedInstance("");
  }, [problemInstance, chosenSolver]);

  return [solvedInstance, setSolvedInstance];
}

function useSolverNameMap(url, problemNameMap, problemType) {
  const [solverNameMap, setSolverNameMap] = useState(new Map());

  useEffect(() => {
    const problems = Array.from(problemNameMap.keys());
    (async () => {
    const allSolvers = (await requestAllSolvers(url, problemType)) ?? {};
    const allInfo = (await requestAllInfo(url, problemType)) ?? {};
    let map = new Map();

    for (const problem of problems) {
      const solvers = allSolvers[problem] ?? [];
      for (const s of solvers) {
        const solver = s.split(" ")[0];
        const info = allInfo[solver];
        map.set(s, info?.solverName || s);
      }
    }
    setSolverNameMap(map);
  })();
}, [url, problemNameMap, problemType]);


  return [solverNameMap, setSolverNameMap];
}

function useDefaultSolverMap(url, problemInfoMap, problemType) {
  const [defaultSolverMap, setDefaultSolverMap] = useState(new Map());

useEffect(() => {
  const problems = [...problemInfoMap.keys()];
  const defaultSolverNames = [...problemInfoMap.values()]
    .map((info) => info?.defaultSolver?.solverName)
    .filter(Boolean);

  (async () => {
    const allSolvers = (await requestAllSolvers(url, problemType)) ?? {};
    const allInfo = (await requestAllInfo(url, problemType)) ?? {};
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
}, [url, problemInfoMap, problemType]);


  return [defaultSolverMap, setDefaultSolverMap];
}

function useSolverOptions(url, problemName, problemType) {
  const [solverOptions, setSolverOptions] = useState([]);
  
  useEffect(() => {
    (async () => {
      if (!problemName || !problemType) {
        setSolverOptions([]);
        return;
      }
      const allSolvers = (await requestAllSolvers(url, problemType)) ?? {};
      setSolverOptions(allSolvers[problemName] ?? []);
    })();
  }, [url, problemName, problemType]);
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
