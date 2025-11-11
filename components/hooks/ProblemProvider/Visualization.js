import { useGenericInfo } from "../ProblemProvider";
import { requestInfo, requestVisualizations } from "../../redux";
import React, { useEffect, useState, useRef } from "react";

export function useVisualization(url, problemName, problemType, problemNameMap, problemInfoMap) {
  const state = {};
  [state.defaultVisualizationMap] = useDefaultVisualizationMap(url, problemInfoMap);
  [state.VisualizationOptions] = useVisualizationOptions(url, problemName, problemType);
  [state.chosenVisualization, state.setChosenVisualization] = useChosenVisualization(problemName, state.defaultVisualizationMap);
  [state.visualizationNameMap] = useVisualizationNameMap(url, problemNameMap);
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
  const hasLoadedFromStorage = useRef(false);

  useEffect(() => {
    if (!problemName || defaultVisualizationMap.size === 0) return;

    // Only load localStorage once
    if (!hasLoadedFromStorage.current) {
      const storedData = localStorage.getItem('problemData');
      if (storedData) {
        const allData = JSON.parse(storedData);
        setChosenVisualization(allData.Visualization || "");
        hasLoadedFromStorage.current = true;
        return; // skip setting default from map on first render if localStorage exists
      }
      hasLoadedFromStorage.current = true;
    }

    // fallback to default from map
    const defaultVisualization = defaultVisualizationMap.get(problemName) || "";
    setChosenVisualization(defaultVisualization);

  }, [problemName, defaultVisualizationMap]);

  return [chosenVisualization, setChosenVisualization];
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
