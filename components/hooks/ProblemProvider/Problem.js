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

function useProblemName(problemNameMap) {
  const [problemName, setProblemName] = useState("");

  useWhenChanged([problemNameMap], () => {
    if (problemNameMap.has(DEFAULT_PROBLEM_NAME)) setProblemName(DEFAULT_PROBLEM_NAME);
  });

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
