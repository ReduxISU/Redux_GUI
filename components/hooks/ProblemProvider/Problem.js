import { requestAllProblems, requestAllInfo } from "../../redux";
import React, { useEffect, useState, useMemo } from "react";

// For initial startup defaults
const DEFAULT_PROBLEM_NAME = "SAT3";

export function useProblem(url) {
  const state = {};
  [state.problemType, state.setProblemType] = useState("NPC");
  [state.problemInfoMap] = useProblemInfoMap(url, state.problemType);
  state.problemNameMap = useProblemNameMap(state.problemInfoMap);
  [state.problemName, state.setProblemName] = useProblemName(state.problemNameMap);
  [state.problemInstance, state.setProblemInstance] = useState("{{1,2,3},{1,2},GENERIC}");
  return state;
}

export function useProblemInfo(url, problemName, problemType = "NPC") {
  const [problemInfo, setProblemInfo] = useState({});

  useEffect(() => {
    if(!problemName) return;
    (async () => {
      const allInfo = (await requestAllInfo(url, problemType)) ?? {};
      setProblemInfo(allInfo[problemName] ?? {});
    })();
  }, [url, problemName, problemType]);

  return problemInfo; // There should be no reason to set the problem information
}

function useProblemInfoMap(url, problemType) {
  const [problemInfoMap, setProblemInfoMap] = useState(new Map());
  useEffect(() => {
    (async () => {
      const problems = (await requestAllProblems(url, problemType)) ?? [];
      const allInfo = (await requestAllInfo(url, problemType)) ?? {};
      let map = new Map();
      for (const problem of problems) {
        const info = allInfo[problem];
        if (info) {
          map.set(problem, info);
        }
      }
      setProblemInfoMap(map);
    })();
  }, [url, problemType]);
  return [problemInfoMap, setProblemInfoMap];
}

function useProblemName(problemNameMap) {
  const [problemName, setProblemName] = useState("");

  useEffect(() => {
    const storedData = null;

    if(storedData) {
      const allData = JSON.parse(storedData);
      setProblemName(allData.problem);
    }
    else if(problemNameMap.has(DEFAULT_PROBLEM_NAME)) {
      setProblemName(DEFAULT_PROBLEM_NAME);
    }
  }, [problemNameMap]);

  return [problemName, setProblemName];
}

function useProblemNameMap(problemInfoMap) {
  return useMemo(
    () => new Map([...problemInfoMap].map(([name, info]) => [name, info?.problemName || name])),
    [problemInfoMap]
  );
}