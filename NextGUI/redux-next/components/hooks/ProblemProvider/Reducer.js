import { useGenericInfo } from "../ProblemProvider";
import { requestReductionOptions, requestInfo, requestReductions, requestReducedInstanceFromPath } from "../../redux";
import React, { useEffect, useState } from "react";

// For initial startup defaults
const DEFAULT_SAT3_CHOSEN_REDUCE_TO = "CLIQUE";
const DEFAULT_CLIQUE_CHOSEN_REDUCTION_TYPE = "SipserReduceToCliqueStandard";
const DEFAULT_CLIQUE_CHOSEN_REDUCE_TO = "VERTEXCOVER";
const DEFAULT_VERTEXCOVER_CHOSEN_REDUCTION_TYPE = "sipserReduceToVC";

export function useReducer(url, problemName, problemType, problemInstance) {
  const state = {};
  [state.reduceToOptions] = useReduceToOptions(url, problemName, problemType);
  [state.chosenReduceTo, state.setChosenReduceTo] = useChosenReduceTo(problemName, state.reduceToOptions);
  [state.reductionNameMap] = useReductionNameMap(url, problemName, state.chosenReduceTo);
  [state.reductionTypeOptions] = useReductionTypeOptions(url, problemName, problemType, state.chosenReduceTo);
  [state.chosenReductionType, state.setChosenReductionType] = useChosenReductionType(
    problemName,
    state.chosenReduceTo,
    state.reductionTypeOptions
  );
  [state.reducedInstance, state.setReducedInstance] = useReducedInstance(
    url,
    problemInstance,
    state.chosenReduceTo,
    state.chosenReductionType
  );
  return state;
}

export function useReducerInfo(url, reducer) {
  return useGenericInfo(url, (reducer ?? "").split("-")[0]);
}

function useReducedInstance(url, problemInstance, chosenReduceTo, chosenReductionType) {
  const [reducedInstance, setReducedInstance] = useState("");

  useEffect(() => {
    setReducedInstance("");
  }, [chosenReductionType, chosenReduceTo]);

  // Automatically reduces the instance one the reduction type is chosen.
  // This makes it so it's less input from the user but also makes the "Reduce" button effectly useless.
  useEffect(() => {
    (async () => {
      setReducedInstance(
        chosenReductionType && problemInstance
          ? (await requestReducedInstanceFromPath(url, chosenReductionType, problemInstance)) ?? ""
          : ""
      );
    })();
  }, [chosenReductionType, problemInstance]);

  return [reducedInstance, setReducedInstance];
}

function useReduceToOptions(url, problemName, problemType) {
  const [reduceToOptions, setReduceToOptions] = useState([]);

  useEffect(() => {
    (async () => {
      setReduceToOptions(
        (problemName && problemType ? (await requestReductionOptions(url, problemName, problemType)) ?? [] : []).sort()
      );
    })();
  }, [problemName, problemType]);

  return [reduceToOptions, setReduceToOptions];
}

function useReductionTypeOptions(url, problemName, problemType, chosenReduceTo) {
  const [reductionTypeOptions, setReductionTypeOptions] = useState([]);

  useEffect(() => {
    (async () => {
      setReductionTypeOptions(
        (problemName && problemType && chosenReduceTo
          ? (await requestPreparedReductions(url, problemName, chosenReduceTo, problemType)) ?? []
          : []
        ).sort()
      );
    })();
  }, [problemType, chosenReduceTo]);

  async function requestPreparedReductions(url, problemName, chosenReduceTo, problemType) {
    const reductions = (await requestReductions(url, problemName, chosenReduceTo, problemType)) ?? [];
    let path = "";
    for (const reduction of reductions) {
      path += reduction[0] + "-";
    }
    return [path.slice(0, -1)];
  }

  return [reductionTypeOptions, setReductionTypeOptions];
}

function useChosenReductionType(problemName, chosenReduceTo, reductionTypeOptions) {
  const [chosenReductionType, setChosenReductionType] = useState("");

  useEffect(() => {
    setChosenReductionType("");
  }, [problemName, chosenReduceTo]);

  useEffect(() => {
    if (chosenReduceTo === "CLIQUE" && reductionTypeOptions.includes(DEFAULT_CLIQUE_CHOSEN_REDUCTION_TYPE)) {
      setChosenReductionType(DEFAULT_CLIQUE_CHOSEN_REDUCTION_TYPE);
    } else if (
      chosenReduceTo === "VERTEXCOVER" &&
      reductionTypeOptions.includes(DEFAULT_VERTEXCOVER_CHOSEN_REDUCTION_TYPE)
    ) {
      setChosenReductionType(DEFAULT_VERTEXCOVER_CHOSEN_REDUCTION_TYPE);
    } else {
      setChosenReductionType(!reductionTypeOptions.length ? "" : reductionTypeOptions[0]);
    }
  }, [reductionTypeOptions]);

  return [chosenReductionType, setChosenReductionType];
}

function useChosenReduceTo(problemName, reduceToOptions) {
  const [chosenReduceTo, setChosenReduceTo] = useState("");

  useEffect(() => {
    setChosenReduceTo("");
  }, [problemName]);

  useEffect(() => {
    if (problemName === "SAT3" && reduceToOptions.includes(DEFAULT_SAT3_CHOSEN_REDUCE_TO)) {
      setChosenReduceTo(DEFAULT_SAT3_CHOSEN_REDUCE_TO);
    } else if (problemName === "CLIQUE" && reduceToOptions.includes(DEFAULT_CLIQUE_CHOSEN_REDUCE_TO)) {
      setChosenReduceTo(DEFAULT_CLIQUE_CHOSEN_REDUCE_TO);
    } else {
      setChosenReduceTo(!reduceToOptions.length ? "" : reduceToOptions[0]);
    }
  }, [reduceToOptions]);

  return [chosenReduceTo, setChosenReduceTo];
}

function useReductionNameMap(url, problemName, chosenReduceTo) {
  const [reductionNameMap, setReductionNameMap] = useState(new Map());

  useEffect(() => {
    if (chosenReduceTo) {
      requestReductionNameMap(url, problemName, chosenReduceTo).then((reductionMap) => {
        setReductionNameMap(reductionMap);
      });
    } else {
      setReductionNameMap(new Map());
    }
  }, [chosenReduceTo]);

  // The following the functions are used to set the reduction names
  async function requestReductionNameMap(url, problemFrom, problemTo) {
    let map = new Map();
    const reductions = (await requestReductions(url, problemFrom, problemTo)) ?? [];
    for (const r of reductions) {
      for (const reduction of r) {
        const info = await requestInfo(url, reduction);
        if (info) {
          map.set(reduction, info.reductionName);
        }
      }
    }
    return map;
  }

  return [reductionNameMap, setReductionNameMap];
}
