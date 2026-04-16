import { useGenericInfo } from "../ProblemProvider";
import { requestAllVerifiers, requestAllInfo } from "../../redux";
import React, { useEffect, useState, useRef } from "react";
export function useVerifier(url, problemName, problemType, problemNameMap, problemInfoMap) {
  const state = {};
  [state.defaultVerifierMap] = useDefaultVerifierMap(url, problemInfoMap, problemType);
  [state.verifierOptions] = useVerifierOptions(url, problemName, problemType);
  [state.chosenVerifier, state.setChosenVerifier] = useChosenVerifier(problemName, state.defaultVerifierMap);
  [state.verifierNameMap] = useVerifierNameMap(url, problemNameMap, problemType);
  return state;
}

export function useVerifierInfo(url, verifier) {
  return useGenericInfo(url, verifier);
}

function useDefaultVerifierMap(url, problemInfoMap, problemType) {
  const [defaultVerifierMap, setDefaultVerifierMap] = useState(new Map());

useEffect(() => {
  const problems = [...problemInfoMap.keys()];
  const defaultVerifierNames = [...problemInfoMap.values()]
    .map((info) => info?.defaultVerifier?.verifierName)
    .filter(Boolean);
  
  (async () => {
    const allVerifiers = (await requestAllVerifiers(url, problemType)) ?? {};
    const allInfo = (await requestAllInfo(url, problemType)) ?? {};
    let map = new Map();
    for (const problem of problems) {
      const verifiers = allVerifiers[problem] ?? [];
      for (const v of verifiers) {
        const verifier = v.split(" ")[0];
        const info = allInfo[verifier];
        if (info && defaultVerifierNames.includes(info.verifierName)) {
          map.set(problem, v);
        }
      }
    }
    setDefaultVerifierMap(map);
  })();
}, [url, problemInfoMap, problemType]);

  return [defaultVerifierMap, setDefaultVerifierMap];
}

function useVerifierOptions(url, problemName, problemType) {
  const [verifierOptions, setVerifierOptions] = useState([]);

  useEffect(() => {
    (async () => {
      if (!problemName || !problemType) {
  setVerifierOptions([]);
  return;
}
const allVerifiers = (await requestAllVerifiers(url, problemType)) ?? {};
setVerifierOptions(allVerifiers[problemName] ?? []);
    })();
  }, [url, problemName, problemType]);

  return [verifierOptions, setVerifierOptions];
}

function useChosenVerifier(problemName, defaultVerifierMap) {
  const [chosenVerifier, setChosenVerifier] = useState("");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if(!problemName || defaultVerifierMap.size === 0) return;

    let verifierVar = !problemName ? "" : defaultVerifierMap.get(problemName);
    const storedData = null;

    if (isFirstRender.current) {
      // First render: read from localStorage
      if (storedData) {
        const allData = JSON.parse(storedData);
        verifierVar = allData.verifier;
        
      }
      isFirstRender.current = false;
    }
    
    setChosenVerifier(verifierVar);
  }, [problemName, defaultVerifierMap]);

  return [chosenVerifier, setChosenVerifier];
}

function useVerifierNameMap(url, problemNameMap, problemType) {
  const [verifierNameMap, setVerifierNameMap] = useState(new Map());

useEffect(() => {
  const problems = Array.from(problemNameMap.keys());

  (async () => {
    const allVerifiers = (await requestAllVerifiers(url, problemType)) ?? {};
    const allInfo = (await requestAllInfo(url, problemType)) ?? {};
    let map = new Map();

    for (const problem of problems) {
      const verifiers = allVerifiers[problem] ?? [];
      for (const verifier of verifiers) {
        const info = allInfo[verifier];
        map.set(verifier, info?.verifierName || verifier);
      }
    }
    setVerifierNameMap(map);
  })();
}, [url, problemNameMap, problemType]);

  return [verifierNameMap, setVerifierNameMap];
}
