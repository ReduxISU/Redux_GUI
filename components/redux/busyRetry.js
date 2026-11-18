/**
 * Waiting and asking again when the Redux server is busy (HTTP 429).
 *
 * The backend runs at most a few compute jobs at once (Redux `Interfaces/ComputeJobs.cs`, the
 * compute limits of ReduxISU/Redux#915). When every slot is taken, a compute endpoint (solve,
 * verify, visualize, visualizeReduction, reduce, mapSolution, mapSolutionBack, gadgets) answers
 * at once with HTTP 429, a `Retry-After: 5` header and a `server_busy` body:
 * `{ error: "server_busy", message, detail, maxConcurrentJobs, retryAfterSeconds, hint }`.
 * The job was turned away before it started, so asking again is safe even though these requests
 * are POSTs: nothing ran and nothing changed on the server.
 *
 * This module is the policy only (how long to wait, how often to try); components/redux/index.js
 * applies it to its compute requests.
 */

/** How many times a busy answer is retried before the request counts as failed. */
export const MAX_BUSY_RETRIES = 3;

/** The wait when the server names none, in seconds (the backend's own Retry-After). */
export const DEFAULT_RETRY_AFTER_SECONDS = 5;

/** The shortest and longest wait taken from the server, in seconds. */
export const MIN_RETRY_AFTER_SECONDS = 1;
export const MAX_RETRY_AFTER_SECONDS = 30;

/** Up to this much random extra wait, so requests turned away together don't all return together. */
export const MAX_JITTER_MS = 1000;

/** The busy message shown once every retry was turned away too. */
export const BUSY_MESSAGE = "The Redux server is busy with other requests.";
export const BUSY_HINT = "Wait a few seconds and try again.";

const toSeconds = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const seconds = Number(value.trim());
  return Number.isFinite(seconds) ? seconds : undefined;
};

/**
 * The seconds to wait before asking again: the `Retry-After` header when it holds a number of
 * seconds, else the body's `retryAfterSeconds`, else DEFAULT_RETRY_AFTER_SECONDS, kept between
 * MIN_RETRY_AFTER_SECONDS and MAX_RETRY_AFTER_SECONDS. (Retry-After may also be an HTTP date; the
 * backend never sends one, so a date falls through to the body or the default.)
 */
export function retryAfterSeconds(header, body) {
  const seconds = toSeconds(header) ?? toSeconds(body?.retryAfterSeconds);
  if (seconds === undefined) return DEFAULT_RETRY_AFTER_SECONDS;
  return Math.min(MAX_RETRY_AFTER_SECONDS, Math.max(MIN_RETRY_AFTER_SECONDS, seconds));
}

/** The milliseconds to wait: retryAfterSeconds plus 0 to MAX_JITTER_MS of jitter (`random` in [0, 1)). */
export function busyRetryDelayMs(header, body, random = Math.random) {
  return retryAfterSeconds(header, body) * 1000 + Math.floor(random() * MAX_JITTER_MS);
}

/**
 * What to do with a failed answer: "retry" for a 429 with retries left (`retriesSoFar` of
 * MAX_BUSY_RETRIES used); "drop" for a 429 whose caller no longer wants the answer (`signal`
 * aborted), which is neither retried nor reported; "fail" for everything else, including a 429
 * with no retries left, which is reported as before.
 */
export function busyAnswerAction(status, retriesSoFar, signal) {
  if (status !== 429) return "fail";
  if (signal?.aborted) return "drop";
  return retriesSoFar < MAX_BUSY_RETRIES ? "retry" : "fail";
}

/**
 * Waits `ms` milliseconds; resolves true when the wait ran out, or false at once when `signal`
 * aborts (or already had), so a caller that gave up doesn't hold the request open. A plain timer
 * is used so Playwright's clock can fast-forward it.
 */
export function waitUnlessAborted(ms, signal) {
  if (signal?.aborted) return Promise.resolve(false);
  return new Promise((resolve) => {
    const onAbort = () => {
      clearTimeout(timer);
      resolve(false);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve(true);
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/** The `{ message, hint }` to show for a request the server was still too busy for. */
export function busyError(body) {
  const hint = typeof body?.hint === "string" && body.hint.trim() ? body.hint.trim() : BUSY_HINT;
  return { message: BUSY_MESSAGE, hint };
}
