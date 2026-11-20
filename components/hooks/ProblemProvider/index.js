export * from "./Problem";
export * from "./Reducer";
export * from "./Solver";
export * from "./Verifier";
export * from "./Visualization";

import React, { useCallback, useEffect, useState } from "react";
import { requestInfo } from "../../redux";
import { NO_RESTORE, useShareRestore } from "../../share/useShareRestore";
import { useWhenChanged } from "../useWhenChanged";

import { useProblem } from "./Problem";
import { useReducer } from "./Reducer";
import { useSolver } from "./Solver";
import { useVerifier } from "./Verifier";
import { useVisualization } from "./Visualization";

export function useProblemProvider(url) {
  // A view restored from a shared link (#281): { id, values }. `id` goes up on every restore, so
  // the pickers below re-pick from `values` (the link's checked choices) even when the problem
  // stays the same. `values` is cleared, keeping `id`, once the user moves to another problem, so
  // coming back gets the defaults again and nothing re-picks on the clear itself.
  const [restore, setRestore] = useState(NO_RESTORE);
  // True while a restored view waits for the user's first click: nothing is solved, verified,
  // reduced or drawn on its own until then, so opening a link never starts a (possibly huge) job.
  const [held, setHeld] = useState(false);
  const releaseHold = useCallback(() => setHeld(false), []);

  const problem = useProblem(url, restore);
  const { problemName, problemNameMap, problemInfoMap, problemInstance } = problem;

  // Moving to another problem is the user's own choice: the restored view is over.
  useWhenChanged([problemName], () => {
    if (restore.values && problemName && problemName !== restore.values.problem) {
      setRestore({ id: restore.id, values: null });
      setHeld(false);
    }
  });

  const share = useShareRestore(url, problem, setRestore, setHeld);
  return {
    problem: { ...problem, restoreId: restore.id },
    reducer: useReducer(url, problemName, problemInstance, restore, held, releaseHold),
    solver: useSolver(url, problemName, problemNameMap, problemInfoMap, problemInstance, restore),
    verifier: useVerifier(url, problemName, problemNameMap, problemInfoMap, restore),
    visualization: useVisualization(url, problemName, problemNameMap, problemInfoMap),
    share: { ...share, held, releaseHold },
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
