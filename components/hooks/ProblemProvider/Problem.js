import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { requestAllInfo, requestAllProblems } from "../../redux";
import { useWhenChanged } from "../useWhenChanged";

// For initial startup defaults
const DEFAULT_PROBLEM_NAME = "SAT3";
// Careful about changing this value, the application boot up sequence is dependent on having a
// default value.
const DEFAULT_PROBLEM_INSTANCE = "{{1,2,3},{1,2},GENERIC}";

export function useProblem(url) {
  const state = {};
  [state.problemInfoMap] = useProblemInfoMap(url);
  [state.problemNameMap] = useProblemNameMap(state.problemInfoMap);
  [state.problemName, state.setProblemName] = useProblemName(state.problemNameMap);
  [state.problemInstance, state.setProblemInstance] = useProblemInstance(
    state.problemName,
    state.problemInfoMap,
  );
  return state;
}

function useProblemInstance(problemName, problemInfoMap) {
  const [problemInstance, setProblemInstance] = useState(DEFAULT_PROBLEM_INSTANCE);

  // A newly chosen problem starts from its own default instance. The map is a dependency too so
  // the boot-time default applies once the catalogue arrives.
  useWhenChanged([problemName, problemInfoMap], () => {
    const info = problemInfoMap.get(problemName);
    if (info?.problemName) setProblemInstance(info.defaultInstance ?? "");
  });

  return [problemInstance, setProblemInstance];
}

export function useProblemInfo(url, problemName) {
  const [problemInfo, setProblemInfo] = useState({});

  useEffect(() => {
    if (!problemName) return;
    (async () => {
      const allInfo = (await requestAllInfo(url)) ?? {};
      setProblemInfo(allInfo[problemName] ?? {});
    })();
  }, [problemName, url]);

  return problemInfo; // There should be no reason to set the problem information
}

function useProblemInfoMap(url) {
  const [problemInfoMap, setProblemInfoMap] = useState(new Map());

  useEffect(() => {
    (async () => {
      const problems = (await requestAllProblems(url)) ?? [];
      const allInfo = (await requestAllInfo(url)) ?? {};
      let map = new Map();
      for (const problem of problems) {
        const info = allInfo[problem];
        if (info) {
          map.set(problem, info);
        }
      }
      setProblemInfoMap(map);
    })();
  }, [url]);

  return [problemInfoMap, setProblemInfoMap];
}

// Reads a one-shot `?problem=<CLASSKEY>` from the URL (ProblemCard.js on /browse links here) and
// selects it once the catalogue has loaded, instead of always landing on DEFAULT_PROBLEM_NAME.
function useProblemName(problemNameMap) {
  const router = useRouter();
  const [problemName, setProblemName] = useState("");

  // router.isReady is a dependency, not just a guard inside the callback: until Next has parsed
  // the URL client-side, router.query is still {} (to keep SSR and the first client render in
  // sync), so reading it early would always miss the param. Listing it here means that whichever
  // of "catalogue loaded" / "router ready" happens second is what triggers this, so the URL
  // problem is applied exactly once and the default is never set first and then replaced (no
  // flash of 3SAT before the requested problem appears).
  useWhenChanged([problemNameMap, router.isReady], () => {
    if (!router.isReady || problemNameMap.size === 0) return;

    const requested = typeof router.query.problem === "string" ? router.query.problem : undefined;
    // Class keys are uppercase (e.g. "CLIQUE"), but match case-insensitively in case the URL was
    // hand-edited -- an unknown/misspelled value falls through to the same default as before.
    const matchedKey = requested
      ? [...problemNameMap.keys()].find((key) => key.toLowerCase() === requested.toLowerCase())
      : undefined;

    if (matchedKey) {
      setProblemName(matchedKey);
    } else if (problemNameMap.has(DEFAULT_PROBLEM_NAME)) {
      setProblemName(DEFAULT_PROBLEM_NAME);
    }
  });

  // Once the URL's `problem` param has been consumed above, strip it so a later problem picked
  // from the dropdown doesn't leave a stale param behind. Keyed off problemName/isReady rather
  // than router.query, so this never re-fires from its own replace() -- router.query.problem is
  // already undefined by then -- and never runs before the selection above has actually applied.
  useEffect(() => {
    if (!router.isReady || !problemName || router.query.problem === undefined) return;
    router.replace(router.pathname, undefined, { shallow: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, problemName]);

  return [problemName, setProblemName];
}

function useProblemNameMap(problemInfoMap = new Map()) {
  return [
    useMemo(
      () => new Map([...problemInfoMap].map(([name, info]) => [name, info?.problemName || name])),
      [problemInfoMap],
    ),
  ];
}
