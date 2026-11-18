/**
 * A failed Solve, Reduce or picture request shows the user why in that section of the page,
 * instead of a blank result (issue #419). A server that rejected the request is quoted (Redux
 * #933's `{ error, message, detail, hint }` body, or ProblemDetails' `title`); a server that
 * can't be reached says so. The message goes away as soon as a new request starts or the input
 * changes.
 */
import { expect, test } from "./fixtures";

// See app.spec.js: scope by row title, never getByLabel for the dropdowns.
const row = (page, title) =>
  page.locator(".accordion").filter({ has: page.getByText(title, { exact: true }) });

// Drawn pictures only; every toolbar icon is an <svg> too, and so is the Loading spinner.
const pictures = (locator) =>
  locator.locator("svg:not(.MuiSvgIcon-root):not(.MuiCircularProgress-svg)");

const failedNote = (locator) =>
  locator.getByRole("alert").filter({ hasText: "Failed to Visualize" });

const UNREACHABLE = "Couldn't reach the Redux server. Check your connection and try again.";

// A rejection in the shape of the backend's error contract (Redux #933).
const REJECTED = {
  error: "invalid_instance",
  message: "This instance couldn't be read.",
  detail: "Unexpected ')' at position 4.",
  hint: "Write each clause in parentheses, like (x1 | !x2).",
};
const rejectWith = (status, body) => (route) =>
  route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

async function choose(page, rowTitle, name, nth = 0) {
  const input = row(page, rowTitle).getByRole("combobox").nth(nth);
  await input.click();
  await input.fill(name);
  await page.getByRole("listbox").getByText(name, { exact: true }).first().click();
  await expect(input).toHaveValue(name);
}

// Opens the Solve row once its solver list has arrived; returns its Solve button and body.
async function openSolveRow(page) {
  await page.goto("/");
  const solveRow = row(page, "Solve");
  const solveButton = solveRow.getByRole("button", {
    name: "Solve",
    exact: true,
    includeHidden: true,
  });
  // Wait for the button before expanding; see app.spec.js for why.
  await expect(solveButton).toBeEnabled();
  await solveRow.getByRole("button", { name: "▼" }).click();
  const body = solveRow.locator(".card-body");
  await expect(body).toBeVisible();
  return { solveButton, body };
}

// Routed only after the page loaded, so the visualize row's solve on load reaches the backend.
const SOLVE = "**/ProblemProvider/solve?**";

test.describe("Solve", () => {
  test("a rejected solve shows the backend's message and hint", async ({
    page,
    expectedFailures,
  }) => {
    expectedFailures.push({ url: "ProblemProvider/solve", status: 422 });
    const { solveButton, body } = await openSolveRow(page);

    await page.route(SOLVE, rejectWith(422, REJECTED));
    await solveButton.click();

    const alert = body.getByRole("alert");
    await expect(alert).toContainText(REJECTED.message);
    await expect(alert).toContainText(`Try: ${REJECTED.hint}`);
    await expect(alert).not.toContainText(UNREACHABLE);
    await expect(body).not.toContainText("undefined");
  });

  test("a solve that can't reach the server says so", async ({ page }) => {
    const { solveButton, body } = await openSolveRow(page);

    await page.route(SOLVE, (route) => route.abort());
    await solveButton.click();

    await expect(body.getByRole("alert")).toHaveText(UNREACHABLE);
  });

  test("the proxy's 502 for a backend that is down also says the server can't be reached", async ({
    page,
    expectedFailures,
  }) => {
    expectedFailures.push({ url: "ProblemProvider/solve", status: 502 });
    const { solveButton, body } = await openSolveRow(page);

    // What pages/api/redux/[...path].js answers when the backend doesn't answer.
    await page.route(SOLVE, rejectWith(502, { error: "Upstream unreachable: fetch failed" }));
    await solveButton.click();

    await expect(body.getByRole("alert")).toHaveText(UNREACHABLE);
  });

  test("the message clears when a new solve starts, and a successful solve shows as usual", async ({
    page,
    expectedFailures,
  }) => {
    expectedFailures.push({ url: "ProblemProvider/solve", status: 422 });
    const { solveButton, body } = await openSolveRow(page);

    await page.route(SOLVE, rejectWith(422, REJECTED));
    await solveButton.click();
    await expect(body.getByRole("alert")).toContainText(REJECTED.message);

    await page.unroute(SOLVE);
    await solveButton.click();
    await expect(body).toContainText(/Solution:\s*\(x\d+:(True|False)/);
    await expect(body.getByRole("alert")).toHaveCount(0);
  });
});

// Only this one reduction fails, so another target's reduction still reaches the backend.
const REDUCE = /ProblemProvider\/reduce\?reduction=SipserReduceToCliqueStandard/;

// The Reduce row reduces by itself on load; wait for that result before routing.
async function openReduceRow(page) {
  await page.goto("/");
  const reduceRow = row(page, "Reduce");
  const reduceButton = reduceRow.getByRole("button", { name: "Reduce", exact: true });
  await expect(reduceButton).toBeEnabled();
  const body = reduceRow.locator(".card-body");
  await expect(body).toContainText("Reduced Clique Instance:");
  return { reduceButton, body };
}

test.describe("Reduce", () => {
  test("a rejected reduction shows the backend's message instead of a blank result", async ({
    page,
    expectedFailures,
  }) => {
    expectedFailures.push({
      url: "ProblemProvider/reduce",
      status: 400,
      log: "REDUCED INSTANCE",
    });
    const { reduceButton, body } = await openReduceRow(page);

    // An older endpoint's ProblemDetails body: only `title` says what went wrong.
    await page.route(
      REDUCE,
      rejectWith(400, { title: "One or more validation errors occurred.", status: 400 }),
    );
    await reduceButton.click();

    const alert = body.getByRole("alert");
    await expect(alert).toHaveText("One or more validation errors occurred.");
    await expect(body).not.toContainText("Reduced Clique Instance:");
  });

  test("a reduction that can't reach the server says so", async ({ page, expectedFailures }) => {
    expectedFailures.push({ url: "ProblemProvider/reduce", status: 0, log: "REDUCED INSTANCE" });
    const { reduceButton, body } = await openReduceRow(page);

    await page.route(REDUCE, (route) => route.abort());
    await reduceButton.click();

    await expect(body.getByRole("alert")).toHaveText(UNREACHABLE);
    await expect(body).not.toContainText("Reduced Clique Instance:");
  });

  test("the message clears when a new reduction starts or the target changes", async ({
    page,
    expectedFailures,
  }) => {
    expectedFailures.push({
      url: "ProblemProvider/reduce",
      status: 422,
      log: "REDUCED INSTANCE",
    });
    const { reduceButton, body } = await openReduceRow(page);
    const alert = body.getByRole("alert");

    await page.route(REDUCE, rejectWith(422, REJECTED));
    await reduceButton.click();
    await expect(alert).toContainText(REJECTED.message);
    await expect(alert).toContainText(`Try: ${REJECTED.hint}`);

    // A new target reduces by itself (its reduction isn't routed) and the message goes.
    await choose(page, "Reduce", "Graph Coloring");
    await expect(alert).toHaveCount(0);

    // Back to Clique, still failing; then a Reduce that succeeds shows the result as usual.
    await choose(page, "Reduce", "Clique");
    await expect(alert).toContainText(REJECTED.message);
    await page.unroute(REDUCE);
    await reduceButton.click();
    await expect(body).toContainText("Reduced Clique Instance:");
    await expect(alert).toHaveCount(0);
  });
});

// Only Clique's picture fails, so the page loads normally on 3SAT first.
const CLIQUE_PICTURE = /visualize\?visualization=CliqueDefaultVisualization/;

test.describe("Picture", () => {
  test("a rejected picture request shows the backend's message and hint", async ({
    page,
    expectedFailures,
  }) => {
    expectedFailures.push({
      url: "visualize?visualization=CliqueDefaultVisualization",
      status: 422,
      log: "CliqueDefaultVisualization VISUALIZE REQUEST FAILED",
    });
    await page.route(CLIQUE_PICTURE, rejectWith(422, REJECTED));
    await page.goto("/");
    const visualizeRow = row(page, "Visualize");
    await expect(pictures(visualizeRow).first()).toBeVisible();

    await choose(page, "Problem", "Clique");

    const failed = failedNote(visualizeRow);
    await expect(failed).toContainText(REJECTED.message);
    await expect(failed).toContainText(`Try: ${REJECTED.hint}`);
    await expect(failed).not.toContainText(UNREACHABLE);
    await expect(pictures(visualizeRow)).toHaveCount(0);
  });

  test("a picture request that can't reach the server says so", async ({
    page,
    expectedFailures,
  }) => {
    expectedFailures.push({
      url: "visualize?visualization=CliqueDefaultVisualization",
      status: 0,
      log: "CliqueDefaultVisualization VISUALIZE REQUEST FAILED",
    });
    await page.route(CLIQUE_PICTURE, (route) => route.abort());
    await page.goto("/");
    const visualizeRow = row(page, "Visualize");
    await expect(pictures(visualizeRow).first()).toBeVisible();

    await choose(page, "Problem", "Clique");

    const failed = failedNote(visualizeRow);
    await expect(failed).toContainText(UNREACHABLE);
    await expect(pictures(visualizeRow)).toHaveCount(0);
  });

  test("the message clears when the problem changes, and the new picture draws as usual", async ({
    page,
    expectedFailures,
  }) => {
    expectedFailures.push({
      url: "visualize?visualization=CliqueDefaultVisualization",
      status: 422,
      log: "CliqueDefaultVisualization VISUALIZE REQUEST FAILED",
    });
    await page.route(CLIQUE_PICTURE, rejectWith(422, REJECTED));
    await page.goto("/");
    const visualizeRow = row(page, "Visualize");
    await expect(pictures(visualizeRow).first()).toBeVisible();

    await choose(page, "Problem", "Clique");
    await expect(failedNote(visualizeRow)).toContainText(REJECTED.message);

    await choose(page, "Problem", "3SAT");
    await expect(pictures(visualizeRow).first()).toBeVisible();
    await expect(failedNote(visualizeRow)).toHaveCount(0);
  });
});

// The backend's answer when every compute slot is taken (Redux Interfaces/ComputeJobs.cs), with a
// 1-second Retry-After (the shortest wait the app takes) so these tests stay quick.
const BUSY = {
  error: "server_busy",
  message: "The server is busy with other jobs right now, so this one wasn't started.",
  detail: "At most 4 compute jobs can run at once, and all of them are in use.",
  maxConcurrentJobs: 4,
  retryAfterSeconds: 1,
  hint: "Wait about 1 seconds and try again.",
};
const BUSY_MESSAGE = "The Redux server is busy with other requests.";

// Answers the first `times` requests as busy, then lets the rest through to the backend; returns
// a function counting the requests seen.
async function busyFor(page, pattern, times) {
  let seen = 0;
  await page.route(pattern, (route) => {
    seen += 1;
    if (seen > times) return route.fallback();
    return route.fulfill({
      status: 429,
      headers: { "Retry-After": "1" },
      contentType: "application/json",
      body: JSON.stringify(BUSY),
    });
  });
  return () => seen;
}

test.describe("Busy server (HTTP 429)", () => {
  test("a solve turned away twice is asked again and shows its solution", async ({ page }) => {
    const { solveButton, body } = await openSolveRow(page);

    const seen = await busyFor(page, SOLVE, 2);
    await solveButton.click();

    await expect(body).toContainText(/Solution:\s*\(x\d+:(True|False)/);
    await expect(body.getByRole("alert")).toHaveCount(0);
    expect(seen()).toBeGreaterThanOrEqual(3);
  });

  test("a solve the server stays too busy for says the server is busy", async ({
    page,
    expectedFailures,
  }) => {
    expectedFailures.push({ url: "ProblemProvider/solve", status: 429, log: "SOLVED INSTANCE" });
    const { solveButton, body } = await openSolveRow(page);

    // The first answer plus 3 retries, about a second apart.
    const seen = await busyFor(page, SOLVE, Number.POSITIVE_INFINITY);
    await solveButton.click();

    const alert = body.getByRole("alert");
    await expect(alert).toContainText(BUSY_MESSAGE, { timeout: 15_000 });
    await expect(alert).toContainText(`Try: ${BUSY.hint}`);
    expect(seen()).toBeGreaterThanOrEqual(4);
  });

  test("a picture turned away once is asked again and draws", async ({ page }) => {
    const seen = await busyFor(page, CLIQUE_PICTURE, 1);
    await page.goto("/");
    const visualizeRow = row(page, "Visualize");
    await expect(pictures(visualizeRow).first()).toBeVisible();

    await choose(page, "Problem", "Clique");

    await expect(pictures(visualizeRow).first()).toBeVisible();
    await expect(failedNote(visualizeRow)).toHaveCount(0);
    expect(seen()).toBeGreaterThanOrEqual(2);
  });
});
