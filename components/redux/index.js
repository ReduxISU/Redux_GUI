/**
 * Functionality for interacting with the backend Redux API.
 * This is a reusable, stand-alone module.
 */

// Longest server error text kept in a failure description.
const MAX_ERROR_TEXT = 200;

/**
 * Describes a failed (non-2xx) response for a person: the HTTP status and, when the body has
 * one, the server's error text (`detail`/`title`/`message`/`error` of a JSON body, else the
 * plain text), shortened to MAX_ERROR_TEXT characters.
 */
async function describeFailedResponse(resp) {
  let text = "";
  try {
    text = (await resp.text()).trim();
  } catch {
    // No readable body; the status alone has to do.
  }
  try {
    const json = JSON.parse(text);
    const message = json?.detail || json?.title || json?.message || json?.error;
    if (typeof message === "string") text = message;
  } catch {
    // Not JSON; keep the plain text.
  }
  if (text.length > MAX_ERROR_TEXT) text = `${text.slice(0, MAX_ERROR_TEXT)}…`;
  const status = `HTTP ${resp.status}${resp.statusText ? ` ${resp.statusText}` : ""}`;
  return text ? `${status}: ${text}` : status;
}

/** Describes a fetch that got no response at all (network error, abort or timeout). */
function describeFetchError(error) {
  if (error?.name === "TimeoutError") return "The request timed out.";
  return `No answer from the server (${error?.message || String(error)}).`;
}

/**
 * @param failMsg The message that is logged on failure. Message is lazily evaluated.
 * @param onError Optional; called with a one-line description of what went wrong (HTTP status
 * and server error text, network error, or an unreadable answer) when the request fails.
 * @returns the JSON format of the fetch request.
 * @returns `undefined` on failure and logs the error.
 */
async function fetchAndParse(url, init, failMsg, onError) {
  let resp;
  try {
    resp = await fetch(url, init);
  } catch (error) {
    console.log(`${failMsg()}: `, error);
    onError?.(describeFetchError(error));
    return undefined;
  }
  if (!resp.ok) {
    console.log(`${failMsg()}: ${resp.status} (${resp.statusText})`);
    onError?.(await describeFailedResponse(resp));
    return undefined;
  }
  try {
    return await resp.json();
  } catch (error) {
    console.log(`${failMsg()}: `, error);
    onError?.(`The server's answer could not be read (${error?.message || String(error)}).`);
    return undefined;
  }
}

/**
 * @param failMsg The message that is logged on failure. Message is lazily evaluated.
 * @param onError Optional; see fetchAndParse.
 * @returns the JSON format of the fetch request.
 * @returns `undefined` on failure and logs the error.
 */
async function fetchJson(url, failMsg, onError) {
  return fetchAndParse(url, undefined, failMsg, onError);
}

/**
 * @param failMsg The message that is logged on failure. Message is lazily evaluated.
 * @param onError Optional; see fetchAndParse.
 * @returns the JSON format of the fetch request.
 * @returns `undefined` on failure and logs the error.
 */
async function fetchPostJson(url, body, failMsg, onError) {
  return fetchAndParse(
    url,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    },
    failMsg,
    onError,
  );
}

/**
 * Caches the result of an async request in memory, keyed by `cacheKey`.
 * Repeated calls with the same key reuse the in-flight or resolved result
 * instead of re-requesting. Cache is per-page-load only and is cleared on
 * refresh. Failed (falsy) results are not cached.
 * @param cacheKey Unique key identifying this request.
 * @param requestFn Function that performs the request when not cached; it is passed an
 * `onError` callback that records the failure description.
 * @param onError Optional; called with the failure description when the result is a failure,
 * also for callers that shared someone else's in-flight request.
 * @returns the cached or freshly-fetched result.
 * @returns `undefined` if the request fails; failed results are not cached.
 */
const requestCache = new Map();
const requestFailures = new Map();

async function cachedRequest(cacheKey, requestFn, onError) {
  let promise = requestCache.get(cacheKey);
  if (!promise) {
    promise = requestFn((detail) => requestFailures.set(cacheKey, detail));
    requestCache.set(cacheKey, promise);
  }

  const result = await promise;

  // Don't cache failed requests.
  if (!result) {
    if (requestCache.get(cacheKey) === promise) requestCache.delete(cacheKey);
    onError?.(requestFailures.get(cacheKey) ?? "The server sent back nothing.");
  }

  return result;
}

/**
 * @returns the gadget map of ids based on an `instance` from the specified `reduction`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestGadgetMap(url, reduction, instance, onError) {
  return await fetchPostJson(
    `${url}ProblemProvider/gadgets?reduction=${reduction}`,
    instance,
    () => `${reduction} MAP GADGETS REQUEST FAILED`,
    onError,
  );
}

/**
 * @param isCurrent Optional; when it returns false the walk stops early (resolving `undefined`),
 * so an answer nobody is waiting for any more sends no further requests.
 * @param onError Optional; called as onError(step, detail) when a gadget map or reduce request
 * along the path fails, `step` naming the request and reduction, `detail` what went wrong.
 * @returns `undefined` when a gadget map or reduce request along the path fails.
 */
export async function processReductions(
  url,
  reductionPath,
  instance,
  isCurrent = () => true,
  onError = () => {},
) {
  const reductions = reductionPath.split("-").map((r) => r.trim());

  let currentInstance = instance;
  let currentMap = null;

  for (const reduction of reductions) {
    let detail;
    const nextMap = await requestGadgetMap(url, reduction, currentInstance, (d) => {
      detail = d;
    });
    if (!isCurrent()) return undefined;
    if (nextMap === undefined) {
      onError(`Gadget request for reduction ${reduction}`, detail);
      return undefined;
    }
    const reduced = await requestReducedInstance(url, reduction, currentInstance, (d) => {
      detail = d;
    });
    if (!isCurrent()) return undefined;
    if (!reduced) {
      onError(
        `Reduce request for reduction ${reduction}`,
        detail ?? "The server sent back nothing.",
      );
      return undefined;
    }
    const nextInstance = reduced.reductionTo.instance;

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
          entry2.reductionToIds.forEach((c) => linkedTo.add(c));
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
  gadgets.forEach((gadget) => {
    (gadget.reductionFromIds || []).forEach((oldId) => {
      const key = String(oldId);
      if (!fromIdMap.has(key)) {
        fromIdMap.set(key, String(nextFromId++));
      }
    });
  });

  // Second pass: map reductionToIds safely
  nextToId = nextFromId;
  gadgets.forEach((gadget) => {
    (gadget.reductionToIds || []).forEach((oldId) => {
      const key = String(oldId);
      if (!toIdMap.has(key)) {
        toIdMap.set(key, String(nextToId++));
      }
    });
  });

  // Third pass: create new gadgets array safely
  const updatedGadgets = gadgets.map((gadget) => ({
    ...gadget,
    reductionFromIds: (gadget.reductionFromIds || []).map(
      (id) => fromIdMap.get(String(id)) || String(id),
    ),
    reductionToIds: (gadget.reductionToIds || []).map(
      (id) => toIdMap.get(String(id)) || String(id),
    ),
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
      result[key] = val.map((v) => String(idMap.get(String(v)) ?? v));
    } else if (Array.isArray(val)) {
      // only recurse for arrays
      result[key] = val.map((v) => remapIdsDeep(v, idMap));
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
export async function requestInfo(url, apiCall, onError) {
  return await fetchJson(
    `${url}ProblemProvider/info?interface=${apiCall}`,
    () => `${apiCall} INFO REQUEST FAILED`,
    onError,
  );
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
export async function requestReducedInstance(url, reduction, instance, onError) {
  return await fetchPostJson(
    `${url}ProblemProvider/reduce?reduction=${reduction}`,
    instance,
    () => `${reduction}  REDUCED INSTANCE REQUEST FAILED`,
    onError,
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
export async function requestReductionOptions(url, problem, onError) {
  return await fetchJson(
    `${url}Navigation/NPC_NavGraph/availableReductions/?chosenProblem=${problem}`,
    () => `${problem} REDUCTION OPTIONS REQUEST FAILED`,
    onError,
  );
}

/**
 * @returns the graph visualization of the reduced problem instance.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReductionVisualization(url, reduction, solution, instance, onError) {
  return await fetchPostJson(
    `${url}ProblemProvider/visualizeReduction?reduction=${reduction}&solution=${solution}`,
    instance,
    () => `${reduction} VISUALIZE REQUEST FAILED`,
    onError,
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
    () => `${problem} PROBLEM GENERIC INSTANCE REQUEST FAILED`,
  );
}

/**
 * @returns an array of arrays of reductions implemented for reducing a problem to another problem.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReductions(url, problemFrom, problemTo, onError) {
  return await fetchJson(
    `${url}Navigation/NPC_NavGraph/reductionPath/?reducingFrom=${problemFrom}&reducingTo=${problemTo}`,
    () => `${problemFrom} TO ${problemTo} REDUCTIONS REQUEST FAILED`,
    onError,
  );
}

/**
 * @returns the solved `instance` from the specified `solver`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestSolvedInstance(url, solver, instance, onError) {
  return await fetchPostJson(
    `${url}ProblemProvider/solve?solver=${solver}`,
    instance,
    () => `${solver} SOLVED INSTANCE REQUEST FAILED`,
    onError,
  );
}

/**
 * @returns an array of solvers implemented for the `problem`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestSolvers(url, problem) {
  return await fetchJson(
    `${url}Navigation/Problem_SolversRefactor/?chosenProblem=${problem}`,
    () => `${problem} SOLVERS REQUEST FAILED`,
  );
}

/**
 * @returns an array of verifiers implemented for the `problem`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestVerifiers(url, problem) {
  return await fetchJson(
    `${url}Navigation/Problem_VerifiersRefactor/?chosenProblem=${problem}`,
    () => `${problem} VERIFIERS REQUEST FAILED`,
  );
}

/**
 * Turns a failed verify response into a message for the user. The backend answers an unreadable
 * certificate with a 400 `certificate_parse_error` body quoting the expected format.
 */
function describeVerifyError(status, body) {
  if (body?.error === "certificate_parse_error") {
    const expected = body.expected ? ` Expected: ${body.expected}` : "";
    const detail = body.detail ? ` (${body.detail})` : "";
    return `Certificate couldn't be read.${expected}${detail}`;
  }
  const message = body?.message ?? body?.detail ?? body?.title ?? body?.error;
  return `Verification failed (HTTP ${status})${message ? `: ${message}` : ""}`;
}

/**
 * @returns the verified `instance` result from the specified `verifier`.
 * @returns a human-readable error message (a string) if the request fails or the backend rejects
 * the certificate, e.g. "Certificate couldn't be read. Expected: ...". Never `undefined`.
 */
export async function requestVerifiedInstance(url, problem, verifier, instance, certificate) {
  try {
    const resp = await fetch(`${url}ProblemProvider/verify?verifier=${verifier}`, {
      method: "POST",
      body: JSON.stringify({ problemInstance: instance, certificate: certificate }),
      headers: { "Content-Type": "application/json; charset=UTF-8" },
    });
    if (resp.ok) {
      return await resp.json();
    }
    let body;
    try {
      body = await resp.json();
    } catch {
      body = undefined;
    }
    // A rejected certificate is expected user error, not a broken request; only log the rest.
    if (body?.error !== "certificate_parse_error") {
      console.log(
        `${verifier} VERIFIED INSTANCE REQUEST FAILED: ${resp.status} (${resp.statusText})`,
      );
    }
    return describeVerifyError(resp.status, body);
  } catch (error) {
    console.log(`${verifier} VERIFIED INSTANCE REQUEST FAILED: `, error);
    return "Couldn't reach the verifier. Check your connection and try again.";
  }
}

/**
 * @returns the graph visualization of the problem instance.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestVisualization(url, visualization, instance, onError) {
  return await fetchPostJson(
    `${url}ProblemProvider/visualize?visualization=${visualization}`,
    instance,
    () => `${visualization} VISUALIZE REQUEST FAILED`,
    onError,
  );
}

/**
 * @returns an array of visualizations implemented for the `problem`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestVisualizations(url, problem) {
  return await fetchJson(
    `${url}Navigation/Problem_VisualizationsRefactor/?chosenProblem=${problem}`,
    () => `${problem} VISUALIZATIONS REQUEST FAILED`,
  );
}
/**
 * @returns an object mapping problem names for the given `problemType`.
 * @returns `undefined` on failure and logs the error.
 */
export function requestAllProblems(url) {
  return cachedRequest(`${url}|allProblems`, () =>
    fetchJson(`${url}Navigation/Batch/allProblems`, () => "ALL PROBLEMS REQUEST FAILED"),
  );
}
/**
 * @returns an object mapping each problem to its available solvers.
 * @returns `undefined` on failure and logs the error.
 */
export function requestAllSolvers(url) {
  return cachedRequest(`${url}|allSolvers`, () =>
    fetchJson(`${url}Navigation/Batch/allSolvers`, () => "ALL SOLVERS REQUEST FAILED"),
  );
}
/**
 * @returns an object mapping each problem to its available verifiers.
 * @returns `undefined` on failure and logs the error.
 */
export function requestAllVerifiers(url) {
  return cachedRequest(`${url}|allVerifiers`, () =>
    fetchJson(`${url}Navigation/Batch/allVerifiers`, () => "ALL VERIFIERS REQUEST FAILED"),
  );
}
/**
 * @returns an object mapping each problem to its available visualizations.
 * @returns `undefined` on failure and logs the error.
 */
export function requestAllVisualizations(url, onError) {
  return cachedRequest(
    `${url}|allVisualizations`,
    (fail) =>
      fetchJson(
        `${url}Navigation/Batch/allVisualizations`,
        () => "ALL VISUALIZATIONS REQUEST FAILED",
        fail,
      ),
    onError,
  );
}

/**
 * @returns an object containing metadata (`info`) for all interfaces (problems, solvers, verifiers, visualizations).
 * @returns cached data when available to reduce API calls.
 * @returns `undefined` on failure and logs the error.
 */
export function requestAllInfo(url, onError) {
  return cachedRequest(
    `${url}|allInfo`,
    (fail) => fetchJson(`${url}Navigation/Batch/allInfo`, () => "ALL INFO REQUEST FAILED", fail),
    onError,
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
export function requestAllVisualizationTypes(url, onError) {
  return cachedRequest(
    `${url}|allVisualizationTypes`,
    (fail) =>
      fetchJson(
        `${url}Navigation/Batch/allVisualizationTypes`,
        () => "ALL VISUALIZATION TYPES REQUEST FAILED",
        fail,
      ),
    onError,
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
    fetchJson(`${url}Navigation/Reductions`, () => "REDUCTION GRAPH REQUEST FAILED"),
  );
}

/**
 * @returns an array of `{name, githubUsername}` for every contributor listed
 * in the backend's `contributorInfo.json`.
 * @returns `undefined` on failure and logs the error.
 */
export function requestContributorDirectory(url) {
  return cachedRequest(`${url}|contributorDirectory`, () =>
    fetchJson(
      `${url}Navigation/ContributorProfile/directory`,
      () => "CONTRIBUTOR DIRECTORY REQUEST FAILED",
    ),
  );
}

/**
 * @returns one contributor's full profile: personal info plus every problem,
 * solver, and reduction they've contributed to.
 * @returns `undefined` on failure and logs the error.
 */
export function requestContributorProfile(url, contributorName) {
  return cachedRequest(`${url}|contributorProfile|${contributorName}`, () =>
    fetchJson(
      `${url}Navigation/ContributorProfile/${encodeURIComponent(contributorName)}`,
      () => `CONTRIBUTOR PROFILE REQUEST FAILED for ${contributorName}`,
    ),
  );
}
