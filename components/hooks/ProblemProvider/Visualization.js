import { useEffect, useState } from "react";
import {
  requestAllInfo,
  requestAllVisualizations,
  requestAllVisualizationTypes,
} from "../../redux";
import { isRenderable } from "../../Visualization/svgs/renderability";
import { useGenericInfoWithStatus } from "../ProblemProvider";

export function useVisualization(url, problemName, problemNameMap, problemInfoMap) {
  const state = {};
  let optionsStatus, optionsError, typesStatus, typesError;
  [state.defaultVisualizationMap] = useDefaultVisualizationMap(url, problemInfoMap);
  [state.VisualizationOptions, optionsStatus, optionsError] = useVisualizationOptions(
    url,
    problemName,
  );
  [state.visualizationTypeMap, typesStatus, typesError] = useVisualizationTypeMap(
    url,
    state.VisualizationOptions,
  );
  // Whether the current problem's list of pictures (and their types, which decide the default)
  // is "loading", "failed" or "ready", so the Visualize row can say so instead of staying blank;
  // visualizationListError is { step, detail } saying what went wrong when it failed.
  state.visualizationListError =
    optionsStatus === "failed"
      ? { step: "Picture list request", detail: optionsError }
      : typesStatus === "failed"
        ? { step: "Picture types request", detail: typesError }
        : null;
  state.visualizationListStatus =
    optionsStatus === "failed" || typesStatus === "failed"
      ? "failed"
      : optionsStatus === "loading" || typesStatus === "loading"
        ? "loading"
        : "ready";
  [state.chosenVisualization, state.setChosenVisualization] = useChosenVisualization(
    problemName,
    state.defaultVisualizationMap,
    state.VisualizationOptions,
    state.visualizationTypeMap,
  );
  [state.VisualizationNameMap] = useVisualizationNameMap(url, problemNameMap);
  return state;
}

// Returns [info, status, error] (see useGenericInfoWithStatus).
export function useVisualizationInfo(url, Visualization) {
  return useGenericInfoWithStatus(url, Visualization);
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

// One shared empty list, so "not loaded yet" keeps the same identity from render to render.
const NO_OPTIONS = [];

// Options are kept together with the problem they were fetched for, and hidden until the current
// problem's arrive, so a switch never picks (and requests) the previous problem's visualization.
// Returns [options, status, error], status being "loading", "failed" or "ready".
function useVisualizationOptions(url, problemName) {
  const [fetched, setFetched] = useState({
    problemName: undefined,
    options: NO_OPTIONS,
    error: null,
  });

  useEffect(() => {
    let ignore = false;
    (async () => {
      let error = null;
      const allVisualizations = problemName
        ? await requestAllVisualizations(url, (detail) => {
            error = detail;
          })
        : {};
      if (!ignore) {
        setFetched({
          problemName,
          options: allVisualizations?.[problemName] ?? [],
          error: allVisualizations === undefined ? (error ?? "No answer.") : null,
        });
      }
    })();
    return () => {
      ignore = true;
    };
  }, [problemName, url]);

  if (fetched.problemName !== problemName) return [NO_OPTIONS, "loading", null];
  return [fetched.options, fetched.error ? "failed" : "ready", fetched.error];
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
  // The map is kept with the options it was built for, to tell "still loading" from "done".
  const [fetched, setFetched] = useState({ options: undefined, map: new Map(), error: null });

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!VisualizationOptions?.length) {
        if (!ignore) setFetched({ options: VisualizationOptions, map: new Map(), error: null });
        return;
      }

      const allTypes = await requestAllVisualizationTypes(url);
      const map = new Map();
      let error = null;

      if (allTypes) {
        for (const className of VisualizationOptions) {
          const type = allTypes[className];
          if (type) map.set(className, type);
        }
      } else {
        // allVisualizationTypes isn't deployed on the connected API yet --
        // derive the same className -> type mapping from allInfo, which
        // already carries visualizationType per visualization.
        const allInfo = await requestAllInfo(url, (detail) => {
          error = detail;
        });
        if (allInfo === undefined) error ??= "No answer.";
        for (const className of VisualizationOptions) {
          const type =
            allInfo?.[className]?.visualizationType || allInfo?.[className]?.VisualizationType;
          if (type) map.set(className, type);
        }
      }

      if (!ignore) setFetched({ options: VisualizationOptions, map, error });
    })();
    return () => {
      ignore = true;
    };
  }, [url, VisualizationOptions]);

  // Returns [map, status, error]; until the current options' types arrive the last map is kept
  // (as before) and the status is "loading". "failed" means neither types source answered.
  if (fetched.options !== VisualizationOptions) return [fetched.map, "loading", null];
  return [fetched.map, fetched.error ? "failed" : "ready", fetched.error];
}

function useChosenVisualization(
  problemName,
  defaultVisualizationMap,
  VisualizationOptions,
  visualizationTypeMap,
) {
  const [byProblem, setByProblem] = useState({}); // { [problemName]: vis }

  const setChosenVisualizationSafe = (value) => {
    setByProblem((prev) => ({ ...prev, [problemName]: value }));
  };

  // Derived, not stored: chosenVisualization is a pure function of the arguments above, so
  // it's computed directly during render instead of via an Effect + setState (the latter
  // triggers an extra "cascading render" -- see
  // https://react.dev/learn/you-might-not-need-an-effect). byProblem already reflects a
  // just-made user choice by the very next render (setByProblem and this computation now
  // run in the same pass), so no separate "user selected" guard is needed: an explicit
  // choice already wins via the `stored` branch below, with no effect-lag window where it
  // could be raced by a re-resolved default.
  //
  // Resolution order:
  //   1. stored per-problem user choice (survives switching problems and back)
  //   2. backend-declared default from defaultVisualizationMap, iff it is renderable
  //   3. first renderable option
  //   4. "" -- explicit empty state; nothing renderable for this problem
  let chosenVisualization = "";
  if (problemName) {
    const isOptionRenderable = (option) => isRenderable(visualizationTypeMap.get(option));
    const stored = byProblem[problemName];
    const backendDefault = defaultVisualizationMap.get(problemName);
    chosenVisualization =
      stored ??
      (backendDefault && isOptionRenderable(backendDefault) ? backendDefault : undefined) ??
      (VisualizationOptions ?? []).find(isOptionRenderable) ??
      "";
  }

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
