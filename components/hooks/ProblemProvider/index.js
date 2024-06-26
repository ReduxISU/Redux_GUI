export * from "./Problem";
export * from "./Reducer";
export * from "./Solver";
export * from "./Verifier";

import React, { useEffect, useState } from "react";
import { requestInfo } from "../../redux";

import { useProblem } from "./Problem";
import { useVerifier } from "./Verifier";
import { useSolver } from "./Solver";
import { useReducer } from "./Reducer";

export function useProblemProvider(url) {
  const problem = useProblem(url);
  const { problemName, problemType, problemNameMap, problemInfoMap, problemInstance } = problem;
  return {
    problem: problem,
    reducer: useReducer(url, problemName, problemType, problemInstance),
    solver: useSolver(url, problemName, problemType, problemNameMap, problemInfoMap, problemInstance),
    verifier: useVerifier(url, problemName, problemType, problemNameMap, problemInfoMap),
  };
}

export function useGenericInfo(url, info) {
  const [genericInfo, setGenericInfo] = useState({});

  useEffect(() => {
    (async () => {
      setGenericInfo(!info ? {} : (await requestInfo(url, info)) ?? {});
    })();
  }, [info]);

  return genericInfo; // There should be no reason to set the information
}
