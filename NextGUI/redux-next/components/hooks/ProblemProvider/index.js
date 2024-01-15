export * from "./Problem";
export * from "./Reducer";
export * from "./Solver";
export * from "./Verifier";

import React, { useEffect, useState } from "react";
import { useProblem } from "./Problem";
import { useVerifier } from "./Verifier";
import { useSolver } from "./Solver";
import { useReducer } from "./Reducer";

export function useProblemProvider(url) {
  const problem = useProblem(url);
  const { problemName, problemType, problemNameMap } = problem;
  return {
    ...problem,
    ...useReducer(url, problemName, problemType),
    ...useSolver(url, problemName, problemType, problemNameMap),
    ...useVerifier(url, problemName, problemType, problemNameMap),
  };
}

export function useGenericInfo(url, info) {
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

/**
 * @param {*} url passed in url
 * @returns a promise with the json
 */
export async function getRequest(url) {
  const promise = await fetch(url).then((result) => {
    return result.json();
  });
  return promise;
}

export async function getInfo(url, apiCall) {
  return await fetch(url + `${apiCall}/info`).then((resp) => {
    if (resp.ok) {
      return resp.json();
    }
  });
}

export async function getProblemInfo(url, problem) {
  return await fetch(url + `${problem}`).then((resp) => {
    if (resp.ok) {
      return resp.json();
    }
  });
}
