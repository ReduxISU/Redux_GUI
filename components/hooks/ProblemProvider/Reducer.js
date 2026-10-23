import React, { useEffect, useState } from "react";
import {
  requestInfo,
  requestReducedInstanceFromPath,
  requestReductionInfo,
  requestReductionOptions,
  requestReductions,
} from "../../redux";
import { useGenericInfo } from "../ProblemProvider";
import { useWhenChanged } from "../useWhenChanged";

// For initial startup defaults: the target and reduction picked for a problem when its options
// arrive, falling back to the first option.
const PREFERRED_REDUCE_TO = { SAT3: "CLIQUE", CLIQUE: "VERTEXCOVER" };
const PREFERRED_REDUCTION_TYPE = {
  CLIQUE: "SipserReduceToCliqueStandard",
  VERTEXCOVER: "sipserReduceToVC",
};

// One shared empty list, so "not loaded yet" keeps the same identity from render to render.
const NO_OPTIONS = [];

function pickDefault(preferred, options) {
  return options.includes(preferred) ? preferred : (options[0] ?? "");
}

export function useReducer(url, problemName, problemInstance) {
  const state = {};
  let reduceToOptionsLoaded, reductionTypeOptionsLoaded, reduceToError, reductionTypeError;
  [state.reduceToOptions, reduceToOptionsLoaded, reduceToError] = useReduceToOptions(
    url,
    problemName,
  );
  [state.chosenReduceTo, state.setChosenReduceTo] = useChosenReduceTo(
    problemName,
    state.reduceToOptions,
  );
  [state.reductionNameMap] = useReductionNameMap(url, problemName, state.chosenReduceTo);
  [state.reductionTypeOptions, reductionTypeOptionsLoaded, reductionTypeError] =
    useReductionTypeOptions(url, problemName, state.chosenReduceTo);
  // Set to { step, detail } when the request for the problem's targets, or for the chosen
  // target's reduction path, failed. The reduction picture then shows "Failed to Visualize"
  // rather than the "nothing to reduce" state, since it is not known that there is nothing.
  state.reductionOptionsError =
    (reduceToOptionsLoaded &&
      reduceToError && { step: "Reduction targets request", detail: reduceToError }) ||
    (!!state.chosenReduceTo &&
      reductionTypeOptionsLoaded &&
      reductionTypeError && { step: "Reduction path request", detail: reductionTypeError }) ||
    null;
  // True once it is known there is nothing to reduce: the problem has no targets, or the chosen
  // target has no reduction path. It stays false while the options are loading or if they failed.
  state.noReductions =
    (reduceToOptionsLoaded && !reduceToError && state.reduceToOptions.length === 0) ||
    (!!state.chosenReduceTo &&
      reductionTypeOptionsLoaded &&
      !reductionTypeError &&
      state.reductionTypeOptions.length === 0);
  [state.chosenReductionType, state.setChosenReductionType] = useChosenReductionType(
    problemName,
    state.chosenReduceTo,
    state.reductionTypeOptions,
  );
  [state.reducedInstance, state.setReducedInstance] = useReducedInstance(
    url,
    problemInstance,
    state.chosenReduceTo,
    state.chosenReductionType,
  );
  [
    state.reductionVisualization,
    state.setReductionVisualization,
    state.reductionVisualizationError,
  ] = useReductionVisualization(url, state.chosenReduceTo);
  return state;
}

export function useReducerInfo(url, reducer) {
  const [genericInfo, setGenericInfo] = useState({});

  useEffect(() => {
    let ignore = false;
    (async () => {
      const info = !reducer
        ? {}
        : ((await requestReductionInfo(url, (reducer ?? "").split("-")[0])) ?? {});
      if (!ignore) setGenericInfo(info);
    })();
    return () => {
      ignore = true;
    };
  }, [reducer, url]);

  return genericInfo; // There should be no reason to set the information
}

function useReducedInstance(url, problemInstance, chosenReduceTo, chosenReductionType) {
  const [reducedInstance, setReducedInstance] = useState("");

  useWhenChanged([chosenReductionType, chosenReduceTo], () => setReducedInstance(""));

  // Automatically reduces the instance one the reduction type is chosen.
  // This makes it so it's less input from the user but also makes the "Reduce" button effectly useless.
  useEffect(() => {
    let ignore = false;
    (async () => {
      const reduced =
        chosenReductionType && problemInstance
          ? ((await requestReducedInstanceFromPath(url, chosenReductionType, problemInstance)) ??
            "")
          : "";
      if (!ignore) setReducedInstance(reduced);
    })();
    return () => {
      ignore = true;
    };
  }, [chosenReductionType, problemInstance, url]);

  return [reducedInstance, setReducedInstance];
}

// The target's picture type, or undefined while the current target's type is still loading.
// The third value says what went wrong when the target's info request failed, else null.
function useReductionVisualization(url, chosenReduceTo) {
  const [fetched, setFetched] = useState({ reduceTo: undefined, type: "", error: null });

  useEffect(() => {
    let ignore = false;
    (async () => {
      let error = null;
      const info = chosenReduceTo
        ? await requestInfo(url, chosenReduceTo, (detail) => {
            error = detail;
          })
        : null;
      if (!ignore) {
        setFetched({
          reduceTo: chosenReduceTo,
          type: info?.defaultVisualization?.visualizationType ?? "",
          error: info === undefined ? (error ?? "No answer.") : null,
        });
      }
    })();
    return () => {
      ignore = true;
    };
  }, [url, chosenReduceTo]);

  const setReductionVisualization = (type) =>
    setFetched({ reduceTo: chosenReduceTo, type, error: null });
  const current = fetched.reduceTo === chosenReduceTo;
  return [
    current ? fetched.type : undefined,
    setReductionVisualization,
    current ? fetched.error : null,
  ];
}

// Options are kept together with the problem they were fetched for. Until the current problem's
// arrive this returns NO_OPTIONS and loaded = false, so nothing picks from another problem's list.
// The third value says what went wrong when the request failed (the options are then empty).
function useReduceToOptions(url, problemName) {
  const [fetched, setFetched] = useState({
    problemName: undefined,
    options: NO_OPTIONS,
    error: null,
  });

  useEffect(() => {
    let ignore = false;
    (async () => {
      let error = null;
      const answer = problemName
        ? await requestReductionOptions(url, problemName, (detail) => {
            error = detail;
          })
        : [];
      if (!ignore) {
        setFetched({
          problemName,
          options: (answer ?? []).sort(),
          error: answer === undefined ? (error ?? "No answer.") : null,
        });
      }
    })();
    return () => {
      ignore = true;
    };
  }, [problemName, url]);

  const loaded = fetched.problemName === problemName;
  return [loaded ? fetched.options : NO_OPTIONS, loaded, loaded ? fetched.error : null];
}

function useReductionTypeOptions(url, problemName, chosenReduceTo) {
  const [fetched, setFetched] = useState({
    problemName: undefined,
    chosenReduceTo: undefined,
    options: NO_OPTIONS,
    error: null,
  });

  // undefined when the request failed; onError then gets what went wrong.
  async function requestPreparedReductions(url, problemName, chosenReduceTo, onError) {
    const reductions = await requestReductions(url, problemName, chosenReduceTo, onError);
    if (reductions === undefined) return undefined;
    let path = "";
    for (const reduction of reductions) {
      path += reduction[0] + "-";
    }
    return path !== "" ? [path.slice(0, -1)] : [];
  }

  useEffect(() => {
    let ignore = false;
    (async () => {
      let error = null;
      const answer =
        problemName && chosenReduceTo
          ? await requestPreparedReductions(url, problemName, chosenReduceTo, (detail) => {
              error = detail;
            })
          : [];
      if (!ignore) {
        setFetched({
          problemName,
          chosenReduceTo,
          options: (answer ?? []).sort(),
          error: answer === undefined ? (error ?? "No answer.") : null,
        });
      }
    })();
    return () => {
      ignore = true;
    };
  }, [chosenReduceTo, url, problemName]);

  // Right after a problem or target switch the stored options still belong to the old one. Hide
  // them until the current ones arrive, so the default below never re-picks the old reduction.
  const loaded = fetched.problemName === problemName && fetched.chosenReduceTo === chosenReduceTo;
  return [loaded ? fetched.options : NO_OPTIONS, loaded, loaded ? fetched.error : null];
}

function useChosenReductionType(problemName, chosenReduceTo, reductionTypeOptions) {
  const [chosenReductionType, setChosenReductionType] = useState("");

  useWhenChanged([problemName, chosenReduceTo], () => setChosenReductionType(""));

  // reductionTypeOptions only ever holds the current target's options (NO_OPTIONS while they
  // load), so the choice stays empty until they arrive.
  useWhenChanged([reductionTypeOptions, chosenReduceTo], () => {
    if (reductionTypeOptions.length === 0) return;
    setChosenReductionType(
      pickDefault(PREFERRED_REDUCTION_TYPE[chosenReduceTo], reductionTypeOptions),
    );
  });

  return [chosenReductionType, setChosenReductionType];
}

function useChosenReduceTo(problemName, reduceToOptions) {
  const [chosenReduceTo, setChosenReduceTo] = useState("");

  useWhenChanged([problemName], () => setChosenReduceTo(""));

  // problemName is deliberately not a dependency: it is a follower of reduceToOptions. When the
  // problem changes, reduceToOptions recomputes and this re-runs with the current problemName in
  // scope. Keying on problemName directly would pick a default from the previous problem's
  // still-stale options.
  useWhenChanged([reduceToOptions], () => {
    if (reduceToOptions.length === 0) return;
    setChosenReduceTo(pickDefault(PREFERRED_REDUCE_TO[problemName], reduceToOptions));
  });

  return [chosenReduceTo, setChosenReduceTo];
}

function useReductionNameMap(url, problemName, chosenReduceTo) {
  const [reductionNameMap, setReductionNameMap] = useState(new Map());

  useEffect(() => {
    let ignore = false;
    (async () => {
      const map = chosenReduceTo
        ? await requestReductionNameMap(url, problemName, chosenReduceTo)
        : new Map();
      if (!ignore) setReductionNameMap(map);
    })();
    return () => {
      ignore = true;
    };
  }, [chosenReduceTo, url, problemName]);

  return [reductionNameMap, setReductionNameMap];
}

async function requestReductionNameMap(url, problemFrom, problemTo) {
  let map = new Map();
  const reductions = (await requestReductions(url, problemFrom, problemTo)) ?? [];
  for (const r of reductions) {
    for (const reduction of r) {
      const info = await requestReductionInfo(url, reduction);
      if (info) {
        map.set(reduction, info.reductionName);
      }
    }
  }
  return map;
}
