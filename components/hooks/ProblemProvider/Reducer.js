import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  requestInfo,
  requestReducedInstanceFromPath,
  requestReductionInfo,
  requestReductionOptions,
  requestReductions,
  userFacingError,
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

// `restore` is a shared link's view (see useProblemProvider): its target and reduction are picked
// over the defaults. While `held` is true nothing is reduced on its own; Reduce then only calls
// `releaseHold`, and the release itself starts the reduction.
export function useReducer(url, problemName, problemInstance, restore, held, releaseHold) {
  const state = {};
  let reduceToOptionsLoaded, reductionTypeOptionsLoaded, reduceToError, reductionTypeError;
  [state.reduceToOptions, reduceToOptionsLoaded, reduceToError] = useReduceToOptions(
    url,
    problemName,
  );
  [state.chosenReduceTo, state.setChosenReduceTo] = useChosenReduceTo(
    problemName,
    state.reduceToOptions,
    restore,
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
    restore,
  );
  [state.reducedInstance, state.setReducedInstance, state.reduce, state.reduceError] =
    useReducedInstance(
      url,
      problemInstance,
      state.chosenReduceTo,
      state.chosenReductionType,
      held,
      releaseHold,
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

// Returns [reducedInstance, setReducedInstance, reduce, reduceError]. `reduce` runs the chosen
// reduction on the instance again (the Reduce button); it also runs by itself whenever the
// instance or reduction changes, except while `held` (a just-restored shared view). reduceError is { message, hint, detail } when the last reduction
// failed (see userFacingError), else null; it clears as soon as a new reduction starts.
function useReducedInstance(
  url,
  problemInstance,
  chosenReduceTo,
  chosenReductionType,
  held,
  releaseHold,
) {
  const [reducedInstance, setReducedInstance] = useState("");
  const [reduceError, setReduceError] = useState(null);
  // Bumped on every reduction and when its inputs change, so an answer that arrives late is dropped.
  const reduceRun = useRef(0);
  // The running reduction's AbortController: a newer run or an input change aborts it, which stops
  // a wait to ask a busy server again for an answer nobody wants any more.
  const reduceStale = useRef(null);

  useWhenChanged([chosenReductionType, chosenReduceTo], () => setReducedInstance(""));
  useWhenChanged([chosenReductionType, problemInstance, url], () => setReduceError(null));

  const runReduction = useCallback(async () => {
    reduceRun.current += 1;
    const run = reduceRun.current;
    reduceStale.current?.abort();
    const stale = new AbortController();
    reduceStale.current = stale;
    let error = null;
    const reduced = await (chosenReductionType && problemInstance
      ? requestReducedInstanceFromPath(
          url,
          chosenReductionType,
          problemInstance,
          (...failure) => {
            error = userFacingError(...failure);
          },
          stale.signal,
        )
      : "");
    if (run !== reduceRun.current) return;
    setReducedInstance(reduced ?? "");
    setReduceError(reduced === undefined ? error : null);
  }, [chosenReductionType, problemInstance, url]);

  // Automatically reduces the instance one the reduction type is chosen.
  // This makes it so it's less input from the user but also makes the "Reduce" button effectly useless.
  // Not while a restored shared view is held: opening a link must never start a job by itself.
  useEffect(() => {
    if (held) return;
    runReduction();
    return () => {
      reduceRun.current += 1;
      reduceStale.current?.abort();
    };
  }, [runReduction, held]);

  const reduce = useCallback(() => {
    // Releasing re-runs the effect above, which reduces; running here too would ask twice.
    if (held) {
      releaseHold?.();
      return;
    }
    setReduceError(null);
    runReduction();
  }, [runReduction, held, releaseHold]);

  return [reducedInstance, setReducedInstance, reduce, reduceError];
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

/**
 * The reduction-type options for reducing `problemName` to `chosenReduceTo`: one hyphen-joined
 * path of reductions (the first reduction at each step), or [] when there is none. undefined when
 * the request failed; onError then gets what went wrong. Shared links are checked against it too.
 */
export async function requestReductionTypeOptions(url, problemName, chosenReduceTo, onError) {
  const reductions = await requestReductions(url, problemName, chosenReduceTo, onError);
  if (reductions === undefined) return undefined;
  let path = "";
  for (const reduction of reductions) {
    path += reduction[0] + "-";
  }
  return path !== "" ? [path.slice(0, -1)] : [];
}

function useReductionTypeOptions(url, problemName, chosenReduceTo) {
  const [fetched, setFetched] = useState({
    problemName: undefined,
    chosenReduceTo: undefined,
    options: NO_OPTIONS,
    error: null,
  });

  useEffect(() => {
    let ignore = false;
    (async () => {
      let error = null;
      const answer =
        problemName && chosenReduceTo
          ? await requestReductionTypeOptions(url, problemName, chosenReduceTo, (detail) => {
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

function useChosenReductionType(problemName, chosenReduceTo, reductionTypeOptions, restore) {
  const [chosenReductionType, setChosenReductionType] = useState("");

  useWhenChanged([problemName, chosenReduceTo], () => setChosenReductionType(""));

  // reductionTypeOptions only ever holds the current target's options (NO_OPTIONS while they
  // load), so the choice stays empty until they arrive.
  // A just-restored shared link's reduction wins over the preferred one, for its own target.
  useWhenChanged([reductionTypeOptions, chosenReduceTo, restore.id], () => {
    if (reductionTypeOptions.length === 0) return;
    const shared = restore.values;
    const sharedType =
      shared?.problem === problemName && shared.reduceTo === chosenReduceTo
        ? shared.reductionType
        : undefined;
    setChosenReductionType(
      pickDefault(sharedType ?? PREFERRED_REDUCTION_TYPE[chosenReduceTo], reductionTypeOptions),
    );
  });

  return [chosenReductionType, setChosenReductionType];
}

function useChosenReduceTo(problemName, reduceToOptions, restore) {
  const [chosenReduceTo, setChosenReduceTo] = useState("");

  useWhenChanged([problemName], () => setChosenReduceTo(""));

  // problemName is deliberately not a dependency: it is a follower of reduceToOptions. When the
  // problem changes, reduceToOptions recomputes and this re-runs with the current problemName in
  // scope. Keying on problemName directly would pick a default from the previous problem's
  // still-stale options.
  // restore.id is a dependency so a restore re-picks even when the problem (and so the options)
  // stayed the same; a just-restored shared link's target wins over the preferred one.
  useWhenChanged([reduceToOptions, restore.id], () => {
    if (reduceToOptions.length === 0) return;
    const shared = restore.values?.problem === problemName ? restore.values.reduceTo : undefined;
    setChosenReduceTo(pickDefault(shared ?? PREFERRED_REDUCE_TO[problemName], reduceToOptions));
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
