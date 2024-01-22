/**
 * Functionality for interacting with the backend Redux API.
 * This is a reusable, stand-alone module that does not depend on other modules.
 */

/**
 * @returns information regarding the problem/solver/verifier.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestInfo(url, apiCall) {
  return await fetchJson(`${url}${apiCall}/info`, `${apiCall} INFO REQUEST FAILED`);
}

/**
 * @returns an array of verifiers implemented for the `problem`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestVerifiers(url, problem, problemType = "NPC") {
  return await fetchJson(
    `${url}Navigation/Problem_VerifiersRefactor/?chosenProblem=${problem}&problemType=${problemType}`,
    () => `${problem} VERIFIERS REQUEST FAILED`
  );
}

/**
 * @returns an array of solvers implemented for the `problem`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestSolvers(url, problem, problemType = "NPC") {
  return await fetchJson(
    `${url}Navigation/Problem_SolversRefactor/?chosenProblem=${problem}&problemType=${problemType}`,
    () => `${problem} SOLVERS REQUEST FAILED`
  );
}

/**
 * @returns an array or arrays of reductions implemented for reducing a problem to another problem.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReductions(url, problemFrom, problemTo, problemType = "NPC") {
  return await fetchJson(
    `${url}Navigation/NPC_NavGraph/reductionPath/?reducingFrom=${problemFrom}&reducingTo=${problemTo}&problemType=${problemType}`,
    () => `${problemFrom} TO ${problemTo} REDUCTIONS REQUEST FAILED`
  );
}

/**
 * @returns an array of problems that have implemented reductions from `problem`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReductionOptions(url, problem, problemType = "NPC") {
  return await fetchJson(
    `${url}Navigation/NPC_NavGraph/availableReductions/?chosenProblem=${problem}&problemType=${problemType}`,
    () => `${problem} REDUCTION OPTIONS REQUEST FAILED`
  );
}

/**
 * @returns an array of all implemented problems identifiers.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestProblems(url) {
  return await fetchJson(`${url}navigation/NPC_ProblemsRefactor/`, () => `PROBLEMS REQUEST FAILED`);
}

/**
 * @returns a generic default instance of the problem information.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestProblemGeneric(url, problem) {
  return await fetchJson(`${url}${problem}Generic`, () => `${problem} GENERIC REQUEST FAILED`);
}

/**
 * @param failMsg The message that is logged on failure. Message is lazily evaluated.
 * @returns the JSON format of the fetch request.
 * @returns `undefined` on failure and logs the error.
 */
async function fetchJson(url, failMsg) {
  try {
    const resp = await fetch(url);
    return resp.ok ? await resp.json() : undefined;
  } catch (error) {
    // Should we log the caught `error`?
    console.log(failMsg());
  }
  return undefined;
}
