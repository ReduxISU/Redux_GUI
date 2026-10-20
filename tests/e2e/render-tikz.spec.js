/**
 * The TikZ route that draws DFA and NFA pictures (pages/api/render-tikz.js), and what the page
 * shows when it fails (issue #389).
 *
 * node-tikzjax can't run two compiles at once: overlapping requests used to fail with "TeX engine
 * render failed", and the picture that asked for them stayed blank with no message.
 */
import { test as apiTest, expect } from "@playwright/test";
import { test } from "./fixtures";

// Two automaton nodes and an edge: small, but it uses the automata library the route loads.
const tikzBody = (label) => String.raw`\begin{tikzpicture}
\node[circle,draw] (a) at (0,0) {${label}};
\node[circle,draw,double] (b) at (2,0) {b};
\path[->] (a) edge (b);
\end{tikzpicture}`;

apiTest("concurrent render-tikz requests all succeed", async ({ request }) => {
  // Each compile takes a second or more, and these now wait their turn.
  apiTest.setTimeout(120_000);

  const labels = ["p", "q", "r"];
  const responses = await Promise.all(
    labels.map((label) =>
      request.post("/api/render-tikz", { data: { tikzBody: tikzBody(label) }, timeout: 110_000 }),
    ),
  );

  for (const response of responses) {
    const body = await response.json();
    expect(body.error).toBeUndefined();
    expect(response.status()).toBe(200);
    expect(body.success).toBe(true);
    expect(body.svg).toContain("<svg");
  }
});

// See app.spec.js: scope by row title, never getByLabel for the dropdowns.
const row = (page, title) =>
  page.locator(".accordion").filter({ has: page.getByText(title, { exact: true }) });

test("a failed TikZ render shows an error instead of a blank picture", async ({ page }) => {
  await page.route("**/api/render-tikz", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ success: false, error: "TeX engine render failed." }),
    }),
  );

  // DFA's default visualization is drawn with TikZ.
  const rendered = page.waitForRequest("**/api/render-tikz");
  await page.goto("/?problem=DFA");
  await rendered;

  await expect(row(page, "Visualize").getByRole("alert")).toHaveText("Couldn't draw this picture.");
});
