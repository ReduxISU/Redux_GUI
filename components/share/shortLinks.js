/**
 * Short share links, link sharing phase 2 (ReduxISU/Redux#844).
 *
 * A view too big for a plain link is saved by the Redux API (`POST ShareLinks`), which answers
 * with a short id; the link is then just `?share={id}`. Opening it asks the API for the view back
 * (`GET ShareLinks/{id}`). Saved links last about 6 months.
 *
 * The helpers that build requests, read ids and word errors are pure, so they can be unit tested;
 * createShortLink and fetchShortLink are the two calls to the API.
 */
import { fetchAndParse } from "../redux/index.js";
import { SHARE_KEYS, TOO_BIG_ADVICE } from "./shareState.js";

/** How long a saved link lasts, in words (the API keeps them about 6 months). */
export const SHORT_LINK_LIFETIME = "about 6 months";

// Ids are 10 letters or digits. A pasted bare id has to look exactly like one, so other pasted
// text still gets parseShareInput's messages.
const BARE_ID = /^[A-Za-z0-9]{10}$/;

/** The view to save: only the parts a plain link carries, and only non-empty strings. */
export function shortLinkView(state) {
  const view = {};
  for (const key of SHARE_KEYS) {
    if (typeof state?.[key] === "string" && state[key] !== "") view[key] = state[key];
  }
  return view;
}

/** The POST that saves `state` on the API at `apiUrl` (the base URL, ending in "/"). */
export function createShortLinkRequest(apiUrl, state) {
  return {
    url: `${apiUrl}ShareLinks`,
    init: {
      method: "POST",
      body: JSON.stringify({ view: shortLinkView(state) }),
      headers: { "Content-Type": "application/json; charset=UTF-8" },
    },
  };
}

/** The address of the saved view `id` on the API at `apiUrl`. */
export function fetchShortLinkUrl(apiUrl, id) {
  return `${apiUrl}ShareLinks/${encodeURIComponent(id)}`;
}

/** The short link to copy: the main page's address (`baseUrl`, no query) with `?share={id}`. */
export function buildShortLinkUrl(baseUrl, id) {
  return `${baseUrl}?${new URLSearchParams({ share: id }).toString()}`;
}

/** The `share` id in a query string (with or without the leading "?"), or null when it has none. */
export function shareIdFromQuery(query) {
  const params = new URLSearchParams((query ?? "").replace(/^\?/, ""));
  const id = params.get("share")?.trim();
  return id ? id : null;
}

/**
 * The share id in what a person pasted into Import: a whole short link, its "?share=..." part, or
 * the bare id. Null when the text isn't a short link (it may still be a plain one).
 */
export function shareIdFromInput(text) {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return null;
  if (BARE_ID.test(trimmed)) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    try {
      return shareIdFromQuery(new URL(trimmed).search);
    } catch {
      return null;
    }
  }
  const at = trimmed.indexOf("?");
  return shareIdFromQuery(at >= 0 ? trimmed.slice(at) : trimmed);
}

const text = (value) => (typeof value === "string" ? value.trim() : "");

// The proxy answers 502 with no `message` when the API itself is down.
const unreachable = (failure, body) =>
  failure?.kind === "unreachable" ||
  failure?.kind === "timeout" ||
  (failure?.status === 502 && !text(body?.message));

/** Whole minutes to wait, at least 1, from the 429 body's `retryAfterSeconds`; null if unknown. */
function retryMinutes(body) {
  const seconds = Number(body?.retryAfterSeconds);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return Math.max(1, Math.ceil(seconds / 60));
}

/**
 * Why a too-big view couldn't be saved as a short link, in plain words, from fetchAndParse's
 * onError `body` and `failure` ({ kind, status }).
 */
export function createShortLinkError(failure, body) {
  if (unreachable(failure, body)) {
    return (
      "This view is too big to fit in a link, and the server that saves short links couldn't " +
      "be reached. Check your connection and try again."
    );
  }
  const status = failure?.status;
  if (status === 503) {
    return `This view is too big to fit in a link, and this server can't save links right now. ${TOO_BIG_ADVICE}`;
  }
  if (status === 413) return `This view is too big even to save as a short link. ${TOO_BIG_ADVICE}`;
  if (status === 429) {
    const minutes = retryMinutes(body);
    const when = minutes
      ? `in about ${minutes} minute${minutes === 1 ? "" : "s"}`
      : "in a little while";
    return `This view is too big for a plain link, and too many short links were made from here recently. Try again ${when}.`;
  }
  const reason = text(body?.message);
  const hint = text(body?.hint);
  return [
    "This view is too big to fit in a link, and the server couldn't save it as a short link" +
      (reason ? `: ${reason.replace(/\.$/, "")}.` : status ? ` (HTTP ${status}).` : "."),
    hint,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Why a short link couldn't be opened, in plain words (same arguments as createShortLinkError). */
export function fetchShortLinkError(failure, body) {
  if (unreachable(failure, body)) {
    return "Couldn't reach the server to open this share link. Check your connection and try again.";
  }
  const status = failure?.status;
  if (status === 404) {
    return `This share link doesn't exist or has expired (links last ${SHORT_LINK_LIFETIME}).`;
  }
  if (status === 503) return "This server can't open share links right now.";
  const reason = text(body?.message);
  if (reason) return `This share link couldn't be opened: ${reason.replace(/\.$/, "")}.`;
  return `This share link couldn't be opened${status ? ` (HTTP ${status})` : ""}. Try again later.`;
}

/** What the API sent back for a saved view, as share state; null when it names no problem. */
export function shareStateFromShortLink(answer) {
  const state = shortLinkView(answer?.view);
  return state.problem ? state : null;
}

/**
 * Saves `state` (only its SHARE_KEYS) and resolves to { ok: true, id } or { ok: false, message }.
 */
export async function createShortLink(apiUrl, state) {
  const { url, init } = createShortLinkRequest(apiUrl, state);
  let failure = null;
  const answer = await fetchAndParse(
    url,
    init,
    () => "SHARE LINK REQUEST FAILED",
    (_detail, body, info) => {
      failure = { info, body };
    },
  );
  if (typeof answer?.id === "string" && answer.id !== "") return { ok: true, id: answer.id };
  return { ok: false, message: createShortLinkError(failure?.info, failure?.body) };
}

/** Reads saved view `id` back; resolves to { ok: true, state } or { ok: false, message }. */
export async function fetchShortLink(apiUrl, id) {
  let failure = null;
  const answer = await fetchAndParse(
    fetchShortLinkUrl(apiUrl, id),
    undefined,
    () => "SHARE LINK REQUEST FAILED",
    (_detail, body, info) => {
      failure = { info, body };
    },
  );
  if (answer === undefined) {
    return { ok: false, message: fetchShortLinkError(failure?.info, failure?.body) };
  }
  const state = shareStateFromShortLink(answer);
  if (!state) {
    return {
      ok: false,
      message: "This share link is damaged: it doesn't say which problem to open.",
    };
  }
  return { ok: true, state };
}
