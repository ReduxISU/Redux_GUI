/**
 * ProblemProvider.js
 *
 * This component defines the global state for the Redux application.
 *
 * It uses a global "context" which any individual component can then tap into by using the useContext react hook.
 * Essentially, all the methods in here are setters, and so components can either use the context hook to access a read only
 * global state value, or use a provided setter method to edit the state of that global state value.
 *
 * @author Alex Diviney
 */

import React, { useEffect } from "react";
import { useState, createContext } from "react";

export const ProblemContext = createContext();

export default function ProblemProvider({ url, children }) {
  // Alex it might be better to leave this [problemName] as an empty string
  // When the page is loaded first the problem name was
  // DEFAULTTYPE before it changed to SAT3, so I changed it to empty string

  const state = {};

  [state.problemType, state.setProblemType] = useState("NPC");
  [state.problemName, state.setProblemName] = useState("");
  [state.problemInstance, state.setProblemInstance] = useState("{{1,2,3},{1,2},GENERIC}"); // Careful about changing this value, the application boot up sequence is dependent on having a default value.
  [state.problemNameMap, state.setProblemNameMap] = useProblemNameMap(url);

  [state.defaultVerifierMap, state.setDefaultVerifierMap] = useDefaultVerifierMap({ url: url, ...state });
  [state.verifierOptions, state.setVerifierOptions] = useVerifierOptions({ url: url, ...state });
  [state.chosenVerifier, state.setChosenVerifier] = useChosenVerifier(state);
  [state.verifierNameMap, state.setVerifierNameMap] = useVerifierNameMap({ url: url, ...state });

  /// Maps each problem name to its default solver name.
  [state.defaultSolverMap, state.setDefaultSolverMap] = useDefaultSolverMap({ url: url, ...state });
  [state.solverOptions, state.setSolverOptions] = useSolverOptions({ url: url, ...state });
  [state.chosenSolver, state.setChosenSolver] = useChosenSolver(state);
  [state.solverNameMap, state.setSolverNameMap] = useSolverNameMap({ url: url, ...state });
  [state.solvedInstance, state.setSolvedInstance] = useSolvedInstance({ ...state });

  [state.reduceToOptions, state.setReduceToOptions] = useReduceToOptions({ url: url, ...state });
  [state.chosenReduceTo, state.setChosenReduceTo] = useChosenReduceTo(state);
  [state.reductionNameMap, state.setReductionNameMap] = useReductionNameMap({ url: url, ...state });
  [state.reductionTypeOptions, state.setReductionTypeOptions] = useReductionTypeOptions({ url: url, ...state });
  [state.chosenReductionType, state.setChosenReductionType] = useChosenReductionType(state);
  [state.reducedInstance, state.setReducedInstance] = useState("");

  return <ProblemContext.Provider value={state}>{children}</ProblemContext.Provider>;
}

function useGenericInfo(url, info) {
  const [genericInfo, setGenericInfo] = useState({});

  useEffect(() => {
    if (!info) {
      setGenericInfo({});
    } else {
      getInfo(url, info)
        .then((info) => {
          setGenericInfo(info);
        })
        .catch((error) => console.log("PROBLEM INFO REQUEST FAILED"));
    }
  }, [info]);

  return genericInfo; // There should be no reason to set the information
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

export function useVerifierInfo(url, verifier) {
  return useGenericInfo(url, verifier);
}

export function useReducerInfo(url, reducer) {
  return useGenericInfo(url, (reducer ?? "").split("-")[0]);
}

export function useProblemInfo(url, problemName) {
  const [problemInfo, setProblemInfo] = useState({});

  useEffect(() => {
    if (!problemName) {
      setProblemInfo({});
    } else {
      getProblemInfo(url, problemName + "Generic")
        .then((info) => {
          setProblemInfo(info);
        })
        .catch((error) => console.log("PROBLEM INFO REQUEST FAILED"));
    }
  }, [problemName]);

  return problemInfo; // There should be no reason to set the problem information
}

function useSolvedInstance({ chosenSolver }) {
  const [solvedInstance, setSolvedInstance] = useState("");

  useEffect(() => {
    setSolvedInstance("");
  }, [chosenSolver]);

  return [solvedInstance, setSolvedInstance];
}

function useProblemNameMap(baseUrl) {
  const [problemNameMap, setProblemNameMap] = useState(new Map());

  useEffect(() => {
    initializeList(`${baseUrl}navigation/NPC_ProblemsRefactor/`);
  }, []);

  async function initializeList(url) {
    const problems = await getRequest(url).catch((error) => console.log("GET REQUEST FAILED", error));
    const problemNames = await requestProblemNameMap(baseUrl, problems);
    setProblemNameMap(problemNames);
  }

  async function requestProblemNameMap(url, problems) {
    let map = new Map();
    for (const problem of problems) {
      await getProblemInfo(url, problem + "Generic")
        .then((info) => {
          map.set(problem, info.problemName);
        })
        .catch((error) => console.log("PROBLEM INFO REQUEST FAILED"));
    }
    return map;
  }

  return [problemNameMap, setProblemNameMap];
}

function useDefaultVerifierMap({ url, problemNameMap }) {
  const [defaultVerifierMap, setDefaultVerifierMap] = useState(new Map());

  useEffect(() => {
    const problems = Array.from(problemNameMap.keys());
    requestDefaultVerifierMap(url, problems).then((defaultVerifierNames) => {
      requestDefaultVerifierFileMap(url, problems, defaultVerifierNames).then((defaultVerifierFileNames) => {
        setDefaultVerifierMap(defaultVerifierFileNames);
      });
    });
  }, [problemNameMap]);

  //The requestDefaultVerifierMap sets the verifier names
  async function requestDefaultVerifierMap(url, problems) {
    let map = new Map();
    for (const problem of problems) {
      await getProblemInfo(url, problem + "Generic")
        .then((info) => {
          map.set(problem, info.defaultVerifier.verifierName);
        })
        .catch((error) => console.log("PROBLEM INFO REQUEST FAILED"));
    }
    return map;
  }

  //The requestDefaultVerifierFileMap sets the verifier names by the file name
  async function requestDefaultVerifierFileMap(url, problems, defaultVerifierNames) {
    let map = new Map();
    for (const problem of problems) {
      const data = await getAvailableVerifiers(url, problem).catch((error) => console.log("SOLUTIONS REQUEST FAILED"));
      for (const v of data) {
        let verifier = v.split(" ")[0];
        const info = await getInfo(url, verifier).catch((error) => console.log("SOLVER INFO REQUEST FAILED"));
        if (info === undefined) {
          continue;
        }
        if (Array.from(defaultVerifierNames.values()).includes(info.verifierName)) {
          map.set(problem, v);
        }
      }
    }
    return map;
  }

  return [defaultVerifierMap, setDefaultVerifierMap];
}

function useVerifierOptions({ url, problemName, problemType }) {
  const [verifierOptions, setVerifierOptions] = useState([]);

  useEffect(() => {
    if (problemName) {
      const fullUrl =
        url + "Navigation/Problem_VerifiersRefactor/" + "?chosenProblem=" + problemName + "&problemType=" + problemType;

      initializeList(fullUrl);
    } else {
      setVerifierOptions([]);
    }
  }, [problemName]);

  function initializeList(url) {
    const req = getRequest(url);
    req
      .then((data) => {
        setVerifierOptions(data);
      })
      .catch((error) => console.log("GET REQUEST FAILED SEARCHBAR VERIFIER"));
  }

  // function initializeProblemJson(arr) {
  //   arr.map(function (element, index, array) {
  //     if (!problemJson.includes(element)) {
  //       if (element === "KadensSimpleVerifier" && problemName === "SAT3") {
  //         setChosenVerifier(element);
  //         setDefaultVerifier("Kaden Simple Verifier");
  //       } else if (element === "CliqueVerifier" && problemName === "CLIQUE") {
  //         setChosenVerifier(element);
  //         setDefaultVerifier("Generic Verifier");
  //       }
  //       problemJson.push(element);
  //     }
  //   }, 80);
  // }

  return [verifierOptions, setVerifierOptions];
}

function useChosenVerifier({ problemName, defaultVerifierMap }) {
  const [chosenVerifier, setChosenVerifier] = useState("");

  useEffect(() => {
    setChosenVerifier(!problemName ? "" : defaultVerifierMap.get(problemName));
  }, [problemName, defaultVerifierMap]);

  return [chosenVerifier, setChosenVerifier];
}

function useVerifierNameMap({ url, problemNameMap }) {
  const [verifierNameMap, setVerifierNameMap] = useState(new Map());

  useEffect(() => {
    const problems = Array.from(problemNameMap.keys());
    requestVerifierNameMap(url, problems).then((verifierMap) => {
      setVerifierNameMap(verifierMap);
    });
  }, [problemNameMap]);

  //The following the functions are used to set the verifier names
  async function requestVerifierNameMap(url, problems) {
    let map = new Map();
    for (const problem of problems) {
      const data = await getAvailableVerifiers(url, problem).catch((error) =>
        console.log("VERIFIER INFO REQUEST FAILED")
      );
      for (const verifier of data) {
        const info = await getInfo(url, verifier).catch((error) => console.log("VERIFIER REQUEST FAILED"));
        if (info === undefined) {
          continue;
        }
        map.set(verifier, info.verifierName);
      }
    }
    return map;
  }

  return [verifierNameMap, setVerifierNameMap];
}

function useSolverNameMap({ url, problemNameMap }) {
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

function useDefaultSolverMap({ url, problemNameMap }) {
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

function useSolverOptions({ url, problemName, problemType }) {
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

function useChosenSolver({ problemName, defaultSolverMap }) {
  const [chosenSolver, setChosenSolver] = useState("");

  useEffect(() => {
    setChosenSolver(!problemName ? "" : defaultSolverMap.get(problemName)); // Gets the file name of default solver
  }, [problemName]);

  return [chosenSolver, setChosenSolver];
}

function useReductionTypeOptions({ url, problemName, problemType, chosenReduceTo }) {
  const [reductionTypeOptions, setReductionTypeOptions] = useState([]);

  useEffect(() => {
    if (chosenReduceTo) {
      const fullUrl =
        url +
        "Navigation/NPC_NavGraph/reductionPath/" +
        "?reducingFrom=" +
        problemName +
        "&reducingTo=" +
        chosenReduceTo +
        "&problemType=" +
        problemType;

      initializeList(fullUrl);
    } else {
      setReductionTypeOptions([]);
    }
  }, [chosenReduceTo]);

  function initializeProblemJson(arr) {
    let path = "";
    arr.map((reduction) => {
      path += reduction[0] + "-";
    });
    setReductionTypeOptions([path.slice(0, -1)]);

    // if (arr.length == 1) {
    //   arr = arr[0];
    //   arr.map(function (element, index, array) {
    //     if (!problemJson.includes(element)) {
    //       // if (element === "SipserReduceToCliqueStandard" && chosenReduceTo === "CLIQUE") {
    //       //   setChosenReductionType(element);
    //       //   setReductionType("Sipser's Clique Reduction");

    //       //   requestReducedInstance(props.url, element, problemInstance)
    //       //     .then((data) => {
    //       //       // propNo reduction method available. Please choose a reduce-tos.setInstance(data.reductionTo.instance);
    //       //       setReducedInstance(data.reductionTo.instance);
    //       //     })
    //       //     .catch((error) => console.log("REDUCTION FAILED, one or more properties was invalid"));
    //       // }

    //       // // Auto populate "select reduction" field with sipserReduceToVC when reducing from Clique to Vertex Cover
    //       // else if (element === "sipserReduceToVC" && chosenReduceTo === "VERTEXCOVER") {
    //       //   setChosenReductionType(element);
    //       //   setReductionType("Sipser's Vertex Cover Reduction");
    //       //   requestReducedInstance(props.url, element, problemInstance)
    //       //     .then((data) => {
    //       //       // props.setInstance(data.reductionTo.instance);
    //       //       setReducedInstance(data.reductionTo.instance);
    //       //     })
    //       //     .catch((error) => console.log("REDUCTION FAILED, one or more properties was invalid"));
    //       // }
    //       setChosenReductionType(element);
    //       problemJson.push(element);
    //     }
    //   }, 80);
    // } else {
    //   let path = "";
    //   arr.map((reduction) => {
    //     path += reduction[0] + "-";
    //   });
    //   // if (path === "SipserReduceToCliqueStandard-sipserReduceToVC-" && chosenReduceTo === "VERTEXCOVER") {
    //   //   setChosenReductionType(path.slice(0, -1));
    //   //   setReductionType("Sipser's Clique Reduction - Sipser's Vertex Cover Reduction");
    //   // }
    //   problemJson.push(path.slice(0, -1));
    // }
  }

  function initializeList(url) {
    if (chosenReduceTo !== "") {
      const req = getRequest(url);
      req
        .then((data) => {
          initializeProblemJson(data);
        })
        .catch((error) => console.log("GET REQUEST FAILED SEARCHBAR SELECT REDUCTION TYPE"));
    }
  }

  // async function requestReducedInstance(url, reductionName, reduceFrom) {
  //   var parsedInstance = reduceFrom.replaceAll("&", "%26");

  //   return await fetch(url + reductionName + "/reduce?" + "problemInstance=" + parsedInstance).then((resp) => {
  //     if (resp.ok) {
  //       return resp.json();
  //     }
  //   });
  // }

  return [reductionTypeOptions, setReductionTypeOptions];
}

function useChosenReductionType({ problemName, chosenReduceTo, reductionTypeOptions }) {
  const [chosenReductionType, setChosenReductionType] = useState("");

  useEffect(() => {
    setChosenReductionType("");
  }, [problemName, chosenReduceTo]);

  useEffect(() => {
    if (!reductionTypeOptions.length || reductionTypeOptions[0] === "") {
      setChosenReductionType("");
    }
  }, [reductionTypeOptions]);

  return [chosenReductionType, setChosenReductionType];
}

function useReduceToOptions({ url, problemName, problemType }) {
  const [reduceToOptions, setReduceToOptions] = useState([]);

  useEffect(() => {
    if (problemName) {
      const fullUrl =
        url +
        "Navigation/NPC_NavGraph/availableReductions/" +
        "?chosenProblem=" +
        problemName +
        "&problemType=" +
        problemType;

      initializeList(fullUrl);
    } else {
      setReduceToOptions([]);
    }
  }, [problemName]);

  function initializeList(url) {
    const req = getRequest(url);
    req
      .then((data) => {
        setReduceToOptions(data);
      })
      .catch((error) => console.log("GET REQUEST FAILED SELECT REDUCE TO"));
  }

  // function initializeProblemJson(arr) {
  //   // var elementChosen = false;
  //   arr.map(function (element, index, array) {
  //     if (!problemJson.includes(element)) {
  //       if (element === "CLIQUE" && problemName === "SAT3") {
  //         // stateVal = element;
  //         setChosenReduceTo(element);
  //         setReduceTo(element);
  //         elementChosen = true;
  //       } else if (problemName === "CLIQUE" && element === "VERTEXCOVER") {
  //         setChosenReduceTo(element);
  //         setReduceTo(element);
  //         elementChosen = true;
  //       }
  //       if (!elementChosen) {
  //         setChosenReduceTo(element);
  //         setReduceTo(element);
  //       }
  //       problemJson.push(element);
  //     }
  //   }, 80);
  // }

  return [reduceToOptions, setReduceToOptions];
}

function useChosenReduceTo({ problemName, reduceToOptions }) {
  const [chosenReduceTo, setChosenReduceTo] = useState("");

  useEffect(() => {
    setChosenReduceTo("");
  }, [problemName]);

  useEffect(() => {
    if (!reduceToOptions.length) {
      setChosenReduceTo("");
    }
  }, [reduceToOptions]);

  return [chosenReduceTo, setChosenReduceTo];
}

function useReductionNameMap({ url, problemName, chosenReduceTo }) {
  const [reductionNameMap, setReductionNameMap] = useState(new Map());

  useEffect(() => {
    if (chosenReduceTo) {
      requestReductionNameMap(url, problemName, chosenReduceTo).then((reductionMap) => {
        setReductionNameMap(reductionMap);
      });
    } else {
      setReductionNameMap(new Map());
    }
  }, [chosenReduceTo]);

  // The following the functions are used to set the reduction names
  async function requestReductionNameMap(url, problemFrom, problemTo) {
    let map = new Map();
    const data = await getAvailableReductions(url, problemFrom, problemTo).catch((error) =>
      console.log("SOLUTIONS REQUEST FAILED")
    );
    for (const r of data) {
      for (const reduction of r) {
        const info = await getInfo(url, reduction).catch((error) => console.log("SOLVER INFO REQUEST FAILED"));
        map.set(reduction, info.reductionName);
      }
    }
    return map;
  }

  async function getAvailableReductions(url, problemFrom, problemTo) {
    return await fetch(
      url + `Navigation/NPC_NavGraph/reductionPath/?reducingFrom=${problemFrom}&reducingTo=${problemTo}&problemType=NPC`
    ).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
    });
  }

  return [reductionNameMap, setReductionNameMap];
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

async function getAvailableVerifiers(url, problem) {
  return await fetch(url + `Navigation/Problem_VerifiersRefactor/?chosenProblem=${problem}&problemType=NPC`).then(
    (resp) => {
      if (resp.ok) {
        return resp.json();
      }
    }
  );
}

/**
 * @param {*} url passed in url
 * @returns a promise with the json
 */
async function getRequest(url) {
  const promise = await fetch(url).then((result) => {
    return result.json();
  });
  return promise;
}

async function getInfo(url, apiCall) {
  return await fetch(url + `${apiCall}/info`).then((resp) => {
    if (resp.ok) {
      return resp.json();
    }
  });
}

async function getProblemInfo(url, problem) {
  return await fetch(url + `${problem}`).then((resp) => {
    if (resp.ok) {
      return resp.json();
    }
  });
}
