import { useGenericInfo } from "../ProblemProvider";
import { requestInfo, requestSolvers } from "../../redux";
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

function useSolverNameMap(url, problemNameMap) {
  const [solverNameMap, setSolverNameMap] = useState(new Map());

  useEffect(() => {
    const problems = Array.from(problemNameMap.keys());
    requestSolverNameMap(url, problems).then((solverMap) => {
      setSolverNameMap(solverMap);
    });
  }, [problemNameMap, url]);

  //The following the functions are used to set the solver names
  async function requestSolverNameMap(url, problems) {
    let map = new Map();
    for (const problem of problems) {
      const solvers = (await requestSolvers(url, problem)) ?? [];
      for (const s of solvers) {
        let solver = s.split(" ")[0];
        const info = await requestInfo(url, solver);
        if (info) {
          map.set(s, info.solverName);
        }
      }
    }
    return map;
  }

  return [solverNameMap, setSolverNameMap];
}

function useDefaultSolverMap(url, problemInfoMap) {
  const [defaultSolverMap, setDefaultSolverMap] = useState(new Map());

  useEffect(() => {
    const problems = [...problemInfoMap.keys()];
    const defaultSolverNames = [...problemInfoMap.values()].map((info) => info.defaultSolver.solverName);
    requestDefaultSolverFileMap(url, problems, defaultSolverNames).then((defaultSolverFileNames) => {
      setDefaultSolverMap(defaultSolverFileNames);
    });
  }, [problemInfoMap, url]);

  //The requestDefaultSolverFileMap sets the solver names by the file name
  async function requestDefaultSolverFileMap(url, problems, defaultSolverNames) {
    let map = new Map();
    for (const problem of problems) {
      const solvers = (await requestSolvers(url, problem)) ?? [];
      for (const s of solvers) {
        let solver = s.split(" ")[0];
        const info = await requestInfo(url, solver);
        if (info && defaultSolverNames.includes(info.solverName)) {
          map.set(problem, s);
        }
      }
    }
    return map;
  }

  return [defaultSolverMap, setDefaultSolverMap];
}

function useSolverOptions(url, problemName) {
  const [solverOptions, setSolverOptions] = useState([]);

  useEffect(() => {
    (async () => {
      setSolverOptions(problemName ? (await requestSolvers(url, problemName)) ?? [] : []);
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
