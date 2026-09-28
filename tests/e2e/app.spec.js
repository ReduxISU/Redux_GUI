/**
 * EXEMPLARS: how to drive the UI, how to assert a visualization, how to test an interactive flow.
 *
 * These tests exist to be copied. Each demonstrates a different technique, and between them they
 * cover what you need for almost any test you would want to add. See TESTING.md for the
 * backlog of wanted tests and for the traps this app sets.
 *
 * Note the import: `test` comes from ./fixtures, not "@playwright/test", so every test here gets
 * the silent-failure guard. Use it — this app hides failed requests rather than showing an error.
 */
import { expect, test } from "./fixtures";

/**
 * Locate one of the five rows by its header title ("Problem", "Reduce", "Visualize", "Solve",
 * "Verify"), then scope everything else inside it.
 *
 * DO NOT use getByLabel for the dropdowns. Every one of the six SearchBarExtensible instances
 * renders id="search-bar" (components/widgets/SearchBarExtensible.js), so all six <label for=
 * "search-bar"> elements point at whichever input the browser saw first — every getByLabel call
 * on this page silently resolves to the Problem row's input. (That duplicate id is a real
 * accessibility bug, not just a testing nuisance: screen readers announce every dropdown as
 * "Select problem".)
 */
const row = (page, title) =>
  page.locator(".accordion").filter({ has: page.getByText(title, { exact: true }) });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("the problem catalogue loads from the backend", async ({ page }) => {
  // Display names come from the API, not from the code: the problem keyed "SAT3" is shown as
  // "3SAT" and "CLIQUE" as "Clique" (the `problemName` field in Navigation/Batch/allInfo).
  const problemInput = row(page, "Problem").getByRole("combobox");
  await expect(problemInput).toHaveValue("3SAT");

  // Opening the dropdown proves the whole catalogue arrived, not just the default. With a broken
  // proxy or backend this list would simply be empty and the page would still look fine — that
  // is the failure this test exists to catch.
  await problemInput.click();
  await expect(page.getByRole("option", { name: "Clique", exact: true })).toBeVisible();
});

test("the default problem renders a visualization", async ({ page }) => {
  const visualizeRow = row(page, "Visualize");

  await expect(visualizeRow.getByRole("combobox")).toHaveValue("3SAT Visualization");

  // 3SAT's default visualization declares type "Boolean Satisfiability", which resolves through
  // the registry in components/Visualization/svgs/Visualizations.js to a d3 renderer that draws
  // into an <svg>. Exclude MuiSvgIcon-root or this matches the toolbar icons above the canvas
  // and passes without anything having been drawn.
  await expect(visualizeRow.locator("svg:not(.MuiSvgIcon-root)").first()).toBeVisible();

  // The two ways a visualization can fail to draw (no renderer registered for the declared type,
  // and a renderer that threw). Both render a card of text where the picture should be, so
  // without this the assertion above could pass on an error message.
  await expect(visualizeRow).not.toContainText(/can.t render|failed to render/);
});

test("solving 3SAT returns a satisfying assignment", async ({ page }) => {
  const solveRow = row(page, "Solve");

  // The button stays disabled until a solver is chosen, so waiting for it to enable is also how
  // we know the solver list arrived from the backend. Wait for it BEFORE expanding the row: the
  // ▼ button is painted before React hydrates, and a click that lands in that window is silently
  // lost. An enabled Solve button proves the page is hydrated and has data. includeHidden is what
  // lets the locator find it while the row is still collapsed; getByRole skips hidden elements
  // by default.
  const solveButton = solveRow.getByRole("button", {
    name: "Solve",
    exact: true,
    includeHidden: true,
  });
  await expect(solveButton).toBeEnabled();

  // Solve and Verify start collapsed (components/widgets/ProblemSection.js). Their bodies are in
  // the DOM but hidden, so expand before asserting on anything inside.
  await solveRow.getByRole("button", { name: "▼" }).click();

  const body = solveRow.locator(".card-body");
  await expect(body).toBeVisible();
  await expect(body).toContainText("Solution:");

  await solveButton.click();

  // The 3SAT Backtracking Solver answers with a variable assignment, e.g.
  // "(x1:True,x2:False,x3:False)". Asserting on the rendered result rather than on the HTTP call
  // matters here: the guard in ./fixtures allows a known boot-time 400 on this same endpoint, so
  // this assertion is what proves the click actually produced an answer.
  await expect(body).toContainText(/Solution:\s*\(x\d+:(True|False)/);
});

test("reducing 3SAT to Clique renders the reduced instance", async ({ page }) => {
  const reduceRow = row(page, "Reduce");

  // The Reducer hook picks CLIQUE and Sipser's reduction for 3SAT on boot
  // (components/hooks/ProblemProvider/Reducer.js), so both dropdowns should already be filled.
  // The Reduce button only enables once a reduction type is chosen, so waiting on it is also how
  // we know the reduction options arrived from the backend.
  const reduceButton = reduceRow.getByRole("button", { name: "Reduce", exact: true });
  await expect(reduceButton).toBeEnabled();
  await reduceButton.click();

  // The reduced CLIQUE instance is parsed and shown as a node/edge listing. Assert on the rendered
  // listing, not the HTTP call: the guard allows a boot-time 400 on this same endpoint, so the
  // rendered output is what proves the click produced a reduction.
  const body = reduceRow.locator(".card-body");
  await expect(body).toContainText("Reduced Clique Instance:");
  await expect(body).toContainText("Nodes:");
  await expect(body).toContainText("Edges:");
});

test("the 3SAT verifier answers True and False correctly", async ({ page }) => {
  const verifyRow = row(page, "Verify");

  // Same order as the Solve test: wait for the action button to enable (hydrated, data arrived)
  // before clicking ▼, or the expand click can be lost.
  const verifyButton = verifyRow.getByRole("button", {
    name: "Verify",
    exact: true,
    includeHidden: true,
  });
  await expect(verifyButton).toBeEnabled();

  // Verify starts collapsed, like Solve.
  await verifyRow.getByRole("button", { name: "▼" }).click();
  const body = verifyRow.locator(".card-body");
  await expect(body).toBeVisible();

  // The 3SAT verifier ships no default certificate (its info has certificate: ""), so type one.
  // Fill only after the verifier is chosen: choosing it resets the certificate box.
  // Both assignments are for the default instance (x1 | !x2 | x3) & (!x1 | x3 | x1) & (x2 | !x3 | !x1).
  const certificate = body.getByRole("textbox");
  await certificate.fill("(x1:True,x2:True,x3:False)");
  await verifyButton.click();
  await expect(body).toContainText("Verifier output: True");

  // Checking both answers proves the verifier read the certificate, not just that it answered.
  await certificate.fill("(x1:False,x2:True,x3:False)");
  await verifyButton.click();
  await expect(body).toContainText("Verifier output: False");
});
