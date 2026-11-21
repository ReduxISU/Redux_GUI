/**
 * Puts a shared link's view back into the main page (#281), from the address the page opened
 * with or from a link pasted into Import.
 *
 * Restoring only chooses things: problem, instance, solver, reduction target and method,
 * verifier. It never runs them. The page is "held" (useProblemProvider) from the moment a link is
 * seen until the user's first click on Solve, Verify, Reduce or Show pictures, so a link can't
 * make a visitor's browser start a long job just by being opened.
 */
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { resolveShareState } from "./resolveShareState";
import { isFullShareState, parseShareInput, shareStateFromQuery } from "./shareState";

/** No restore yet: see useProblemProvider for what `id` and `values` mean. */
export const NO_RESTORE = { id: 0, values: null };

/**
 * @param problem the page's problem state (useProblem): problemNameMap and setProblemName.
 * @param setRestore, setHeld the provider's restore and hold setters.
 * @returns {{ notice, dismissNotice, importLink }}: `notice` is what to tell the user about the
 *   last restore ({ kind: "restored", notes } or { kind: "error", message }), or null.
 *   `importLink(text)` restores a pasted link and resolves to { ok, message }.
 */
export function useShareRestore(url, problem, setRestore, setHeld) {
  const { problemNameMap, setProblemName } = problem;
  const router = useRouter();
  // The opening address's share state, read once Next has parsed the URL and applied once the
  // problem catalogue has loaded.
  const [linkState, setLinkState] = useState(null);
  const [urlRead, setUrlRead] = useState(false);
  const [notice, setNotice] = useState(null);
  // The opening link is applied once, even if the effect below runs again before it finishes.
  const linkApplied = useRef(false);

  // Read during render, not in an effect: holding has to start in the same render the router
  // becomes ready, before any row's effect could start a job for the opening problem.
  // (useProblemName in Problem.js picks the link's problem in that render too.) router.isReady is
  // only ever true in the browser, so `window` is safe here.
  if (!urlRead && router.isReady) {
    setUrlRead(true);
    const state = shareStateFromQuery(window.location.search);
    // A link with only ?problem= (the /browse cards) is not a shared view: it keeps opening that
    // problem with its defaults, as before.
    if (isFullShareState(state)) {
      setLinkState(state);
      setHeld(true);
    }
  }

  const apply = useCallback(
    async (state, fromImport) => {
      const result = await resolveShareState(url, state, problemNameMap);
      if (!result.ok) {
        // A failed import leaves the current view (and any hold on it) as it was, and says why in
        // the Import dialog. A failed opening link releases the hold: the page opens as usual.
        if (!fromImport) {
          setHeld(false);
          setNotice({ kind: "error", message: result.message });
        }
        return { ok: false, message: result.message };
      }
      // One batch: the problem, its restored choices and the hold all land in the same render.
      setRestore((previous) => ({ id: previous.id + 1, values: result.values }));
      setProblemName(result.values.problem);
      setHeld(true);
      setNotice({ kind: "restored", notes: result.notes });
      return { ok: true, message: "" };
    },
    [url, problemNameMap, setProblemName, setRestore, setHeld],
  );

  useEffect(() => {
    if (!linkState || problemNameMap.size === 0 || linkApplied.current) return;
    linkApplied.current = true;
    apply(linkState, false);
  }, [linkState, problemNameMap, apply]);

  const importLink = useCallback(
    async (text) => {
      const parsed = parseShareInput(text);
      if (!parsed.ok) return parsed;
      return apply(parsed.state, true);
    },
    [apply],
  );

  const dismissNotice = useCallback(() => setNotice(null), []);

  return { notice, dismissNotice, importLink };
}
