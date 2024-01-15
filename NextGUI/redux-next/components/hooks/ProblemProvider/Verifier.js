import { useGenericInfo, getRequest, getInfo, getProblemInfo } from "../ProblemProvider";
import React, { useEffect, useState } from "react";

export function useVerifier(url, problemName, problemType, problemNameMap) {
  const state = {};
  [state.defaultVerifierMap] = useDefaultVerifierMap(url, problemNameMap);
  [state.verifierOptions] = useVerifierOptions(url, problemName, problemType);
  [state.chosenVerifier, state.setChosenVerifier] = useChosenVerifier(problemName, state.defaultVerifierMap);
  [state.verifierNameMap] = useVerifierNameMap(url, problemNameMap);
  return state;
}

export function useVerifierInfo(url, verifier) {
  return useGenericInfo(url, verifier);
}

function useDefaultVerifierMap(url, problemNameMap) {
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

function useVerifierOptions(url, problemName, problemType) {
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

function useChosenVerifier(problemName, defaultVerifierMap) {
  const [chosenVerifier, setChosenVerifier] = useState("");

  useEffect(() => {
    setChosenVerifier(!problemName ? "" : defaultVerifierMap.get(problemName));
  }, [problemName, defaultVerifierMap]);

  return [chosenVerifier, setChosenVerifier];
}

function useVerifierNameMap(url, problemNameMap) {
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

async function getAvailableVerifiers(url, problem) {
  return await fetch(url + `Navigation/Problem_VerifiersRefactor/?chosenProblem=${problem}&problemType=NPC`).then(
    (resp) => {
      if (resp.ok) {
        return resp.json();
      }
    }
  );
}
