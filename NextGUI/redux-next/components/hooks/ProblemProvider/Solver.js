import { useGenericInfo } from "../ProblemProvider";
import { requestInfo, requestSolvers } from "../../redux";
import React, { useEffect, useState } from "react";

export function useSolver(url, problemName, problemType, problemNameMap, problemInfoMap, problemInstance) {
  const state = {};
  /// Maps each problem name to its default solver name.
  [state.defaultSolverMap] = useDefaultSolverMap(url, problemInfoMap);
  [state.solverOptions] = useSolverOptions(url, problemName, problemType);
  [state.chosenSolver, state.setChosenSolver] = useChosenSolver(problemName, state.defaultSolverMap);
  [state.solverNameMap] = useSolverNameMap(url, problemNameMap);
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

function useSolverNameMap(url, problemNameMap) {
  const [solverNameMap, setSolverNameMap] = useState(new Map());

  useEffect(() => {
    const problems = Array.from(problemNameMap.keys());
    requestSolverNameMap(url, problems).then((solverMap) => {
      setSolverNameMap(solverMap);
    });
  }, [problemNameMap]);

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
  }, [problemInfoMap]);

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

function useSolverOptions(url, problemName, problemType) {
  const [solverOptions, setSolverOptions] = useState([]);

  useEffect(() => {
    (async () => {
      setSolverOptions(problemName && problemType ? (await requestSolvers(url, problemName, problemType)) ?? [] : []);
    })();
  }, [problemName, problemType]);

  // function initializeProblemJson(arr) {
  //   // Every problem should have a generic solver
  //   arr.map(function (element, index, array) {
  //     if (!problemJson.includes(element)) {
  //       if (element === "Sat3BacktrackingSolver" && problemName === "SAT3") {
  //         setChosenSolver(element);
  //         setDefaultSolver("3SAT Backtracking Solver");
  //       } else if (element === "CliqueBruteForce" && problemName === "CLIQUE") {
  //         setChosenSolver(element);
  //         setDefaultSolver("Clique Brute Force");
  //       }
  //       problemJson.push(element);
  //     }
  //   }, 80);
  // }

  return [solverOptions, setSolverOptions];
}

function useChosenSolver(problemName, defaultSolverMap) {
  const [chosenSolver, setChosenSolver] = useState("");

  useEffect(() => {
    setChosenSolver(!problemName ? "" : defaultSolverMap.get(problemName)); // Gets the file name of default solver
  }, [problemName, defaultSolverMap]);

  return [chosenSolver, setChosenSolver];
}
