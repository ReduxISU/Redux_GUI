import React, { useEffect, useRef, useState } from "react";
import {
  requestInfo,
  requestReducedInstanceFromPath,
  requestReductionInfo,
  requestReductionOptions,
  requestReductions,
} from "../../redux";
import { useGenericInfo } from "../ProblemProvider";

// For initial startup defaults
const DEFAULT_SAT3_CHOSEN_REDUCE_TO = "CLIQUE";
const DEFAULT_CLIQUE_CHOSEN_REDUCTION_TYPE = "SipserReduceToCliqueStandard";
const DEFAULT_CLIQUE_CHOSEN_REDUCE_TO = "VERTEXCOVER";
const DEFAULT_VERTEXCOVER_CHOSEN_REDUCTION_TYPE = "sipserReduceToVC";

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

  useEffect(() => {
    setReducedInstance("");
  }, [chosenReductionType, chosenReduceTo]);

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
    if (!chosenReduceTo) {
      setReductionVisualization("");
      return;
    }

    (async () => {
      const info = await requestInfo(url, chosenReduceTo);
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
  const isFirstRender = useRef(true);

  useEffect(() => {
    setChosenReductionType("");
  }, [problemName, chosenReduceTo]);

  useEffect(() => {
    if (reductionTypeOptions.length === 0) return;

    const storedData = null;

    if (isFirstRender.current) {
      // First render: read from localStorage
      if (storedData) {
        const allData = JSON.parse(storedData);
        setChosenReductionType(allData.reductionType);
        isFirstRender.current = false;
        if (allData.reductionType !== "") return;
      }
      isFirstRender.current = false;
    }

    if (
      chosenReduceTo === "CLIQUE" &&
      reductionTypeOptions.includes(DEFAULT_CLIQUE_CHOSEN_REDUCTION_TYPE)
    ) {
      setChosenReductionType(DEFAULT_CLIQUE_CHOSEN_REDUCTION_TYPE);
    } else if (
      chosenReduceTo === "VERTEXCOVER" &&
      reductionTypeOptions.includes(DEFAULT_VERTEXCOVER_CHOSEN_REDUCTION_TYPE)
    ) {
      setChosenReductionType(DEFAULT_VERTEXCOVER_CHOSEN_REDUCTION_TYPE);
    } else {
      setChosenReductionType(!reductionTypeOptions.length ? "" : reductionTypeOptions[0]);
    }
  }, [reductionTypeOptions, chosenReduceTo]);

  return [chosenReductionType, setChosenReductionType];
}

function useChosenReduceTo(problemName, reduceToOptions) {
  const [chosenReduceTo, setChosenReduceTo] = useState("");
  const isFirstRender = useRef(true);

  useEffect(() => {
    setChosenReduceTo("");
  }, [problemName]);

  useEffect(() => {
    if (reduceToOptions.length === 0) return;
    const storedData = null;

    if (isFirstRender.current) {
      // First render: read from localStorage
      if (storedData) {
        const allData = JSON.parse(storedData);
        setChosenReduceTo(allData.reduceTo);
        isFirstRender.current = false;
        if (allData.reduceTo !== "") return;
      }
      isFirstRender.current = false;
    }

    if (problemName === "SAT3" && reduceToOptions.includes(DEFAULT_SAT3_CHOSEN_REDUCE_TO)) {
      setChosenReduceTo(DEFAULT_SAT3_CHOSEN_REDUCE_TO);
    } else if (
      problemName === "CLIQUE" &&
      reduceToOptions.includes(DEFAULT_CLIQUE_CHOSEN_REDUCE_TO)
    ) {
      setChosenReduceTo(DEFAULT_CLIQUE_CHOSEN_REDUCE_TO);
    } else {
      setChosenReduceTo(!reduceToOptions.length ? "" : reduceToOptions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceToOptions]); // problemName intentionally omitted: it's a follower of reduceToOptions.
  // When problemName changes, reduceToOptions recomputes and re-fires this
  // effect with the current problemName already in scope. Adding problemName
  // directly would fire this effect while reduceToOptions still holds stale
  // values from the previous problem, setting a wrong default.

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
  }, [chosenReduceTo, url, problemName]);

  // The following the functions are used to set the reduction names
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

  return [reductionNameMap, setReductionNameMap];
}
