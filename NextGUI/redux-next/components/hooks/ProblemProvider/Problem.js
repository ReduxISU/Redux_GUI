import { requestProblems, requestProblemGeneric } from "../../redux";
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
    (async () => {
      setProblemInfo(problemName ? requestProblemGeneric(url, problemName) ?? {} : {});
    })();
  }, [problemName]);

  return problemInfo; // There should be no reason to set the problem information
}

function useProblemInfoMap(url) {
  const [problemInfoMap, setProblemInfoMap] = useState(new Map());

  useEffect(() => {
    (async () => {
      const problems = (await requestProblems(url)) ?? [];
      setProblemInfoMap(await requestProblemInfoMap(url, problems));
    })();
  }, []);

  async function requestProblemInfoMap(url, problems) {
    let map = new Map();
    for (const problem of problems) {
      const info = await requestProblemGeneric(url, problem);
      if (info) {
        map.set(problem, info);
      }
    }
    return map;
  }

  return [problemInfoMap, setProblemInfoMap];
}

function useProblemName(problemNameMap) {
  const [problemName, setProblemName] = useState("");

  useEffect(() => {
    // Default problem name
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
