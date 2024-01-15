import { useGenericInfo, getRequest, getInfo, getProblemInfo } from "../ProblemProvider";
import React, { useEffect, useState } from "react";

export function useSolver(url, problemName, problemType, problemNameMap) {
  const state = {};
  /// Maps each problem name to its default solver name.
  [state.defaultSolverMap] = useDefaultSolverMap(url, problemNameMap);
  [state.solverOptions] = useSolverOptions(url, problemName, problemType);
  [state.chosenSolver, state.setChosenSolver] = useChosenSolver(problemName, state.defaultSolverMap);
  [state.solverNameMap] = useSolverNameMap(url, problemNameMap);
  [state.solvedInstance, state.setSolvedInstance] = useSolvedInstance(state.chosenSolver);
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

function useSolvedInstance(chosenSolver) {
  const [solvedInstance, setSolvedInstance] = useState("");

  useEffect(() => {
    setSolvedInstance("");
  }, [chosenSolver]);

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
      const data = await getAvailableSolvers(url, problem).catch((error) => console.log("SOLUTIONS REQUEST FAILED"));
      for (const s of data) {
        let solver = s.split(" ")[0];
        const info = await getInfo(url, solver).catch((error) => console.log("SOLVER INFO REQUEST FAILED"));
        map.set(s, info.solverName);
      }
    }
    return map;
  }

  return [solverNameMap, setSolverNameMap];
}

function useDefaultSolverMap(url, problemNameMap) {
  const [defaultSolverMap, setDefaultSolverMap] = useState(new Map());

  useEffect(() => {
    const problems = Array.from(problemNameMap.keys());
    requestDefaultSolverMap(url, problems).then((defaultSolverNames) => {
      requestDefaultSolverFileMap(url, problems, defaultSolverNames).then((defaultSolverFileNames) => {
        setDefaultSolverMap(defaultSolverFileNames);
      });
    });
  }, [problemNameMap]);

  //The requestDefaultSolverMap sets the solver names
  async function requestDefaultSolverMap(url, problems) {
    let map = new Map();
    for (const problem of problems) {
      await getProblemInfo(url, problem + "Generic")
        .then((info) => {
          map.set(problem, info.defaultSolver.solverName);
        })
        .catch((error) => console.log("PROBLEM INFO REQUEST FAILED"));
    }
    return map;
  }

  //The requestDefaultSolverFileMap sets the solver names by the file name
  async function requestDefaultSolverFileMap(url, problems, defaultSolverNames) {
    let map = new Map();
    for (const problem of problems) {
      const data = await getAvailableSolvers(url, problem).catch((error) => console.log("SOLUTIONS REQUEST FAILED"));
      for (const s of data) {
        let solver = s.split(" ")[0];
        const info = await getInfo(url, solver).catch((error) => console.log("SOLVER INFO REQUEST FAILED"));
        if (Array.from(defaultSolverNames.values()).includes(info.solverName)) {
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
    if (problemName) {
      const fullUrl =
        url + "Navigation/Problem_SolversRefactor/" + "?chosenProblem=" + problemName + "&problemType=" + problemType;

      initializeList(fullUrl);
    } else {
      setSolverOptions([]);
    }
  }, [problemName]);

  function initializeList(url) {
    const req = getRequest(url);
    req
      .then((data) => {
        setSolverOptions(data);
      })
      .catch((error) => console.log("GET REQUEST FAILED SEARCHBAR SOLVER"));
  }

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
  }, [problemName]);

  return [chosenSolver, setChosenSolver];
}

async function getAvailableSolvers(url, problem) {
  return await fetch(url + `Navigation/Problem_SolversRefactor/?chosenProblem=${problem}&problemType=NPC`).then(
    (resp) => {
      if (resp.ok) {
        return resp.json();
      }
    }
  );
}
