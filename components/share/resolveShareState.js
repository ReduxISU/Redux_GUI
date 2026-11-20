/**
 * Checks a shared link's state against what the server actually offers before any of it is put
 * into the page (#281). Anything the server doesn't know is dropped with a plain-words note, so a
 * stale or hand-edited link opens as much as it still can instead of choosing something that
 * doesn't exist. Only reads catalogue lists: it never solves, verifies, reduces or draws.
 */
import { requestReductionTypeOptions } from "../hooks/ProblemProvider/Reducer";
import { requestAllSolvers, requestAllVerifiers, requestReductionOptions } from "../redux";

/**
 * @param url the Redux API base URL.
 * @param state share state from shareState.js (problem, instance, solver, ...).
 * @param problemNameMap Map of problem key -> display name (the loaded catalogue).
 * @returns {Promise<{ ok: true, values: object, notes: string[] } | { ok: false, message: string }>}
 *   `values` holds only parts that checked out; `problem` is the catalogue's own key.
 */
export async function resolveShareState(url, state, problemNameMap) {
  const requested = state.problem ?? "";
  const problem = [...problemNameMap.keys()].find(
    (key) => key.toLowerCase() === requested.toLowerCase(),
  );
  if (!problem) {
    return {
      ok: false,
      message: `The shared link names a problem this site doesn't have ("${requested}"), so nothing was restored.`,
    };
  }

  const values = { problem };
  const notes = [];
  if (state.instance !== undefined) values.instance = state.instance;

  const [allSolvers, allVerifiers, reduceToOptions] = await Promise.all([
    state.solver ? requestAllSolvers(url) : undefined,
    state.verifier ? requestAllVerifiers(url) : undefined,
    state.reduceTo ? requestReductionOptions(url, problem) : undefined,
  ]);

  if (state.solver) {
    if ((allSolvers?.[problem] ?? []).includes(state.solver)) values.solver = state.solver;
    else notes.push("The shared solver isn't available for this problem, so the default is used.");
  }
  if (state.verifier) {
    if ((allVerifiers?.[problem] ?? []).includes(state.verifier)) values.verifier = state.verifier;
    else
      notes.push("The shared verifier isn't available for this problem, so the default is used.");
  }
  if (state.reduceTo) {
    if ((reduceToOptions ?? []).includes(state.reduceTo)) {
      values.reduceTo = state.reduceTo;
      if (state.reductionType) {
        const types = (await requestReductionTypeOptions(url, problem, state.reduceTo)) ?? [];
        if (types.includes(state.reductionType)) values.reductionType = state.reductionType;
        else notes.push("The shared reduction method isn't available, so the default is used.");
      }
    } else {
      notes.push(
        "The shared reduction target isn't available for this problem, so the default is used.",
      );
    }
  }

  return { ok: true, values, notes };
}
