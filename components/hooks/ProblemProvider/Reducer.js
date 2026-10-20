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
  let reduceToOptionsLoaded, reductionTypeOptionsLoaded;
  [state.reduceToOptions, reduceToOptionsLoaded] = useReduceToOptions(url, problemName);
  [state.chosenReduceTo, state.setChosenReduceTo] = useChosenReduceTo(
    problemName,
    state.reduceToOptions,
  );
  [state.reductionNameMap] = useReductionNameMap(url, problemName, state.chosenReduceTo);
  [state.reductionTypeOptions, reductionTypeOptionsLoaded] = useReductionTypeOptions(
    url,
    problemName,
    state.chosenReduceTo,
  );
  // True once it is known there is nothing to reduce: the problem has no targets, or the chosen
  // target has no reduction path. It stays false while the options are loading.
  state.noReductions =
    (reduceToOptionsLoaded && state.reduceToOptions.length === 0) ||
    (!!state.chosenReduceTo &&
      reductionTypeOptionsLoaded &&
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
  [state.reductionVisualization, state.setReductionVisualization] = useReductionVisualization(
    url,
    state.chosenReduceTo,
  );
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
function useReductionVisualization(url, chosenReduceTo) {
  const [fetched, setFetched] = useState({ reduceTo: undefined, type: "" });

  useEffect(() => {
    let ignore = false;
    (async () => {
      const info = chosenReduceTo ? await requestInfo(url, chosenReduceTo) : null;
      if (!ignore) {
        setFetched({
          reduceTo: chosenReduceTo,
          type: info?.defaultVisualization?.visualizationType ?? "",
        });
      }
    })();
    return () => {
      ignore = true;
    };
  }, [url, chosenReduceTo]);

  const setReductionVisualization = (type) => setFetched({ reduceTo: chosenReduceTo, type });
  return [
    fetched.reduceTo === chosenReduceTo ? fetched.type : undefined,
    setReductionVisualization,
  ];
}

// Options are kept together with the problem they were fetched for. Until the current problem's
// arrive this returns NO_OPTIONS and loaded = false, so nothing picks from another problem's list.
function useReduceToOptions(url, problemName) {
  const [fetched, setFetched] = useState({ problemName: undefined, options: NO_OPTIONS });

  useEffect(() => {
    let ignore = false;
    (async () => {
      const options = (
        problemName ? ((await requestReductionOptions(url, problemName)) ?? []) : []
      ).sort();
      if (!ignore) setFetched({ problemName, options });
    })();
    return () => {
      ignore = true;
    };
  }, [problemName, url]);

  const loaded = fetched.problemName === problemName;
  return [loaded ? fetched.options : NO_OPTIONS, loaded];
}

function useReductionTypeOptions(url, problemName, chosenReduceTo) {
  const [fetched, setFetched] = useState({
    problemName: undefined,
    chosenReduceTo: undefined,
    options: NO_OPTIONS,
  });

  async function requestPreparedReductions(url, problemName, chosenReduceTo) {
    const reductions = (await requestReductions(url, problemName, chosenReduceTo)) ?? [];
    let path = "";
    for (const reduction of reductions) {
      path += reduction[0] + "-";
    }
    return path !== "" ? [path.slice(0, -1)] : [];
  }

  useEffect(() => {
    let ignore = false;
    (async () => {
      const options = (
        problemName && chosenReduceTo
          ? ((await requestPreparedReductions(url, problemName, chosenReduceTo)) ?? [])
          : []
      ).sort();
      if (!ignore) setFetched({ problemName, chosenReduceTo, options });
    })();
    return () => {
      ignore = true;
    };
  }, [chosenReduceTo, url, problemName]);

  // Right after a problem or target switch the stored options still belong to the old one. Hide
  // them until the current ones arrive, so the default below never re-picks the old reduction.
  const loaded = fetched.problemName === problemName && fetched.chosenReduceTo === chosenReduceTo;
  return [loaded ? fetched.options : NO_OPTIONS, loaded];
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
