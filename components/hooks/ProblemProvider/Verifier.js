import { useGenericInfo } from "../ProblemProvider";
import { requestInfo, requestVerifiers } from "../../redux";
import React, { useEffect, useState, useRef } from "react";
import { getCookie, getCookieValue } from '../../widgets/CookieConsent';

export function useVerifier(url, problemName, problemType, problemNameMap, problemInfoMap) {
  const state = {};
  [state.defaultVerifierMap] = useDefaultVerifierMap(url, problemInfoMap);
  [state.verifierOptions] = useVerifierOptions(url, problemName, problemType);
  [state.chosenVerifier, state.setChosenVerifier] = useChosenVerifier(problemName, state.defaultVerifierMap);
  [state.verifierNameMap] = useVerifierNameMap(url, problemNameMap);
  return state;
}

export function useVerifierInfo(url, verifier) {
  return useGenericInfo(url, verifier);
}

function useDefaultVerifierMap(url, problemInfoMap) {
  const [defaultVerifierMap, setDefaultVerifierMap] = useState(new Map());

  useEffect(() => {
    const problems = [...problemInfoMap.keys()];
    const defaultVerifierNames = [...problemInfoMap.values()].map((info) => info.defaultVerifier.verifierName);
    requestDefaultVerifierFileMap(url, problems, defaultVerifierNames).then((defaultVerifierFileNames) => {
      setDefaultVerifierMap(defaultVerifierFileNames);
    });
  }, [problemInfoMap]);

  //The requestDefaultVerifierFileMap sets the verifier names by the file name
  async function requestDefaultVerifierFileMap(url, problems, defaultVerifierNames) {
    let map = new Map();
    for (const problem of problems) {
      const verifiers = (await requestVerifiers(url, problem)) ?? [];
      for (const v of verifiers) {
        const verifier = v.split(" ")[0];
        const info = await requestInfo(url, verifier);
        if (info && defaultVerifierNames.includes(info.verifierName)) {
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
    (async () => {
      setVerifierOptions(
        problemName && problemType ? (await requestVerifiers(url, problemName, problemType)) ?? [] : []
      );
    })();
  }, [problemName, problemType]);

  return [verifierOptions, setVerifierOptions];
}

function useChosenVerifier(problemName, defaultVerifierMap) {
  const [chosenVerifier, setChosenVerifier] = useState("");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if(!problemName || defaultVerifierMap.size === 0) return;

    let verifierVar = !problemName ? "" : defaultVerifierMap.get(problemName);

    if (isFirstRender.current) {
      //First render read from Cookie
      const verifierFromCookie = getCookieValue("allData", "verifier");
      if (verifierFromCookie) {
        verifierVar = verifierFromCookie;
      } 
    } 

    setChosenVerifier(verifierVar);
    isFirstRender.current = false;
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
      const verifiers = (await requestVerifiers(url, problem)) ?? [];
      for (const verifier of verifiers) {
        const info = await requestInfo(url, verifier);
        if (info) {
          map.set(verifier, info.verifierName);
        }
      }
    }
    return map;
  }

  return [verifierNameMap, setVerifierNameMap];
}
