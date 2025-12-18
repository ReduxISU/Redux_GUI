import { useGenericInfo } from "../ProblemProvider";
import { requestInfo, requestVisualizations } from "../../redux";
import React, { useEffect, useState, useRef } from "react";

export function useVisualization(url, problemName, problemType, problemNameMap, problemInfoMap) {
  const state = {};
  [state.defaultVisualizationMap] = useDefaultVisualizationMap(url, problemInfoMap);
  [state.VisualizationOptions] = useVisualizationOptions(url, problemName, problemType);
  [state.chosenVisualization, state.setChosenVisualization] = useChosenVisualization(problemName, state.defaultVisualizationMap);
  [state.VisualizationNameMap] = useVisualizationNameMap(url, problemNameMap);
  return state;
}

export function useVisualizationInfo(url, Visualization) {
  return useGenericInfo(url, Visualization);
}

function useDefaultVisualizationMap(url, problemInfoMap) {
  const [defaultVisualizationMap, setDefaultVisualizationMap] = useState(new Map());

  useEffect(() => {
    const problems = [...problemInfoMap.keys()];
    const defaultVisualizationNames = [...problemInfoMap.values()].map((info) => info.defaultVisualization.VisualizationName);
    requestDefaultVisualizationFileMap(url, problems, defaultVisualizationNames).then((defaultVisualizationFileNames) => {
      setDefaultVisualizationMap(defaultVisualizationFileNames);
    });
  }, [problemInfoMap]);

  //The requestDefaultVisualizationFileMap sets the Visualization names by the file name
  async function requestDefaultVisualizationFileMap(url, problems, defaultVisualizationNames) {
    let map = new Map();
    for (const problem of problems) {
      const Visualizations = (await requestVisualizations(url, problem)) ?? [];
      for (const v of Visualizations) {
        const Visualization = v.split(" ")[0];
        const info = await requestInfo(url, Visualization);
        if (info && defaultVisualizationNames.includes(info.VisualizationName)) {
          map.set(problem, v);
        }
      }
    }
    return map;
  }

  return [defaultVisualizationMap, setDefaultVisualizationMap];
}

function useVisualizationOptions(url, problemName, problemType) {
  const [VisualizationOptions, setVisualizationOptions] = useState([]);

  useEffect(() => {
    (async () => {
      setVisualizationOptions(
        problemName && problemType ? (await requestVisualizations(url, problemName, problemType)) ?? [] : []
      );
    })();
  }, [problemName, problemType]);

  return [VisualizationOptions, setVisualizationOptions];
}

function useChosenVisualization(problemName, defaultVisualizationMap) {
  const [chosenVisualization, setChosenVisualization] = useState("");
  const [byProblem, setByProblem] = useState({}); // { [problemName]: vis }
  const userSelected = useRef(false);
  const lastProblem = useRef(null);

  const setChosenVisualizationSafe = (value) => {
    userSelected.current = true;
    setByProblem((prev) => ({ ...prev, [problemName]: value }));
    setChosenVisualization(value);
  };

  useEffect(() => {
    if (!problemName) return;

    // On problem change: load stored or default
    if (problemName !== lastProblem.current) {
      lastProblem.current = problemName;
      userSelected.current = false;
      const stored = byProblem[problemName];
      const def = defaultVisualizationMap.get(problemName) || "";
      const next = stored ?? def;
      setChosenVisualization(next);
      return;
    }

    // After defaults load for the same problem: only if nothing chosen/stored
    if (!userSelected.current && !byProblem[problemName] && !chosenVisualization) {
      const def = defaultVisualizationMap.get(problemName) || "";
      setChosenVisualization(def);
    }
  }, [problemName, defaultVisualizationMap, chosenVisualization, byProblem]);

  return [chosenVisualization, setChosenVisualizationSafe];
}


function useVisualizationNameMap(url, problemNameMap) {
  const [VisualizationNameMap, setVisualizationNameMap] = useState(new Map());

  useEffect(() => {
    const problems = Array.from(problemNameMap.keys());
    requestVisualizationNameMap(url, problems).then((VisualizationMap) => {
      setVisualizationNameMap(VisualizationMap);
    });
  }, [problemNameMap]);

  //The following the functions are used to set the Visualization names
  async function requestVisualizationNameMap(url, problems) {
    let map = new Map();
    for (const problem of problems) {
      const Visualizations = (await requestVisualizations(url, problem)) ?? [];
      for (const Visualization of Visualizations) {
        const info = await requestInfo(url, Visualization);
        if (info) {
          map.set(Visualization, info.visualizationName);
        }
      }
    }
    return map;
  }

  return [VisualizationNameMap, setVisualizationNameMap];
}
