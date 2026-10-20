/**
 * Switching problems, reduction targets and pictures must never leave the previous picture on
 * screen (issue #388). Each test makes the race deterministic by holding the old answers back
 * with route interception, so they arrive after the new ones — the order that used to win.
 *
 * Pictures are told apart by their labels: 3SAT's reduction to Clique labels its nodes with
 * literals and clause numbers ("x1_0", "!x2_0"), which no picture for the other problems here has.
 */
import { expect, test } from "./fixtures";

// See app.spec.js: scope by row title, never getByLabel for the dropdowns.
const row = (page, title) =>
  page.locator(".accordion").filter({ has: page.getByText(title, { exact: true }) });

// Drawn pictures only; every toolbar icon is an <svg> too, and so is the Loading spinner.
const pictures = (locator) =>
  locator.locator("svg:not(.MuiSvgIcon-root):not(.MuiCircularProgress-svg)");

// The picture pane's loading and failed states (components/Visualization/svgs/No_Viz_SVG.js).
const loadingNote = (locator) => locator.getByRole("status").filter({ hasText: "Loading..." });
const failedNote = (locator) =>
  locator.getByRole("alert").filter({ hasText: "Failed to Visualize" });

// The right-hand pane of the Visualize row when "Show reduction" is on.
const reductionPane = (page) => row(page, "Visualize").locator(".wrap > .MuiContainer-root").nth(1);

const SAT3_TO_CLIQUE_LABEL = /!?x\d+_\d+/;

async function choose(page, rowTitle, name, nth = 0) {
  const input = row(page, rowTitle).getByRole("combobox").nth(nth);
  await input.click();
  await input.fill(name);
  await page.getByRole("listbox").getByText(name, { exact: true }).first().click();
  await expect(input).toHaveValue(name);
}

// Holds every answer whose URL matches `pattern` for `ms`, then delivers it. Returns a function
// that resolves once every held answer has been delivered.
async function holdAnswers(page, pattern, ms) {
  const held = [];
  await page.route(pattern, (route) => {
    const delivery = (async () => {
      try {
        const response = await route.fetch();
        await new Promise((resolve) => setTimeout(resolve, ms));
        await route.fulfill({ response });
      } catch {
        // The page closed first; nothing left to deliver to.
      }
    })();
    held.push(delivery);
    return delivery;
  });
  return () => Promise.all(held);
}

// Records the path and query of every backend request made from now on.
function recordRequests(page) {
  const urls = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/api/redux/")) urls.push(decodeURIComponent(url.split("/api/redux/")[1]));
  });
  return urls;
}

async function showReduction(page) {
  const toggle = row(page, "Visualize").getByLabel("Show reduction");
  await expect(toggle).toBeEnabled();
  await toggle.check();
}

test("switching problems with Show reduction on never brings back the old problem's pictures", async ({
  page,
}) => {
  const deliveredAll = await holdAnswers(page, /reduction=SipserReduceToCliqueStandard/, 4000);
  await page.goto("/");
  const visualizeRow = row(page, "Visualize");
  await expect(pictures(visualizeRow).first()).toBeVisible();

  // Turning the reduction on asks for 3SAT's reduction picture; switch while it is held back.
  const oldPictureAsked = page.waitForRequest(/visualizeReduction\?reduction=SipserReduceToClique/);
  await showReduction(page);
  await oldPictureAsked;
  await choose(page, "Problem", "Clique");

  await expect(pictures(reductionPane(page)).first()).toBeVisible();
  await deliveredAll();
  // Give React a moment to draw anything the late answers might have stored.
  await page.waitForTimeout(500);

  await expect(visualizeRow.getByLabel("Show reduction")).toBeChecked();
  await expect(pictures(reductionPane(page)).first()).toBeVisible();
  await expect(visualizeRow).not.toContainText(SAT3_TO_CLIQUE_LABEL);
});

test("switching the reduction target asks for and draws the new target's reduction", async ({
  page,
}) => {
  const deliveredAll = await holdAnswers(page, /reduction=SipserReduceToCliqueStandard/, 4000);
  await page.goto("/");
  await expect(pictures(row(page, "Visualize")).first()).toBeVisible();

  const oldPictureAsked = page.waitForRequest(/visualizeReduction\?reduction=SipserReduceToClique/);
  await showReduction(page);
  await oldPictureAsked;

  const requests = recordRequests(page);
  await choose(page, "Reduce", "Graph Coloring");

  await expect(pictures(reductionPane(page)).first()).toBeVisible();
  await deliveredAll();
  await page.waitForTimeout(500);

  await expect(pictures(reductionPane(page)).first()).toBeVisible();
  await expect(reductionPane(page)).not.toContainText(SAT3_TO_CLIQUE_LABEL);

  // Every reduction request after the switch is for the new target's reduction.
  const reductionRequests = requests.filter((url) => url.includes("reduction="));
  expect(reductionRequests.some((url) => url.includes("reduction=KarpReduceGRAPHCOLORING"))).toBe(
    true,
  );
  expect(reductionRequests.filter((url) => !url.includes("KarpReduceGRAPHCOLORING"))).toEqual([]);
});

test("switching to a problem with no reductions turns Show reduction off", async ({ page }) => {
  await page.goto("/?problem=CLIQUE");
  const visualizeRow = row(page, "Visualize");
  await showReduction(page);
  await expect(pictures(reductionPane(page)).first()).toBeVisible();

  const requests = recordRequests(page);
  await choose(page, "Problem", "Deutsch");

  // Deutsch reduces to nothing (Navigation/NPC_NavGraph/availableReductions is empty).
  const toggle = visualizeRow.getByLabel("Show reduction");
  await expect(toggle).not.toBeChecked();
  await expect(toggle).toBeDisabled();
  await expect(pictures(visualizeRow).first()).toBeVisible();
  await expect(visualizeRow.locator(".wrap")).toHaveCount(0);

  // Nothing keeps asking for Clique's reduction.
  await page.waitForTimeout(1000);
  expect(requests.filter((url) => url.includes("reduction="))).toEqual([]);
});

test("a problem whose picture comes back empty says no picture is available, not that it failed", async ({
  page,
}) => {
  await page.route(/visualize\?visualization=CliqueDefaultVisualization/, (route) =>
    route.fulfill({ json: [] }),
  );
  await page.goto("/");
  const visualizeRow = row(page, "Visualize");
  await expect(pictures(visualizeRow).first()).toBeVisible();

  await choose(page, "Problem", "Clique");

  await expect(visualizeRow).toContainText("No Clique picture is available for this instance.");
  await expect(pictures(visualizeRow)).toHaveCount(0);
  await expect(failedNote(visualizeRow)).toHaveCount(0);
});

// A failed picture request ends on "Failed to Visualize" with which request failed, for what, and
// what happened; never on the old picture, a blank pane or endless loading.
for (const [what, answer, details] of [
  [
    "a 500",
    (route) => route.fulfill({ status: 500, body: "visualizer exploded" }),
    [/HTTP 500/, /visualizer exploded/],
  ],
  ["an aborted", (route) => route.abort(), [/No answer from the server/]],
]) {
  test(`${what} picture request shows Failed to Visualize with the reason`, async ({
    page,
    expectedFailures,
  }) => {
    // The failure is provoked on purpose; don't let the silent-failure guard flag it.
    expectedFailures.push({
      url: "visualize?visualization=CliqueDefaultVisualization",
      status: 500,
      log: "CliqueDefaultVisualization VISUALIZE REQUEST FAILED",
    });
    await page.route(/visualize\?visualization=CliqueDefaultVisualization/, answer);
    await page.goto("/");
    const visualizeRow = row(page, "Visualize");
    await expect(pictures(visualizeRow).first()).toBeVisible();

    await choose(page, "Problem", "Clique");

    const failed = failedNote(visualizeRow);
    await expect(failed).toBeVisible();
    await expect(failed).toContainText(
      "Picture request failed for problem Clique, visualization CliqueDefaultVisualization.",
    );
    for (const detail of details) await expect(failed).toContainText(detail);
    await expect(pictures(visualizeRow)).toHaveCount(0);
    await expect(loadingNote(visualizeRow)).toHaveCount(0);
  });
}

test("a slow picture shows Loading... until it arrives", async ({ page }) => {
  await holdAnswers(page, /visualize\?visualization=CliqueDefaultVisualization/, 4000);
  await page.goto("/");
  const visualizeRow = row(page, "Visualize");
  await expect(pictures(visualizeRow).first()).toBeVisible();

  await choose(page, "Problem", "Clique");

  await expect(loadingNote(visualizeRow)).toBeVisible();
  await expect(pictures(visualizeRow)).toHaveCount(0);
  await expect(pictures(visualizeRow).first()).toBeVisible();
  await expect(loadingNote(visualizeRow)).toHaveCount(0);
});

test("a failed picture type request shows Failed to Visualize, not endless loading", async ({
  page,
  expectedFailures,
}) => {
  expectedFailures.push({
    url: "info?interface=CliqueDefaultVisualization",
    status: 500,
    log: "CliqueDefaultVisualization INFO REQUEST FAILED",
  });
  await page.route(/info\?interface=CliqueDefaultVisualization/, (route) =>
    route.fulfill({ status: 500, json: { title: "info exploded" } }),
  );
  await page.goto("/");
  const visualizeRow = row(page, "Visualize");
  await expect(pictures(visualizeRow).first()).toBeVisible();

  await choose(page, "Problem", "Clique");

  const failed = failedNote(visualizeRow);
  await expect(failed).toBeVisible();
  await expect(failed).toContainText(
    "Picture type (info) request failed for problem Clique, visualization CliqueDefaultVisualization.",
  );
  await expect(failed).toContainText("HTTP 500");
  await expect(failed).toContainText("info exploded");
  await expect(loadingNote(visualizeRow)).toHaveCount(0);
});

test("while the list of pictures loads the pane shows Loading..., never a blank", async ({
  page,
}) => {
  const deliveredAll = await holdAnswers(page, /Navigation\/Batch\/allVisualizations/, 4000);
  await page.goto("/");
  const visualizeRow = row(page, "Visualize");

  // The list is held back, so nothing can be drawn yet; the pane says it is loading.
  await expect(loadingNote(visualizeRow)).toBeVisible();
  await expect(pictures(visualizeRow)).toHaveCount(0);

  await deliveredAll();
  await expect(pictures(visualizeRow).first()).toBeVisible();
  await expect(loadingNote(visualizeRow)).toHaveCount(0);
});

test("a failed reduction picture request shows Failed to Visualize on the reduction side", async ({
  page,
  expectedFailures,
}) => {
  expectedFailures.push({
    url: "visualizeReduction?reduction=SipserReduceToCliqueStandard",
    status: 500,
    log: "SipserReduceToCliqueStandard VISUALIZE REQUEST FAILED",
  });
  await page.route(/visualizeReduction\?reduction=SipserReduceToCliqueStandard/, (route) =>
    route.fulfill({ status: 500, body: "reduction exploded" }),
  );
  await page.goto("/");
  await expect(pictures(row(page, "Visualize")).first()).toBeVisible();

  await showReduction(page);

  const failed = failedNote(reductionPane(page));
  await expect(failed).toBeVisible();
  await expect(failed).toContainText(
    "Reduction picture request failed for problem 3SAT, reduction SipserReduceToCliqueStandard to Clique.",
  );
  await expect(failed).toContainText("HTTP 500");
  await expect(failed).toContainText("reduction exploded");
  // The main picture is unaffected.
  await expect(pictures(row(page, "Visualize")).first()).toBeVisible();
});
