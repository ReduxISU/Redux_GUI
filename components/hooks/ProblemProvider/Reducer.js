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

function pickDefault(preferred, options) {
  return options.includes(preferred) ? preferred : (options[0] ?? "");
}

export function useReducer(url, problemName, problemInstance) {
  const state = {};
  [state.reduceToOptions] = useReduceToOptions(url, problemName);
  [state.chosenReduceTo, state.setChosenReduceTo] = useChosenReduceTo(
    problemName,
    state.reduceToOptions,
  );
  [state.reductionNameMap] = useReductionNameMap(url, problemName, state.chosenReduceTo);
  [state.reductionTypeOptions] = useReductionTypeOptions(url, problemName, state.chosenReduceTo);
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
    (async () => {
      setGenericInfo(
        !reducer ? {} : ((await requestReductionInfo(url, (reducer ?? "").split("-")[0])) ?? {}),
      );
    })();
  }, [reducer, url]);

  return genericInfo; // There should be no reason to set the information
}

function useReducedInstance(url, problemInstance, chosenReduceTo, chosenReductionType) {
  const [reducedInstance, setReducedInstance] = useState("");

  useWhenChanged([chosenReductionType, chosenReduceTo], () => setReducedInstance(""));

  // Automatically reduces the instance one the reduction type is chosen.
  // This makes it so it's less input from the user but also makes the "Reduce" button effectly useless.
  useEffect(() => {
    (async () => {
      setReducedInstance(
        chosenReductionType && problemInstance
          ? ((await requestReducedInstanceFromPath(url, chosenReductionType, problemInstance)) ??
              "")
          : "",
      );
    })();
  }, [chosenReductionType, problemInstance, url]);

  return [reducedInstance, setReducedInstance];
}

function useReductionVisualization(url, chosenReduceTo) {
  const [reductionVisualization, setReductionVisualization] = useState("");

  useEffect(() => {
    (async () => {
      const info = chosenReduceTo ? await requestInfo(url, chosenReduceTo) : null;
      setReductionVisualization(info?.defaultVisualization?.visualizationType ?? "");
    })();
  }, [url, chosenReduceTo]);

  return [reductionVisualization, setReductionVisualization];
}

function useReduceToOptions(url, problemName) {
  const [reduceToOptions, setReduceToOptions] = useState([]);

  useEffect(() => {
    (async () => {
      setReduceToOptions(
        (problemName ? ((await requestReductionOptions(url, problemName)) ?? []) : []).sort(),
      );
    })();
  }, [problemName, url]);

  return [reduceToOptions, setReduceToOptions];
}

function useReductionTypeOptions(url, problemName, chosenReduceTo) {
  const [reductionTypeOptions, setReductionTypeOptions] = useState([]);

  async function requestPreparedReductions(url, problemName, chosenReduceTo) {
    const reductions = (await requestReductions(url, problemName, chosenReduceTo)) ?? [];
    let path = "";
    for (const reduction of reductions) {
      path += reduction[0] + "-";
    }
    return path !== "" ? [path.slice(0, -1)] : [];
  }

  useEffect(() => {
    (async () => {
      setReductionTypeOptions(
        (problemName && chosenReduceTo
          ? ((await requestPreparedReductions(url, problemName, chosenReduceTo)) ?? [])
          : []
        ).sort(),
      );
    })();
  }, [chosenReduceTo, url, problemName]);

  return [reductionTypeOptions, setReductionTypeOptions];
}

function useChosenReductionType(problemName, chosenReduceTo, reductionTypeOptions) {
  const [chosenReductionType, setChosenReductionType] = useState("");

  useWhenChanged([problemName, chosenReduceTo], () => setChosenReductionType(""));

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
    (async () => {
      setReductionNameMap(
        chosenReduceTo
          ? await requestReductionNameMap(url, problemName, chosenReduceTo)
          : new Map(),
      );
    })();
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
