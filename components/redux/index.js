/**
 * Functionality for interacting with the backend Redux API.
 * This is a reusable, stand-alone module.
 */

/**
 * @param failMsg The message that is logged on failure. Message is lazily evaluated.
 * @returns the JSON format of the fetch request.
 * @returns `undefined` on failure and logs the error.
 */
async function fetchJson(url, failMsg) {
  try {
    const resp = await fetch(url);
    if (resp.ok) {
      return await resp.json();
    }
    console.log(`${failMsg()}: ${resp.status} (${resp.statusText})`);
  } catch (error) {
    console.log(`${failMsg()}: `, error);
  }
  return undefined;
}

/**
 * @param failMsg The message that is logged on failure. Message is lazily evaluated.
 * @returns the JSON format of the fetch request.
 * @returns `undefined` on failure and logs the error.
 */
async function fetchPostJson(url, body, failMsg) {
  try {
    const resp = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      }
    });
    if (resp.ok) {
      return await resp.json();
    }
    console.log(`${failMsg()}: ${resp.status} (${resp.statusText})`);
  } catch (error) {
    console.log(`${failMsg()}: `, error);
  }
  return undefined;
}

/**
 * Caches the result of an async request in memory, keyed by `cacheKey`.
 * Repeated calls with the same key reuse the in-flight or resolved result
 * instead of re-requesting. Cache is per-page-load only and is cleared on
 * refresh. Failed (falsy) results are not cached.
 * @param cacheKey Unique key identifying this request.
 * @param requestFn Function that performs the request when not cached.
 * @returns the cached or freshly-fetched result.
 * @returns `undefined` if the request fails; failed results are not cached.
 */
const requestCache = new Map();

async function cachedRequest(cacheKey, requestFn) {
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  const promise = requestFn();
  requestCache.set(cacheKey, promise);

  const result = await promise;

  // Don't cache failed requests.
  if (!result) {
    requestCache.delete(cacheKey);
  }

  return result;
}

/**
 * This function is a temporary solution for validating user input until it is ported to the Redux API.
 * @returns `true` if the specified verifier certificate is valid.
 */
function isCertificateValid(problem, certificate) {
  var cleanInput = certificate.replace(new RegExp(/[( )]/g), ""); // Strips spaces and ()
  cleanInput = cleanInput.replaceAll(":", "=");
  var regexFormat = /[^-.,=:!{}\w;]/; // Checks for special characters not including -.,=:!{}
  if (regexFormat.test(cleanInput) == true) {
    // Invalid characters found, warn user.
    return false;
  } else {
    var validUserInput = true;
    if (problem == "SAT" || problem == "SAT3") {
      var clauses = cleanInput.split(",");
      const regex = /[^!\w]/; // Only allow alphanumber and !
      const notBooleanRegex = /[^true$|^True$|^t$|^T$|^false$|^False$|^F$|^f$]/;
      clauses.forEach((clause) => {
        const singleClause = clause.split("=");

        if (singleClause.length !== 2 || regex.test(singleClause[0] == true)) {
          // No boolean assigned to variable.
          validUserInput = false;
          return false;
        }

        if (notBooleanRegex.test(singleClause[1] == true)) {
          // boolean is not in the form True/true/T/F...
          validUserInput = false;
          return false;
        } else {
          // Replace True/true/t with T and False/false/f with F
          singleClause[1] = singleClause[1].replace(new RegExp(/^false$|^False$|^f$/g), "F");
          singleClause[1] = singleClause[1].replace(new RegExp(/^True$|^true$|^t$/g), "T");
          validUserInput = true; // valid input
        }
      });
    }
    return validUserInput;
  }
}

/**
 * @returns the gadget map of ids based on an `instance` from the specified `reduction`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestGadgetMap(url, reduction, instance) {
  return await fetchPostJson(
    `${url}ProblemProvider/gadgets?reduction=${reduction}`,
    instance,
    () => `${reduction} MAP GADGETS REQUEST FAILED`
  );
}

export async function processReductions(url, reductionPath, instance) {
  const reductions = reductionPath.split("-").map(r => r.trim());

  let currentInstance = instance;
  let currentMap = null;

  for (const reduction of reductions) {
    const nextMap = await requestGadgetMap(url, reduction, currentInstance);
    const nextInstance = await requestReducedInstanceFromPath(url, reduction, currentInstance);

    // compose A→B and B→C into A→C
    if (currentMap) {
      currentMap = composeMappings(currentMap, nextMap);
    } else {
      currentMap = nextMap;
    }

    currentInstance = nextInstance;
  }
  return currentMap;
}

/**
 * Compose two gadget maps: map1: A→B and map2: B→C → result: A→C.
 */
function composeMappings(map1, map2) {
  const composed = [];

  for (const entry1 of map1) {
    const linkedTo = new Set();

    for (const b of entry1.reductionToIds) {
      for (const entry2 of map2) {
        if (entry2.reductionFromIds.includes(b)) {
          entry2.reductionToIds.forEach(c => linkedTo.add(c));
        }
      }
    }

    composed.push({
      color: entry1.color,
      reductionFromIds: entry1.reductionFromIds,
      reductionToIds: Array.from(linkedTo),
    });
  }

  return composed;
}

/**
 * Give unique IDs to elements between the two instances to remove collision
 */
export function makeIdsUnique(gadgets) {
  if (!gadgets || !Array.isArray(gadgets)) {
    return { gadgets: [], fromIdMap: new Map(), toIdMap: new Map() };
  }

  const fromIdMap = new Map();
  const toIdMap = new Map();

  let nextFromId = 0;
  let nextToId = 0;

  // First pass: map reductionFromIds safely
  gadgets.forEach(gadget => {
    (gadget.reductionFromIds || []).forEach(oldId => {
      const key = String(oldId);
      if (!fromIdMap.has(key)) {
        fromIdMap.set(key, String(nextFromId++));
      }
    });
  });

  // Second pass: map reductionToIds safely
  nextToId = nextFromId;
  gadgets.forEach(gadget => {
    (gadget.reductionToIds || []).forEach(oldId => {
      const key = String(oldId);
      if (!toIdMap.has(key)) {
        toIdMap.set(key, String(nextToId++));
      }
    });
  });

  // Third pass: create new gadgets array safely
  const updatedGadgets = gadgets.map(gadget => ({
    ...gadget,
    reductionFromIds: (gadget.reductionFromIds || []).map(id => fromIdMap.get(String(id)) || String(id)),
    reductionToIds: (gadget.reductionToIds || []).map(id => toIdMap.get(String(id)) || String(id)),
  }));

  return { gadgets: updatedGadgets, fromIdMap, toIdMap };
}


/**
 * Remap IDs in gadgets, clauses, or literals based on the provided idMap.
 * Only touches properties that exist: id, reductionFromIds, reductionToIds.
 */
export function remapIdsDeep(obj, idMap) {
  if (!obj || typeof obj !== "object") return obj;

  // Copy object
  const result = Array.isArray(obj) ? [] : {};

  for (const [key, val] of Object.entries(obj)) {
    if (key === "id" && idMap.has(String(val))) {
      result[key] = String(idMap.get(String(val)));
    } else if ((key === "reductionFromIds" || key === "reductionToIds") && Array.isArray(val)) {
      result[key] = val.map(v => String(idMap.get(String(v)) ?? v));
    } else if (Array.isArray(val)) {
      // only recurse for arrays
      result[key] = val.map(v => remapIdsDeep(v, idMap));
    } else if (val && typeof val === "object") {
      result[key] = remapIdsDeep(val, idMap);
    } else {
      result[key] = val;
    }
  }

  return result;
}

/**
 * @returns information regarding the problem/solver/verifier.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestInfo(url, apiCall) {
  return await fetchJson(`${url}ProblemProvider/info?interface=${apiCall}`, () => `${apiCall} INFO REQUEST FAILED`);
}

/**
 * @param reductionPath a hyphen (`-`) separated list of reductions to perform on the instance.
 * @returns the reduced `instance` list of reductions, the reduction path.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReducedInstanceFromPath(url, reductionPath, instance) {
  for (const path of reductionPath.split("-")) {
    const reducedInst = await requestReducedInstance(url, path, instance);
    if (!reducedInst) {
      console.log(`${reductionPath} AT ${path} REDUCED INSTANCE FROM PATH REQUEST FAILED`);
      return instance;
    }
    instance = reducedInst.reductionTo.instance;
  }
  return instance;
}

/**
 * @returns the reduced `instance` from the specified `reduction`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReducedInstance(url, reduction, instance) {
  return await fetchPostJson(
    `${url}ProblemProvider/reduce?reduction=${reduction}`,
    instance,
    () => `${reduction}  REDUCED INSTANCE REQUEST FAILED`
  );
}

/**
 * @returns information regarding the reduction.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReductionInfo(url, apiCall) {
  // Reductions are served by the same generic ProblemProvider/info?interface=
  // endpoint as problems/solvers/verifiers (see requestInfo above) -- this used to
  // request `${apiCall}/info` directly, a route that doesn't exist on the API and
  // 404s every time, silently leaving reducerInfo as {} (empty) and every reduction
  // tooltip field (cost/reductionType/complexityBucket/complexity) on its fallback
  // text no matter what the backend actually has classified.
  return await requestInfo(url, apiCall);
}

/**
 * @returns an array of problems that have implemented reductions from `problem`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReductionOptions(url, problem) {
  return await fetchJson(
    `${url}Navigation/NPC_NavGraph/availableReductions/?chosenProblem=${problem}`,
    () => `${problem} REDUCTION OPTIONS REQUEST FAILED`
  );
}

/**
 * @returns the graph visualization of the reduced problem instance.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReductionVisualization(url, reduction, solution, instance) {
  return await fetchPostJson(
    `${url}ProblemProvider/visualizeReduction?reduction=${reduction}&solution=${solution}`,
    instance,
    () => `${reduction} VISUALIZE REQUEST FAILED`
  );
}

/**
 * @returns an array of all implemented problems identifiers.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestProblems(url) {
  return await fetchJson(`${url}navigation/ALL_ProblemsRefactor/`, () => `PROBLEMS REQUEST FAILED`);
}

/**
 * @returns the generic instance of the `problem` with the given `instance`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestProblemGenericInstance(url, problem, instance) {
  return await fetchPostJson(
    `${url}ProblemProvider/problemInstance?problem=${problem}`,
    instance,
    () => `${problem} PROBLEM GENERIC INSTANCE REQUEST FAILED`
  );
}


/**
 * @returns an array of arrays of reductions implemented for reducing a problem to another problem.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReductions(url, problemFrom, problemTo) {
  return await fetchJson(
    `${url}Navigation/NPC_NavGraph/reductionPath/?reducingFrom=${problemFrom}&reducingTo=${problemTo}`,
    () => `${problemFrom} TO ${problemTo} REDUCTIONS REQUEST FAILED`
  );
}

/**
 * @returns the solved `instance` from the specified `solver`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestSolvedInstance(url, solver, instance) {
  return await fetchPostJson(
    `${url}ProblemProvider/solve?solver=${solver}`,
    instance,
    () => `${solver} SOLVED INSTANCE REQUEST FAILED`
  );
}

/**
 * @returns an array of solvers implemented for the `problem`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestSolvers(url, problem) {
  return await fetchJson(
    `${url}Navigation/Problem_SolversRefactor/?chosenProblem=${problem}`,
    () => `${problem} SOLVERS REQUEST FAILED`
  );
}

/**
 * @returns an array of verifiers implemented for the `problem`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestVerifiers(url, problem) {
  return await fetchJson(
    `${url}Navigation/Problem_VerifiersRefactor/?chosenProblem=${problem}`,
    () => `${problem} VERIFIERS REQUEST FAILED`
  );
}

/**
 * @returns the verified `instance` results from the specified `verifier`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestVerifiedInstance(url, problem, verifier, instance, certificate) {
  // Temporary solution until certificate validation is moved to the Redux API
  if (!isCertificateValid(problem, certificate)) {
    return "Invalid Input"
  }

  return await fetchPostJson(
    `${url}ProblemProvider/verify?verifier=${verifier}`,
    { problemInstance: instance, certificate: certificate },
    () => `${verifier} VERIFIED INSTANCE REQUEST FAILED`
  );
}

/**
 * @returns the graph visualization of the problem instance.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestVisualization(url, visualization, instance) {
  return await fetchPostJson(
    `${url}ProblemProvider/visualize?visualization=${visualization}`,
    instance,
    () => `${visualization} VISUALIZE REQUEST FAILED`
  );
}

/**
 * @returns an array of visualizations implemented for the `problem`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestVisualizations(url, problem) {
  return await fetchJson(
    `${url}Navigation/Problem_VisualizationsRefactor/?chosenProblem=${problem}`,
    () => `${problem} VISUALIZATIONS REQUEST FAILED`
  );
}
/**
 * @returns an object mapping problem names for the given `problemType`.
 * @returns `undefined` on failure and logs the error.
 */
export function requestAllProblems(url) {
  return cachedRequest(
    `${url}|allProblems`,
    () =>
      fetchJson(
        `${url}Navigation/Batch/allProblems`,
        () => "ALL PROBLEMS REQUEST FAILED"
      )
  );
}
/**
 * @returns an object mapping each problem to its available solvers.
 * @returns `undefined` on failure and logs the error.
 */
export function requestAllSolvers(url) {
  return cachedRequest(
    `${url}|allSolvers`,
    () =>
      fetchJson(
        `${url}Navigation/Batch/allSolvers`,
        () => "ALL SOLVERS REQUEST FAILED"
      )
  );
}
/**
 * @returns an object mapping each problem to its available verifiers.
 * @returns `undefined` on failure and logs the error.
 */
export function requestAllVerifiers(url) {
  return cachedRequest(
    `${url}|allVerifiers`,
    () =>
      fetchJson(
        `${url}Navigation/Batch/allVerifiers`,
        () => "ALL VERIFIERS REQUEST FAILED"
      )
  );
}
/**
 * @returns an object mapping each problem to its available visualizations.
 * @returns `undefined` on failure and logs the error.
 */
export function requestAllVisualizations(url) {
  return cachedRequest(
    `${url}|allVisualizations`,
    () =>
      fetchJson(
        `${url}Navigation/Batch/allVisualizations`,
        () => "ALL VISUALIZATIONS REQUEST FAILED"
      )
  );
}

/**
 * @returns an object containing metadata (`info`) for all interfaces (problems, solvers, verifiers, visualizations).
 * @returns cached data when available to reduce API calls.
 * @returns `undefined` on failure and logs the error.
 */
export function requestAllInfo(url) {
  return cachedRequest(
    `${url}|allInfo`,
    () =>
      fetchJson(
        `${url}Navigation/Batch/allInfo`,
        () => "ALL INFO REQUEST FAILED"
      )
  );
}

/**
 * @returns an object mapping each visualization class name (e.g. "CliqueDefaultVisualization")
 * to its `visualizationType` wire value (e.g. "GraphD3").
 * @returns cached data when available to reduce API calls.
 * @returns `undefined` on failure and logs the error, including when the endpoint doesn't exist
 * yet on the connected API -- callers should fall back to deriving this mapping from
 * `requestAllInfo` in that case.
 */
export function requestAllVisualizationTypes(url) {
  return cachedRequest(
    `${url}|allVisualizationTypes`,
    () =>
      fetchJson(
        `${url}Navigation/Batch/allVisualizationTypes`,
        () => "ALL VISUALIZATION TYPES REQUEST FAILED"
      )
  );
}

/**
 * @returns the full reduction graph as an adjacency map:
 * `{ [fromProblemName]: { [toProblemName]: [{className, endpoint, inputType, outputType,
 * fromComplexity, toComplexity, cost}] } }`.
 * @returns cached data when available to reduce API calls.
 * @returns `undefined` on failure and logs the error.
 */
export function requestReductionGraph(url) {
  return cachedRequest(`${url}|reductionGraph`, () =>
    fetchJson(`${url}Navigation/Reductions`, () => "REDUCTION GRAPH REQUEST FAILED"));
}