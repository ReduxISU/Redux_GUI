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

  [state.problemJson, state.setProblemJson] = useState("");
  [state.problemType, state.setProblemType] = useState("NPC");
  [state.problemName, state.setProblemName] = useState("");
  [state.problemInstance, state.setProblemInstance] = useState("{{1,2,3},{1,2},GENERIC}"); // Careful about changing this value, the application boot up sequence is dependent on having a default value.
  [state.problemDescription, state.setProblemDescription] = useState(
    "You need to enter a problem to see information about it"
  );
  [state.reduceToOptions, state.setReduceToOptions] = useState([]);
  [state.chosenReduceTo, state.setChosenReduceTo] = useState("");
  [state.reductionTypeOptions, state.setReductionTypeOptions] = useState([]);
  [state.chosenReductionType, state.setChosenReductionType] = useState("");
  [state.reducedInstance, state.setReducedInstance] = useState("");
  [state.solverOptions, state.setSolverOptions] = useState([]);
  [state.chosenSolver, state.setChosenSolver] = useState("");
  [state.chosenVerifier, state.setChosenVerifier] = useState("");
  [state.verifierOptions, state.setVerifierOptions] = useState([]);
  [state.solvedInstance, state.setSolvedInstance] = useState("");
  [state.problemNameMap, state.setProblemNameMap] = useState(new Map());
  [state.solverNameMap, state.setSolverNameMap] = useState(new Map());
  [state.verifierNameMap, state.setVerifierNameMap] = useState(new Map());
  [state.reductionNameMap, state.setReductionNameMap] = useState(new Map());
  [state.defaultSolverMap, state.setDefaultSolverMap] = useState(new Map());
  [state.defaultVerifierMap, state.setDefaultVerifierMap] = useState(new Map());

  useProblemProvider_SearchBarProblemType({ url: url, ...state });
  useProblemProvider_SearchBarSelectSolverV2({ url: url, ...state });
  useProblemProvider_SearchBarSelectVerifierV2({ url: url, ...state });
  useProblemProvider_SearchBarSelectReductionTypeV2({ url: url, ...state });
  useProblemProvider_SearchBarSelectReduceToV2({ url: url, ...state });

  return <ProblemContext.Provider value={state}>{children}</ProblemContext.Provider>;
}

function useProblemProvider_SearchBarSelectReduceToV2({
  problemType,
  problemName,
  setReductionNameMap,
  chosenReduceTo,
  setChosenReduceTo,
  reduceToOptions,
  setReduceToOptions,
  problemNameMap,
  ...props
}) {
  const fullUrl =
    props.url +
    "Navigation/NPC_NavGraph/availableReductions/" +
    "?chosenProblem=" +
    problemName +
    "&problemType=" +
    problemType;

  useEffect(() => {
    setChosenReduceTo("");
    initializeList(fullUrl);
  }, [problemName]);

  useEffect(() => {
    requestReductionNameMap(props.url, problemName, chosenReduceTo).then((reductionMap) => {
      setReductionNameMap(reductionMap);
    });
  }, [chosenReduceTo]);

  function initializeProblemJson(arr) {
    if (!arr.length) {
      setChosenReduceTo("");
    }

    setReduceToOptions(arr);

    // // var elementChosen = false;
    // arr.map(function (element, index, array) {
    //   if (!problemJson.includes(element)) {
    //     // if (element === "CLIQUE" && problemName === "SAT3") {
    //     //   // stateVal = element;
    //     //   setChosenReduceTo(element);
    //     //   setReduceTo(element);
    //     //   elementChosen = true;
    //     // } else if (problemName === "CLIQUE" && element === "VERTEXCOVER") {
    //     //   setChosenReduceTo(element);
    //     //   setReduceTo(element);
    //     //   elementChosen = true;
    //     // }
    //     // if (!elementChosen) {
    //     //   setChosenReduceTo(element);
    //     //   setReduceTo(element);
    //     // }
    //     problemJson.push(element);
    //   }
    // }, 80);
  }

  async function getRequest(url) {
    const promise = await fetch(url).then((result) => {
      return result.json();
    });
    return promise;
  }

  function initializeList(url) {
    const req = getRequest(url);
    req
      .then((data) => {
        initializeProblemJson(data);
      })
      .catch((error) => console.log("GET REQUEST FAILED SELECT REDUCE TO"));
  }

  // The following the functions are used to set the reduction names
  async function requestReductionNameMap(url, problemFrom, problemTo) {
    let map = new Map();
    await getAvailableReductions(url, problemFrom, problemTo)
      .then((data) => {
        data.forEach((r) => {
          r.forEach((reduction) => {
            getInfo(url, reduction)
              .then((info) => {
                map.set(reduction, info.reductionName);
              })
              .catch((error) => console.log("SOLVER INFO REQUEST FAILED"));
          });
        });
      })
      .catch((error) => console.log("SOLUTIONS REQUEST FAILED"));
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

  async function getInfo(url, reduction) {
    return await fetch(url + `${reduction}/info`).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
    });
  }
}

function useProblemProvider_SearchBarSelectReductionTypeV2({
  problemName,
  problemType,
  chosenReduceTo,
  setChosenReductionType,
  setReductionTypeOptions,
  ...props
}) {
  const fullUrl =
    props.url +
    "Navigation/NPC_NavGraph/reductionPath/" +
    "?reducingFrom=" +
    problemName +
    "&reducingTo=" +
    chosenReduceTo +
    "&problemType=" +
    problemType;
  useEffect(() => {
    setChosenReductionType(null);
    initializeList(fullUrl);
  }, [chosenReduceTo]);

  function initializeProblemJson(arr) {
    // check if reduceTo is selected
    if (!arr.length) {
      setChosenReductionType("");
      return;
    }

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

  async function getRequest(url) {
    const promise = await fetch(url).then((result) => {
      return result.json();
    });
    return promise;
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
}

function useProblemProvider_SearchBarSelectVerifierV2({
  problemName,
  problemType,
  setChosenVerifier,
  setVerifierOptions,
  defaultVerifierMap,
  ...props
}) {
  useEffect(() => {
    if (problemName === "" || problemName === null) {
      setChosenVerifier("");
    } else {
      initializeList(
        props.url +
          "Navigation/Problem_VerifiersRefactor/" +
          "?chosenProblem=" +
          problemName +
          "&problemType=" +
          problemType
      );
      setChosenVerifier(defaultVerifierMap.get(problemName));
    }
  }, [problemName]);

  function initializeProblemJson(arr) {
    // arr.map(function (element, index, array) {
    //   if (!problemJson.includes(element)) {
    //     if (element === "KadensSimpleVerifier" && problemName === "SAT3") {
    //       setChosenVerifier(element);
    //       setDefaultVerifier("Kaden Simple Verifier");
    //     } else if (element === "CliqueVerifier" && problemName === "CLIQUE") {
    //       setChosenVerifier(element);
    //       setDefaultVerifier("Generic Verifier");
    //     }
    //     problemJson.push(element);
    //   }
    // }, 80);

    setVerifierOptions(arr);
  }

  async function getRequest(url) {
    const promise = await fetch(url).then((result) => {
      return result.json();
    });
    return promise;
  }

  function initializeList(url) {
    const req = getRequest(url);
    req
      .then((data) => {
        initializeProblemJson(data);
      })
      .catch((error) => console.log("GET REQUEST FAILED SEARCHBAR VERIFIER"));
  }
}

function useProblemProvider_SearchBarSelectSolverV2({
  problemName,
  problemType,
  defaultSolverMap,
  setChosenSolver,
  setSolverOptions,
  ...props
}) {
  useEffect(() => {
    if (problemName === "" || problemName === null) {
      setChosenSolver("");
    } else {
      initializeList(
        props.url +
          "Navigation/Problem_SolversRefactor/" +
          "?chosenProblem=" +
          problemName +
          "&problemType=" +
          problemType
      );
      setChosenSolver(defaultSolverMap.get(problemName)); // Gets the file name of default solver
    }
  }, [problemName]);

  function initializeProblemJson(arr) {
    //Every problem should have a generic solver
    // arr.map(function (element, index, array) {
    //   if (!problemJson.includes(element)) {
    //     if (element === "Sat3BacktrackingSolver" && problemName === "SAT3") {
    //       setChosenSolver(element);
    //       setDefaultSolver("3SAT Backtracking Solver");
    //     } else if (element === "CliqueBruteForce" && problemName === "CLIQUE") {
    //       setChosenSolver(element);
    //       setDefaultSolver("Clique Brute Force");
    //     }
    //     problemJson.push(element);
    //   }
    // }, 80);

    setSolverOptions(arr);
  }

  async function getRequest(url) {
    const promise = await fetch(url).then((result) => {
      return result.json();
    });
    return promise;
  }

  function initializeList(url) {
    const req = getRequest(url);
    req
      .then((data) => {
        initializeProblemJson(data);
      })
      .catch((error) => console.log("GET REQUEST FAILED SEARCHBAR SOLVER"));
  }
}

var problemJson = [];
function useProblemProvider_SearchBarProblemType({
  setProblemName,
  setSolverNameMap,
  setVerifierNameMap,
  setProblemNameMap,
  setDefaultSolverMap,
  setDefaultVerifierMap,
  ...props
}) {
  useEffect(() => {
    initializeList(`${props.url}navigation/NPC_ProblemsRefactor/`);
  }, []);

  /**
   * converts asynchronous fetch request into synchronous call that sets the dropdown labels by updating our array
   * we make sure to avoid duplicates
   * @param {*} arr
   */
  function initializeProblemJson(arr) {
    arr.map(function (element, index, array) {
      if (!problemJson.includes(element)) {
        if (element === "SAT3") {
          //setDefaultProblemName(element);
          setProblemName(element);
        }

        problemJson.push(element);
      }
    }, 80);
  }

  /**
   *
   * @param {*} url passed in url
   * @returns a promise with the json
   */
  async function getRequest(url) {
    const promise = await fetch(url).then((result) => {
      return result.json();
    });
    return promise;
  }
  /**
   * gets the data from our request and attempts to set our labels by calling initializeProblemJson
   *
   */
  function initializeList(url) {
    if (problemJson.length === 0) {
      const req = getRequest(url);
      req
        .then((data) => {
          initializeProblemJson(data);
          requestProblemNameMap(props.url, data).then((problemNames) => {
            setProblemNameMap(problemNames);
          });
          requestDefaultSolverMap(props.url, data).then((defaultSolverNames) => {
            requestDefaultSolverFileMap(props.url, data, defaultSolverNames).then((defaultSolverFileNames) => {
              setDefaultSolverMap(defaultSolverFileNames);
            });
          });

          requestDefaultVerifierMap(props.url, data).then((defaultVerifierNames) => {
            requestDefaultVerifierFileMap(props.url, data, defaultVerifierNames).then((defaultVerifierFileNames) => {
              setDefaultVerifierMap(defaultVerifierFileNames);
            });
          });

          requestVerifierNameMap(props.url, data).then((verifierMap) => {
            setVerifierNameMap(verifierMap);
          });
          requestSolverNameMap(props.url, data).then((solverMap) => {
            setSolverNameMap(solverMap);
          });
        })
        .catch((error) => console.log("GET REQUEST FAILED", error));
    }

    // initialized = true;
  }

  //The requestProblemNameMap sets the problem names
  async function requestProblemNameMap(url, problems) {
    let map = new Map();
    problems.forEach((problem) => {
      getProblemInfo(url, problem + "Generic")
        .then((info) => {
          map.set(problem, info.problemName);
        })
        .catch((error) => console.log("PROBLEM INFO REQUEST FAILED"));
    });
    return map;
  }

  //The requestDefaultSolverMap sets the solver names
  async function requestDefaultSolverMap(url, problems) {
    let map = new Map();
    problems.forEach((problem) => {
      getProblemInfo(url, problem + "Generic")
        .then((info) => {
          map.set(problem, info.defaultSolver.solverName);
        })
        .catch((error) => console.log("PROBLEM INFO REQUEST FAILED"));
    });
    return map;
  }

  //The requestDefaultSolverFileMap sets the solver names by the file name
  async function requestDefaultSolverFileMap(url, problems, defaultSolverNames) {
    let map = new Map();
    problems.forEach(async (problem) => {
      await getAvailableSolvers(url, problem)
        .then((data) => {
          data.forEach((s) => {
            let solver = s.split(" ")[0];
            getInfo(url, solver)
              .then((info) => {
                if (Array.from(defaultSolverNames.values()).includes(info.solverName)) {
                  map.set(problem, s);
                }
              })
              .catch((error) => console.log("SOLVER INFO REQUEST FAILED"));
          });
        })
        .catch((error) => console.log("SOLUTIONS REQUEST FAILED"));
    });
    return map;
  }

  //The requestDefaultVerifierMap sets the verifier names
  async function requestDefaultVerifierMap(url, problems) {
    let map = new Map();
    problems.forEach((problem) => {
      getProblemInfo(url, problem + "Generic")
        .then((info) => {
          map.set(problem, info.defaultVerifier.verifierName);
        })
        .catch((error) => console.log("PROBLEM INFO REQUEST FAILED"));
    });
    return map;
  }
  //The requestDefaultVerifierFileMap sets the verifier names by the file name
  async function requestDefaultVerifierFileMap(url, problems, defaultVerifierNames) {
    let map = new Map();
    problems.forEach(async (problem) => {
      await getAvailableVerifiers(url, problem)
        .then((data) => {
          data.forEach((v) => {
            let verifier = v.split(" ")[0];
            getInfo(url, verifier)
              .then((info) => {
                if (Array.from(defaultVerifierNames.values()).includes(info.verifierName)) {
                  map.set(problem, v);
                }
              })
              .catch((error) => console.log("SOLVER INFO REQUEST FAILED"));
          });
        })
        .catch((error) => console.log("SOLUTIONS REQUEST FAILED"));
    });
    return map;
  }

  async function getProblemInfo(url, problem) {
    return await fetch(url + `${problem}`).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
    });
  }

  //The following the functions are used to set the solver names
  async function requestSolverNameMap(url, problems) {
    let map = new Map();
    for (const problem of problems) {
      await getAvailableSolvers(url, problem)
        .then((data) => {
          data.forEach((s) => {
            let solver = s.split(" ")[0];
            getInfo(url, solver)
              .then((info) => {
                map.set(s, info.solverName);
              })
              .catch((error) => console.log("SOLVER INFO REQUEST FAILED"));
          });
        })
        .catch((error) => console.log("SOLUTIONS REQUEST FAILED"));
    }
    return map;
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

  async function getInfo(url, apiCall) {
    return await fetch(url + `${apiCall}/info`).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
    });
  }

  //The following the functions are used to set the verifier names
  async function requestVerifierNameMap(url, problems) {
    let map = new Map();
    for (const problem of problems) {
      await getAvailableVerifiers(url, problem)
        .then((data) => {
          data.forEach((v) => {
            let verifier = v;
            getInfo(url, verifier)
              .then((info) => {
                map.set(verifier, info.verifierName);
              })
              .catch((error) => console.log("VERIFIER INFO REQUEST FAILED"));
          });
        })
        .catch((error) => console.log("VERIFIER REQUEST FAILED"));
    }
    return map;
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
}
