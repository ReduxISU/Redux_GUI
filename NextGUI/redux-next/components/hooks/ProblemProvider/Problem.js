import { getRequest, getProblemInfo } from "../ProblemProvider";
import React, { useEffect, useState } from "react";

const DEFAULT_PROBLEM_NAME = "SAT3";

export function useProblem(url) {
  const state = {};
  [state.problemInfoMap] = useProblemInfoMap(url);
  [state.problemNameMap] = useProblemNameMap(state.problemInfoMap);
  [state.problemType, state.setProblemType] = useState("NPC");
  [state.problemName, state.setProblemName] = useProblemName(state.problemNameMap);
  [state.problemInstance, state.setProblemInstance] = useState("{{1,2,3},{1,2},GENERIC}"); // Careful about changing this value, the application boot up sequence is dependent on having a default value.
  return state;
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

function useProblemInfoMap(baseUrl) {
  const [problemInfoMap, setProblemInfoMap] = useState(new Map());

  useEffect(() => {
    initializeList(`${baseUrl}navigation/NPC_ProblemsRefactor/`);
  }, []);

  async function initializeList(url) {
    const problems = await getRequest(url).catch((error) => console.log("GET REQUEST FAILED", error));
    const problemNames = await requestProblemInfoMap(baseUrl, problems);
    setProblemInfoMap(problemNames);
  }

  async function requestProblemInfoMap(url, problems) {
    let map = new Map();
    for (const problem of problems) {
      await getProblemInfo(url, problem + "Generic")
        .then((info) => {
          map.set(problem, info);
        })
        .catch((error) => console.log("PROBLEM INFO REQUEST FAILED"));
    }
    return map;
  }

  return [problemInfoMap, setProblemInfoMap];
}

function useProblemName(problemNameMap) {
  const [problemName, setProblemName] = useState("");

  useEffect(() => { // Default problem name
    if (problemNameMap.has(DEFAULT_PROBLEM_NAME)) {
      setProblemName(DEFAULT_PROBLEM_NAME);
    }
  }, [problemNameMap]);

  return [problemName, setProblemName];
}

function useProblemNameMap(problemInfoMap) {
  const [problemNameMap, setProblemNameMap] = useState(new Map());

  useEffect(() => {
    setProblemNameMap(new Map([...problemInfoMap].map(([name, info]) => [name, info.problemName])));
  }, [problemInfoMap]);

  return [problemNameMap, setProblemNameMap];
}
