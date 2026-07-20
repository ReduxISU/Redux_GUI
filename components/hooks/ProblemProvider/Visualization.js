import { useGenericInfo } from "../ProblemProvider";
import { requestAllVisualizations, requestAllInfo } from "../../redux";
import React, { useEffect, useState, useRef } from "react";

export function useVisualization(url, problemName, problemNameMap, problemInfoMap) {
  const state = {};
  [state.defaultVisualizationMap] = useDefaultVisualizationMap(url, problemInfoMap);
  [state.VisualizationOptions] = useVisualizationOptions(url, problemName);
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
    const defaultVisualizationNames = [...problemInfoMap.values()]
      .map(
        (info) =>
          info?.defaultVisualization?.visualizationName ||
          info?.defaultVisualization?.VisualizationName
      )
      .filter(Boolean);
    (async () => {
      const allVisualizations = (await requestAllVisualizations(url)) ?? {};
      const allInfo = (await requestAllInfo(url)) ?? {};

      let map = new Map();
      for (const problem of problems) {
        const visualizations = allVisualizations[problem] ?? [];
        for (const v of visualizations) {
          const visualization = v.split(" ")[0];
          const info = allInfo[visualization];
          const visName = info?.visualizationName || info?.VisualizationName;
          if (visName && defaultVisualizationNames.includes(visName)) {
            map.set(problem, v);
          }
        }
      }
      setDefaultVisualizationMap(map);
    })();
  }, [url, problemInfoMap]);

  return [defaultVisualizationMap, setDefaultVisualizationMap];
}

function useVisualizationOptions(url, problemName) {
  const [VisualizationOptions, setVisualizationOptions] = useState([]);

  useEffect(() => {
    (async () => {
      if (!problemName) {
        setVisualizationOptions([]);
        return;
      }
      const allVisualizations = (await requestAllVisualizations(url)) ?? {};
      setVisualizationOptions(allVisualizations[problemName] ?? []);
    })();
  }, [problemName, url]);

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

    (async () => {
      const allVisualizations = (await requestAllVisualizations(url)) ?? {};
      const allInfo = (await requestAllInfo(url)) ?? {};

      let map = new Map();
      for (const problem of problems) {
        const visualizations = allVisualizations[problem] ?? [];
        for (const visualization of visualizations) {
          const info = allInfo[visualization];
          map.set(
            visualization,
            info?.visualizationName || info?.VisualizationName || visualization
          );
        }
      }
      setVisualizationNameMap(map);
    })();
  }, [url, problemNameMap]);

  return [VisualizationNameMap, setVisualizationNameMap];
}
