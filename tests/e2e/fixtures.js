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
 * Captured 2026-08-05, re-verified 2026-09-23 against ghcr.io/reduxisu/redux:latest; emptied 2026-11-26 (#125). Re-check with a freshly pulled image
 * before adding an entry: `:latest` moves, and a stale local copy will make a route that exists
 * look permanently broken.
 */
// Empty since #125 was fixed: the placeholder instance in Problem.js is replaced by the backend's
// defaultInstance in the same render that picks 3SAT (#316), so no request carries it. Its two entries
// here (problemInstance and the visualize row's solve, both 400) are gone, so every test now guards
// those calls too.
const KNOWN_SILENT_FAILURES = [];

const isKnownResponse = (url, status) =>
  KNOWN_SILENT_FAILURES.some((known) => url.includes(known.url) && status === known.status);

const isKnownLog = (text) => KNOWN_SILENT_FAILURES.some((known) => text.includes(known.log));

export const test = base.extend({
  // Per-test opt-out for a failure the test provokes on purpose (e.g. a malformed certificate).
  // A test pushes `{ url, status }` entries; only those exact failures are ignored for that test.
  // An entry may also carry `log`, the REQUEST FAILED message that failure prints.
  expectedFailures: [[], { option: false }],

  guardAgainstSilentFailures: [
    async ({ page, expectedFailures }, use) => {
      const failures = [];

      page.on("response", (response) => {
        const url = response.url();
        const status = response.status();
        // A 429 "server busy" answer is not a failure yet: the app waits and asks again
        // (components/redux/busyRetry.js). If every retry is turned away too, the app logs its
        // REQUEST FAILED message, which the console listener below still catches.
        if (status === 429) return;
        const isExpected = expectedFailures.some((e) => url.includes(e.url) && status === e.status);
        if (
          url.includes("/api/redux/") &&
          status >= 400 &&
          !isKnownResponse(url, status) &&
          !isExpected
        ) {
          failures.push(`HTTP ${status} ${url}`);
        }
      });

      // Catches the case with no response at all — the backend unreachable, where fetch rejects.
      page.on("console", (message) => {
        const text = message.text();
        const isExpected = expectedFailures.some((e) => e.log && text.includes(e.log));
        if (text.includes("REQUEST FAILED") && !isKnownLog(text) && !isExpected) {
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
