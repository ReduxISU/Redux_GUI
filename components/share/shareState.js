/**
 * Link sharing (#281): the current view of the main page as a plain link, and back.
 *
 * Pure functions only, so they can be unit tested without a browser. The page-side wiring is in
 * useShareRestore.js (reading a link back into app state) and widgets/ShareButton.js (making and
 * importing links). Views too big for a plain link become short links (shortLinks.js).
 */

/** The parts of the view a link carries, in the order they appear in the link. */
export const SHARE_KEYS = [
  "problem",
  "instance",
  "solver",
  "reduceTo",
  "reductionType",
  "verifier",
];

/**
 * The longest plain share link we will make, in characters.
 *
 * Browsers cope with much longer URLs, but the servers and proxies in front of the site, chat
 * apps and email clients often do not: many cut URLs off or refuse them somewhere past 8,000
 * characters (8 KB is a common request-line limit, for example in nginx's default buffers and
 * several CDNs). A link that is cut off restores a broken instance, which is worse than no link,
 * so past this length Share saves the view on the server and copies a short link instead
 * (shortLinks.js, ReduxISU/Redux#844).
 */
export const MAX_SHARE_URL_LENGTH = 8000;

/** What to try when a view can't be shared at all (too big, and no short link either). */
export const TOO_BIG_ADVICE =
  "Try a smaller instance, or copy the instance text and send it separately.";

/** Why buildShareUrl refused: the plain link would be too long to survive being passed around. */
export const TOO_BIG_MESSAGE =
  "This view is too big to fit in a link. The problem instance is too long: a link this long " +
  "would get cut off by some browsers, servers or chat apps, and then it would open the wrong " +
  `thing. ${TOO_BIG_ADVICE}`;

/**
 * Reads the shareable state out of the page's state pieces, leaving out empty parts.
 * @returns {{ [key: string]: string }}
 */
export function shareStateFrom({
  problemName,
  problemInstance,
  solver,
  reduceTo,
  reductionType,
  verifier,
}) {
  const state = {
    problem: problemName,
    instance: problemInstance,
    solver,
    reduceTo,
    reductionType,
    verifier,
  };
  const out = {};
  for (const key of SHARE_KEYS) {
    if (typeof state[key] === "string" && state[key] !== "") out[key] = state[key];
  }
  return out;
}

/**
 * Builds the plain share link for `state` on `baseUrl` (the page's address without a query).
 * When it would be too long, Share makes a short link instead (shortLinks.js).
 * @returns {{ ok: true, url: string } | { ok: false, length: number, message: string }}
 */
export function buildShareUrl(baseUrl, state) {
  const params = new URLSearchParams();
  for (const key of SHARE_KEYS) {
    if (state[key]) params.set(key, state[key]);
  }
  const query = params.toString();
  const url = query ? `${baseUrl}?${query}` : baseUrl;
  if (url.length > MAX_SHARE_URL_LENGTH) {
    return { ok: false, length: url.length, message: TOO_BIG_MESSAGE };
  }
  return { ok: true, url };
}

/**
 * Reads share state out of a query string (with or without the leading "?").
 * Unknown keys are ignored; repeated keys keep the first value.
 * @returns {{ [key: string]: string }}
 */
export function shareStateFromQuery(query) {
  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  const out = {};
  for (const key of SHARE_KEYS) {
    const value = params.get(key);
    if (value !== null && value !== "") out[key] = value;
  }
  return out;
}

/** True when the state holds more than a bare problem name (a Browse card link is only that). */
export function isFullShareState(state) {
  return SHARE_KEYS.some((key) => key !== "problem" && state[key] !== undefined);
}

/**
 * Reads what a person pasted into Import: a whole share link, or just its query part.
 * @returns {{ ok: true, state: object } | { ok: false, message: string }}
 */
export function parseShareInput(text) {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return { ok: false, message: "Paste a shared link first." };

  let query;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    try {
      query = new URL(trimmed).search;
    } catch {
      return {
        ok: false,
        message: "That doesn't look like a link. Check that you pasted all of it.",
      };
    }
  } else {
    const at = trimmed.indexOf("?");
    query = at >= 0 ? trimmed.slice(at) : trimmed;
  }

  const state = shareStateFromQuery(query);
  if (!state.problem) {
    return {
      ok: false,
      message:
        "That link doesn't say which problem to open. Use a link made with the Share button.",
    };
  }
  return { ok: true, state };
}
