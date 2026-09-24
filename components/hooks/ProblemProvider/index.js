export * from "./Problem";
export * from "./Reducer";
export * from "./Solver";
export * from "./Verifier";
export * from "./Visualization";

import React, { useEffect, useState } from "react";
import { requestInfo } from "../../redux";

import { useProblem } from "./Problem";
import { useReducer } from "./Reducer";
import { useSolver } from "./Solver";
import { useVerifier } from "./Verifier";
import { useVisualization } from "./Visualization";

export function useProblemProvider(url) {
  const problem = useProblem(url);
  const { problemName, problemNameMap, problemInfoMap, problemInstance } = problem;
  return {
    problem: problem,
    reducer: useReducer(url, problemName, problemInstance),
    solver: useSolver(url, problemName, problemNameMap, problemInfoMap, problemInstance),
    verifier: useVerifier(url, problemName, problemNameMap, problemInfoMap),
    visualization: useVisualization(url, problemName, problemNameMap, problemInfoMap),
  };
}

export function useGenericInfo(url, info) {
  const [genericInfo, setGenericInfo] = useState({});

  useEffect(() => {
    (async () => {
      setGenericInfo(!info ? {} : ((await requestInfo(url, info)) ?? {}));
    })();
  }, [info, url]);

  return genericInfo; // There should be no reason to set the information
}
