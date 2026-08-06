/**
 * EXEMPLAR: how to assert an HTTP contract.
 *
 * Copy this file's shape when you want to check what the API gives the GUI, without the cost and
 * flake of a browser. Playwright's `request` fixture is a plain HTTP client pointed at `baseURL`.
 *
 * Note the import: these specs use `@playwright/test` directly rather than ../fixtures, because
 * the silent-failure guard there needs a `page` and there is no browser here. Specs that drive
 * the UI should import from ../fixtures instead.
 *
 * Everything goes through `/api/redux/*` — the GUI's own server-side proxy
 * (pages/api/redux/[...path].js), which is the only route the browser ever uses. Hitting the
 * backend directly would skip the proxy and REDUX_BASE_URL, which are most of what can break.
 */
import { expect, test } from "@playwright/test";

test("the problem catalogue is reachable through the GUI's proxy", async ({ request }) => {
  const response = await request.get("/api/redux/Navigation/Batch/allProblems");

  expect(response.status()).toBe(200);

  // One assertion, but it proves the whole chain: the GUI image is serving, REDUX_BASE_URL is
  // set correctly, the proxy forwards and relays, and the backend is warm. (This route's first
  // call forces the reflection scan that builds the problem registry, so a 200 means the API is
  // genuinely ready, not just listening.)
  const problems = await response.json();
  expect(problems).toEqual(expect.arrayContaining(["SAT3", "CLIQUE"]));
});
