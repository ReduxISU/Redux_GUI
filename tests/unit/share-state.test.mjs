// Link sharing, phase 1 (#281): making a share link from the page's state, reading one back
// (from the address or from what a person pasted into Import), and refusing links too long to
// survive being passed around.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  buildShareUrl,
  isFullShareState,
  MAX_SHARE_URL_LENGTH,
  parseShareInput,
  SHARE_KEYS,
  shareStateFrom,
  shareStateFromQuery,
} from "../../components/share/shareState.js";

const BASE = "https://redux.example/";
const FULL = {
  problem: "SAT3",
  instance: "(x1 | !x2 | x3) & (!x1 | x3 | x1)",
  solver: "SkeletonSolver",
  reduceTo: "CLIQUE",
  reductionType: "SipserReduceToCliqueStandard",
  verifier: "KadensSimpleVerifier",
};

describe("shareStateFrom", () => {
  test("maps the page's state names onto the link's keys", () => {
    const state = shareStateFrom({
      problemName: "SAT3",
      problemInstance: FULL.instance,
      solver: FULL.solver,
      reduceTo: FULL.reduceTo,
      reductionType: FULL.reductionType,
      verifier: FULL.verifier,
    });
    assert.deepEqual(state, FULL);
  });

  test("leaves out empty and missing parts", () => {
    assert.deepEqual(
      shareStateFrom({ problemName: "CLIQUE", problemInstance: "", solver: undefined }),
      {
        problem: "CLIQUE",
      },
    );
  });
});

describe("buildShareUrl and shareStateFromQuery", () => {
  test("a built link reads back to the same state, special characters included", () => {
    const built = buildShareUrl(BASE, { ...FULL, instance: "{{1,2,3},{1&2},GENERIC} + ?#=" });
    assert.equal(built.ok, true);
    assert.ok(built.url.startsWith(`${BASE}?problem=SAT3&`));
    const query = built.url.slice(BASE.length);
    assert.deepEqual(shareStateFromQuery(query), {
      ...FULL,
      instance: "{{1,2,3},{1&2},GENERIC} + ?#=",
    });
  });

  test("keys come out in a fixed order", () => {
    const built = buildShareUrl(BASE, { verifier: "V", problem: "P" });
    assert.equal(built.url, `${BASE}?problem=P&verifier=V`);
    assert.deepEqual(SHARE_KEYS[0], "problem");
  });

  test("unknown keys in a query are ignored", () => {
    assert.deepEqual(shareStateFromQuery("?problem=SAT3&run=solve&utm_source=x"), {
      problem: "SAT3",
    });
  });

  test("a link right at the limit is made; one character more is refused with a message", () => {
    const fixed = `${BASE}?problem=P&instance=`.length;
    const atLimit = buildShareUrl(BASE, {
      problem: "P",
      instance: "a".repeat(MAX_SHARE_URL_LENGTH - fixed),
    });
    assert.equal(atLimit.ok, true);
    assert.equal(atLimit.url.length, MAX_SHARE_URL_LENGTH);

    const over = buildShareUrl(BASE, {
      problem: "P",
      instance: "a".repeat(MAX_SHARE_URL_LENGTH - fixed + 1),
    });
    assert.equal(over.ok, false);
    assert.equal(over.length, MAX_SHARE_URL_LENGTH + 1);
    assert.match(over.message, /too big to fit in a link/);
  });

  test("the limit counts the encoded length, not the raw instance", () => {
    // Each "&" becomes "%26" (3 characters), so this instance is short but its link is not.
    const instance = "&".repeat(Math.ceil(MAX_SHARE_URL_LENGTH / 3));
    assert.equal(buildShareUrl(BASE, { problem: "P", instance }).ok, false);
  });
});

describe("isFullShareState", () => {
  test("a bare problem (a /browse card link) is not a shared view", () => {
    assert.equal(isFullShareState({ problem: "SAT3" }), false);
  });

  test("anything beyond the problem is", () => {
    assert.equal(isFullShareState({ problem: "SAT3", instance: "x" }), true);
    assert.equal(isFullShareState({ solver: "S" }), true);
  });
});

describe("parseShareInput", () => {
  test("takes a whole link", () => {
    const { url } = buildShareUrl(BASE, FULL);
    assert.deepEqual(parseShareInput(url), { ok: true, state: FULL });
  });

  test("takes just the query, with or without the question mark, and trims spaces", () => {
    const query = buildShareUrl(BASE, FULL).url.slice(BASE.length);
    assert.deepEqual(parseShareInput(`  ${query}\n`), { ok: true, state: FULL });
    assert.deepEqual(parseShareInput(query.slice(1)), { ok: true, state: FULL });
  });

  test("takes a link without its scheme", () => {
    assert.deepEqual(parseShareInput("redux.example/?problem=CLIQUE&solver=S"), {
      ok: true,
      state: { problem: "CLIQUE", solver: "S" },
    });
  });

  test("explains an empty paste and a link without a problem", () => {
    const empty = parseShareInput("   ");
    assert.equal(empty.ok, false);
    assert.match(empty.message, /Paste a shared link/);

    const noProblem = parseShareInput("https://redux.example/?solver=S");
    assert.equal(noProblem.ok, false);
    assert.match(noProblem.message, /doesn't say which problem/);
  });
});
