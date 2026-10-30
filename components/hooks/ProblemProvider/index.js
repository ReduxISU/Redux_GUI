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

const NO_INFO = {};

// Returns {} until the info for the current `info` arrives; a late answer for an earlier `info`
// is dropped, so a switch never briefly shows the previous item's info (e.g. its picture type).
export function useGenericInfo(url, info) {
  return useGenericInfoWithStatus(url, info)[0]; // There should be no reason to set the information
}

// Like useGenericInfo, but returns [info, status, error]: status is "loading", "failed" (the
// request failed; the info is then {} and `error` says what went wrong) or "ready".
export function useGenericInfoWithStatus(url, info) {
  const [fetched, setFetched] = useState({ info: undefined, genericInfo: {}, error: null });

  useEffect(() => {
    let ignore = false;
    (async () => {
      let error = null;
      const answer = !info
        ? {}
        : await requestInfo(url, info, (detail) => {
            error = detail;
          });
      if (!ignore) {
        setFetched({
          info,
          genericInfo: answer ?? {},
          error: answer === undefined ? (error ?? "The server sent back nothing.") : null,
        });
      }
    })();
    return () => {
      ignore = true;
    };
  }, [info, url]);

  if (fetched.info !== info) return [NO_INFO, "loading", null];
  return [fetched.genericInfo, fetched.error ? "failed" : "ready", fetched.error];
}
