/**
 * EXEMPLARS: how to drive the UI, how to assert a visualization, how to test an interactive flow.
 *
 * These three tests exist to be copied. Each demonstrates a different technique, and between them
 * they cover what you need for almost any test you would want to add. See TESTING.md for the
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

  await expect(visualizeRow.getByRole("combobox")).toHaveValue("3SAT visualization");

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

  // Solve and Verify start collapsed (components/widgets/ProblemSection.js). Their bodies are in
  // the DOM but hidden, so expand before asserting on anything inside.
  await solveRow.getByRole("button", { name: "▼" }).click();

  const body = solveRow.locator(".card-body");
  await expect(body).toBeVisible();
  await expect(body).toContainText("Solution:");

  // The button stays disabled until a solver is chosen, so waiting for it to enable is also how
  // we know the solver list arrived from the backend.
  const solveButton = solveRow.getByRole("button", { name: "Solve", exact: true });
  await expect(solveButton).toBeEnabled();
  await solveButton.click();

  // The 3SAT Backtracking Solver answers with a variable assignment, e.g.
  // "(x1:True,x2:False,x3:False)". Asserting on the rendered result rather than on the HTTP call
  // matters here: the guard in ./fixtures allows a known boot-time 400 on this same endpoint, so
  // this assertion is what proves the click actually produced an answer.
  await expect(body).toContainText(/Solution:\s*\(x\d+:(True|False)/);
});
