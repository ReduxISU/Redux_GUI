import React, { useEffect, useRef, useState } from "react";
import {
  requestAllInfo,
  requestAllVisualizations,
  requestAllVisualizationTypes,
} from "../../redux";
import { isRenderable } from "../../Visualization/svgs/renderability";
import { useGenericInfo } from "../ProblemProvider";

export function useVisualization(url, problemName, problemNameMap, problemInfoMap) {
  const state = {};
  [state.defaultVisualizationMap] = useDefaultVisualizationMap(url, problemInfoMap);
  [state.VisualizationOptions] = useVisualizationOptions(url, problemName);
  state.visualizationTypeMap = useVisualizationTypeMap(url, state.VisualizationOptions);
  [state.chosenVisualization, state.setChosenVisualization] = useChosenVisualization(
    problemName,
    state.defaultVisualizationMap,
    state.VisualizationOptions,
    state.visualizationTypeMap,
  );
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
          info?.defaultVisualization?.VisualizationName,
      )
      .filter(Boolean);
    (async () => {
      const allVisualizations = (await requestAllVisualizations(url)) ?? {};
      const allInfo = (await requestAllInfo(url)) ?? {};

      let map = new Map();
      for (const problem of problems) {
        const visualizations = allVisualizations[problem] ?? [];
        for (const visualization of visualizations) {
          const info = allInfo[visualization];
          const visName = info?.visualizationName || info?.VisualizationName;
          if (visName && defaultVisualizationNames.includes(visName)) {
            map.set(problem, visualization);
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

/**
 * Bridges `VisualizationOptions` (visualization CLASS NAMES, e.g.
 * "CliqueDefaultVisualization") to the renderer registry, which is keyed on
 * `visualizationType` (e.g. "GraphD3") -- returns a `Map<className, type>`.
 *
 * Prefers the `Navigation/Batch/allVisualizationTypes` endpoint. That
 * endpoint may not be deployed on the connected API yet, in which case
 * `requestAllVisualizationTypes` resolves to `undefined` (fetchJson
 * swallows the failure), and this falls back to reading `visualizationType`
 * off each class's entry in `allInfo` instead. Both paths must work.
 */
function useVisualizationTypeMap(url, VisualizationOptions) {
  const [visualizationTypeMap, setVisualizationTypeMap] = useState(new Map());

  useEffect(() => {
    (async () => {
      if (!VisualizationOptions?.length) {
        setVisualizationTypeMap(new Map());
        return;
      }

      const allTypes = await requestAllVisualizationTypes(url);
      const map = new Map();

      if (allTypes) {
        for (const className of VisualizationOptions) {
          const type = allTypes[className];
          if (type) map.set(className, type);
        }
      } else {
        // allVisualizationTypes isn't deployed on the connected API yet --
        // derive the same className -> type mapping from allInfo, which
        // already carries visualizationType per visualization.
        const allInfo = (await requestAllInfo(url)) ?? {};
        for (const className of VisualizationOptions) {
          const type =
            allInfo[className]?.visualizationType || allInfo[className]?.VisualizationType;
          if (type) map.set(className, type);
        }
      }

      setVisualizationTypeMap(map);
    })();
  }, [url, VisualizationOptions]);

  return visualizationTypeMap;
}

function useChosenVisualization(
  problemName,
  defaultVisualizationMap,
  VisualizationOptions,
  visualizationTypeMap,
) {
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

    if (problemName !== lastProblem.current) {
      lastProblem.current = problemName;
      userSelected.current = false;
    }

    // An explicit user choice (this session) always wins; never overwrite it
    // with a re-resolved default.
    if (userSelected.current) return;

    const isOptionRenderable = (option) => isRenderable(visualizationTypeMap.get(option));

    // Resolution order:
    //   1. stored per-problem user choice (survives switching problems and back)
    //   2. backend-declared default from defaultVisualizationMap, iff it is renderable
    //   3. first renderable option
    //   4. "" -- explicit empty state; nothing renderable for this problem
    const stored = byProblem[problemName];
    const backendDefault = defaultVisualizationMap.get(problemName);
    const next =
      stored ??
      (backendDefault && isOptionRenderable(backendDefault) ? backendDefault : undefined) ??
      (VisualizationOptions ?? []).find(isOptionRenderable) ??
      "";

    if (next !== chosenVisualization) {
      setChosenVisualization(next);
    }
  }, [
    problemName,
    defaultVisualizationMap,
    VisualizationOptions,
    visualizationTypeMap,
    byProblem,
    chosenVisualization,
  ]);

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
            info?.visualizationName || info?.VisualizationName || visualization,
          );
        }
      }
      setVisualizationNameMap(map);
    })();
  }, [url, problemNameMap]);

  return [VisualizationNameMap, setVisualizationNameMap];
}
