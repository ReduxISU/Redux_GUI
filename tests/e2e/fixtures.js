/**
 * Shared test fixture: the silent-failure guard.
 *
 * WHY THIS EXISTS. `components/redux/index.js` swallows every fetch error — `fetchJson` and
 * `fetchPostJson` catch, `console.log`, and return `undefined`. Nothing is thrown and nothing is
 * shown to the user, so a backend that is down or half-broken still renders a page that looks
 * completely normal: dropdowns are just empty and panels are just blank. A test that only asserts
 * "the page rendered" would pass against a totally broken stack.
 *
 * So every browser test gets this guard for free: if a request through the proxy fails, or the app
 * logs one of its REQUEST FAILED messages, the test fails and names what broke.
 *
 * USE THIS `test`, NOT the one from "@playwright/test", in any spec that drives a page. API-only
 * specs (Playwright's `request` fixture, no browser) should import "@playwright/test" directly —
 * this fixture depends on `page`, which would launch a browser they do not need.
 */
import { test as base, expect } from "@playwright/test";

/**
 * Requests that already fail on every page load, before anyone touches anything.
 *
 * This list is an inventory of the app's existing silent failures, not a place to hide flaky
 * endpoints. Every entry is a bug worth fixing; fixing one means deleting its entry, at which
 * point the guard starts protecting that call too. Adding an entry needs a reason a reviewer
 * would accept.
 *
 * Every entry here is a fault on the GUI side — the API is correctly rejecting a malformed request
 * or a route that does not exist. None of them is a backend bug.
 *
 * Captured 2026-08-05 against ghcr.io/reduxisu/redux:latest. Re-check with a freshly pulled image
 * before adding an entry: `:latest` moves, and a stale local copy will make a route that exists
 * look permanently broken.
 */
const KNOWN_SILENT_FAILURES = [
  {
    url: "ProblemProvider/problemInstance",
    status: 400,
    log: "PROBLEM GENERIC INSTANCE REQUEST FAILED",
    why: "fires with the placeholder instance '{{1,2,3},{1,2},GENERIC}' seeded in Problem.js before the real defaultInstance arrives; the backend rejects it as unparseable",
  },
  {
    url: "ProblemProvider/solve",
    status: 400,
    log: "SOLVED INSTANCE REQUEST FAILED",
    why: "the visualize row auto-solves on mount, hitting the same placeholder instance as above",
  },
  {
    url: "ProblemProvider/gadgets?reduction=",
    status: 400,
    log: "MAP GADGETS REQUEST FAILED",
    why: "fires before chosenReductionType resolves, so `reduction` is empty",
  },
  {
    url: "ProblemProvider/reduce?reduction=",
    status: 400,
    log: "REDUCED INSTANCE REQUEST FAILED",
    why: "fires before chosenReductionType resolves, so `reduction` is empty",
  },
  {
    url: "ProblemProvider/reduce?reduction=",
    status: 400,
    log: "REDUCED INSTANCE FROM PATH REQUEST FAILED",
    why: "downstream of the empty-reduction call above",
  },
  {
    url: "/info",
    status: 404,
    log: "INFO REQUEST FAILED",
    why: "requestReductionInfo builds GET <reduction>/info, a route that does not exist. GET ProblemProvider/info?interface=<reduction> returns the data — a one-line fix in components/redux/index.js",
  },
];

const isKnownResponse = (url, status) =>
  KNOWN_SILENT_FAILURES.some((known) => url.includes(known.url) && status === known.status);

const isKnownLog = (text) => KNOWN_SILENT_FAILURES.some((known) => text.includes(known.log));

export const test = base.extend({
  guardAgainstSilentFailures: [
    async ({ page }, use) => {
      const failures = [];

      page.on("response", (response) => {
        const url = response.url();
        const status = response.status();
        if (url.includes("/api/redux/") && status >= 400 && !isKnownResponse(url, status)) {
          failures.push(`HTTP ${status} ${url}`);
        }
      });

      // Catches the case with no response at all — the backend unreachable, where fetch rejects.
      page.on("console", (message) => {
        const text = message.text();
        if (text.includes("REQUEST FAILED") && !isKnownLog(text)) {
          failures.push(`console: ${text}`);
        }
      });

      await use();

      expect(failures, "backend requests failed silently — the UI hides these").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
