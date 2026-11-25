// Link sharing, phase 2 (ReduxISU/Redux#844): a view too big for a plain link is saved by the API
// and shared as a short `?share={id}` link. These cover building the requests, reading ids back
// out of addresses and pasted text, and the plain-words messages for each way it can fail. The
// two API calls run against a stand-in fetch.
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { TOO_BIG_ADVICE } from "../../components/share/shareState.js";
import {
  buildShortLinkUrl,
  createShortLink,
  createShortLinkError,
  createShortLinkRequest,
  fetchShortLink,
  fetchShortLinkError,
  fetchShortLinkUrl,
  shareIdFromInput,
  shareIdFromQuery,
  shareStateFromShortLink,
  shortLinkView,
} from "../../components/share/shortLinks.js";

const API = "/api/redux/";
const VIEW = {
  problem: "SAT3",
  instance: "(x1 | !x2 | x3)",
  solver: "SkeletonSolver",
  reduceTo: "CLIQUE",
  reductionType: "SipserReduceToCliqueStandard",
  verifier: "KadensSimpleVerifier",
};
const rejected = (status) => ({ kind: "rejected", status, text: "" });

describe("shortLinkView", () => {
  test("keeps only the six share keys, and only non-empty strings", () => {
    assert.deepEqual(
      shortLinkView({ ...VIEW, extra: "x", instance: "", solver: 5, verifier: undefined }),
      { problem: "SAT3", reduceTo: "CLIQUE", reductionType: "SipserReduceToCliqueStandard" },
    );
  });

  test("is empty for nothing", () => {
    assert.deepEqual(shortLinkView(undefined), {});
  });
});

describe("createShortLinkRequest", () => {
  test("POSTs the view as JSON under `view`", () => {
    const { url, init } = createShortLinkRequest(API, { ...VIEW, extra: "dropped" });
    assert.equal(url, "/api/redux/ShareLinks");
    assert.equal(init.method, "POST");
    assert.match(init.headers["Content-Type"], /^application\/json/);
    assert.deepEqual(JSON.parse(init.body), { view: VIEW });
  });
});

describe("link addresses", () => {
  test("the short link is the page's address with ?share=", () => {
    assert.equal(
      buildShortLinkUrl("https://redux.example/", "abc123XYZ0"),
      "https://redux.example/?share=abc123XYZ0",
    );
  });

  test("the API address escapes the id", () => {
    assert.equal(fetchShortLinkUrl(API, "abc123XYZ0"), "/api/redux/ShareLinks/abc123XYZ0");
    assert.equal(fetchShortLinkUrl(API, "a/b?c"), "/api/redux/ShareLinks/a%2Fb%3Fc");
  });
});

describe("shareIdFromQuery", () => {
  test("reads share= with or without the ?", () => {
    assert.equal(shareIdFromQuery("?share=abc123XYZ0"), "abc123XYZ0");
    assert.equal(shareIdFromQuery("share=abc123XYZ0&problem=SAT3"), "abc123XYZ0");
  });

  test("is null when there is no share id", () => {
    assert.equal(shareIdFromQuery("?problem=SAT3&instance=x"), null);
    assert.equal(shareIdFromQuery("?share="), null);
    assert.equal(shareIdFromQuery(""), null);
    assert.equal(shareIdFromQuery(undefined), null);
  });
});

describe("shareIdFromInput", () => {
  test("reads a whole short link", () => {
    assert.equal(shareIdFromInput(" https://redux.example/?share=abc123XYZ0 "), "abc123XYZ0");
  });

  test("reads just the query part", () => {
    assert.equal(shareIdFromInput("?share=abc123XYZ0"), "abc123XYZ0");
    assert.equal(shareIdFromInput("share=abc123XYZ0"), "abc123XYZ0");
  });

  test("reads a bare 10-character id", () => {
    assert.equal(shareIdFromInput("abc123XYZ0"), "abc123XYZ0");
  });

  test("leaves plain links and other text to the plain-link reader", () => {
    assert.equal(shareIdFromInput("https://redux.example/?problem=SAT3&instance=x"), null);
    assert.equal(shareIdFromInput("?problem=SAT3"), null);
    assert.equal(shareIdFromInput("SAT3"), null);
    assert.equal(shareIdFromInput("abc123"), null);
    assert.equal(shareIdFromInput("http://[bad"), null);
    assert.equal(shareIdFromInput(""), null);
  });
});

describe("createShortLinkError", () => {
  test("503: the server can't save links, with today's advice", () => {
    const message = createShortLinkError(rejected(503), { error: "short_links_unavailable" });
    assert.match(message, /too big to fit in a link/);
    assert.match(message, /can't save links right now/);
    assert.ok(message.endsWith(TOO_BIG_ADVICE));
  });

  test("413: too big even to save", () => {
    const message = createShortLinkError(rejected(413), { maxViewBytes: 1048576 });
    assert.match(message, /too big even to save/);
    assert.ok(message.endsWith(TOO_BIG_ADVICE));
  });

  test("429: says when to try again, in whole minutes", () => {
    assert.match(
      createShortLinkError(rejected(429), { retryAfterSeconds: 600 }),
      /about 10 minutes/,
    );
    assert.match(createShortLinkError(rejected(429), { retryAfterSeconds: 61 }), /about 2 minutes/);
    assert.match(createShortLinkError(rejected(429), { retryAfterSeconds: 5 }), /about 1 minute\./);
    assert.match(createShortLinkError(rejected(429), {}), /too many short links.*a little while/);
  });

  test("no answer, a timeout, or the proxy's 502: couldn't reach the server", () => {
    for (const failure of [{ kind: "unreachable" }, { kind: "timeout" }, rejected(502)]) {
      assert.match(
        createShortLinkError(failure, { error: "Upstream unreachable" }),
        /couldn't be reached/,
      );
    }
  });

  test("anything else quotes the server's message and hint", () => {
    const message = createShortLinkError(rejected(400), {
      error: "share_invalid",
      message: "The view must name a problem.",
      hint: "Send a view with a problem.",
    });
    assert.equal(
      message,
      "This view is too big to fit in a link, and the server couldn't save it as a short link: " +
        "The view must name a problem. Send a view with a problem.",
    );
    assert.match(createShortLinkError(rejected(500), undefined), /\(HTTP 500\)\.$/);
    assert.match(createShortLinkError(undefined, undefined), /short link\.$/);
  });
});

describe("fetchShortLinkError", () => {
  test("404: doesn't exist or has expired, and how long links last", () => {
    assert.equal(
      fetchShortLinkError(rejected(404), { error: "share_not_found" }),
      "This share link doesn't exist or has expired (links last about 6 months).",
    );
  });

  test("503: the server can't open links", () => {
    assert.equal(
      fetchShortLinkError(rejected(503), {}),
      "This server can't open share links right now.",
    );
  });

  test("no answer: couldn't reach the server", () => {
    assert.match(fetchShortLinkError({ kind: "unreachable" }, undefined), /Couldn't reach/);
    assert.match(
      fetchShortLinkError(rejected(502), { error: "Upstream unreachable" }),
      /Couldn't reach/,
    );
  });

  test("anything else: the server's message, else the status", () => {
    assert.equal(
      fetchShortLinkError(rejected(500), { message: "Something broke." }),
      "This share link couldn't be opened: Something broke.",
    );
    assert.match(fetchShortLinkError(rejected(500), undefined), /\(HTTP 500\)/);
  });
});

describe("shareStateFromShortLink", () => {
  test("keeps the share keys of the saved view", () => {
    assert.deepEqual(shareStateFromShortLink({ id: "x", view: { ...VIEW, other: 1 } }), VIEW);
  });

  test("is null for a saved view without a problem", () => {
    assert.equal(shareStateFromShortLink({ view: { instance: "x" } }), null);
    assert.equal(shareStateFromShortLink({}), null);
  });
});

describe("the API calls", () => {
  const realFetch = globalThis.fetch;
  const realLog = console.log;
  let calls;
  const answer = (status, body) => {
    globalThis.fetch = async (url, init) => {
      calls.push({ url, init });
      return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    };
  };

  beforeEach(() => {
    calls = [];
    console.log = () => {};
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
    console.log = realLog;
  });

  test("createShortLink resolves the new id", async () => {
    answer(201, { id: "abc123XYZ0", createdAt: "now", expiresAt: "later" });
    assert.deepEqual(await createShortLink(API, VIEW), { ok: true, id: "abc123XYZ0" });
    assert.equal(calls[0].url, "/api/redux/ShareLinks");
    assert.deepEqual(JSON.parse(calls[0].init.body), { view: VIEW });
  });

  test("createShortLink explains a refusal", async () => {
    answer(503, { error: "short_links_unavailable", message: "No database." });
    const result = await createShortLink(API, VIEW);
    assert.equal(result.ok, false);
    assert.match(result.message, /can't save links right now/);
  });

  test("createShortLink explains a network error", async () => {
    globalThis.fetch = async () => {
      throw new TypeError("fetch failed");
    };
    const result = await createShortLink(API, VIEW);
    assert.equal(result.ok, false);
    assert.match(result.message, /couldn't be reached/);
  });

  test("fetchShortLink resolves the saved view", async () => {
    answer(200, { id: "abc123XYZ0", view: VIEW, createdAt: "now", expiresAt: "later" });
    assert.deepEqual(await fetchShortLink(API, "abc123XYZ0"), { ok: true, state: VIEW });
    assert.equal(calls[0].url, "/api/redux/ShareLinks/abc123XYZ0");
  });

  test("fetchShortLink explains a missing link", async () => {
    answer(404, { error: "share_not_found", message: "No such share link." });
    const result = await fetchShortLink(API, "abc123XYZ0");
    assert.equal(result.ok, false);
    assert.match(result.message, /doesn't exist or has expired/);
  });

  test("fetchShortLink refuses a saved view with no problem", async () => {
    answer(200, { id: "abc123XYZ0", view: { instance: "x" } });
    const result = await fetchShortLink(API, "abc123XYZ0");
    assert.equal(result.ok, false);
    assert.match(result.message, /doesn't say which problem/);
  });
});
