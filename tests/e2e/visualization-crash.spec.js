/**
 * A renderer that crashes while React draws it must end on the pane's "Failed to Visualize" card,
 * never on Next.js's error screen with the whole page gone, and the next switch must bring the
 * pictures back (issue #388, review of PR #390).
 *
 * The try/catch around the renderer factory in VisualizationLogic only sees errors thrown while the
 * element is built; these tests make the renderer throw later, while React renders it (or runs its
 * effects), by answering the picture request with a payload of the right kind but the wrong shape.
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

// The right-hand pane of the Visualize row when "Show reduction" is on.
const reductionPane = (page) => row(page, "Visualize").locator(".wrap > .MuiContainer-root").nth(1);

async function choose(page, rowTitle, name, nth = 0) {
  const input = row(page, rowTitle).getByRole("combobox").nth(nth);
  await input.click();
  await input.fill(name);
  await page.getByRole("listbox").getByText(name, { exact: true }).first().click();
  await expect(input).toHaveValue(name);
}

// Errors that escaped to the page (an uncaught render error ends here), and Next.js's own error
// screens: the dev overlay and the production "Application error" page.
function watchForCrashes(page) {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(`${error.name}: ${error.message}`));
  return async () => {
    await expect(page.locator("nextjs-portal")).toHaveCount(0);
    await expect(page.getByText(/Application error/)).toHaveCount(0);
    await expect(row(page, "Problem")).toBeVisible();
    expect(pageErrors, "errors escaped to the page").toEqual([]);
  };
}

test("a table picture that crashes while rendering shows Failed to Visualize, and switching brings pictures back", async ({
  page,
}) => {
  // DynamicTableSvgReact calls columns.map(...) while rendering; an object there throws a
  // TypeError during render, after the factory's try/catch has already returned.
  await page.route(/visualize\?visualization=SSSPTableVisualization/, (route) =>
    route.fulfill({
      json: [{ kind: "table", title: null, columns: { vertex: "Vertex" }, rows: [] }],
    }),
  );
  const expectNoCrash = watchForCrashes(page);
  await page.goto("/?problem=SSSP");
  const visualizeRow = row(page, "Visualize");
  await expect(pictures(visualizeRow).first()).toBeVisible();

  await choose(page, "Visualize", "SSSP Table Visualization");

  const failed = failedNote(visualizeRow);
  await expect(failed).toBeVisible();
  await expect(failed).toContainText(
    'visualization (type "DynamicTable", visualization SSSPTableVisualization) failed to render.',
  );
  await expect(failed).toContainText("TypeError");
  await expectNoCrash();

  // Switching the picture tries the renderer again: the graph is drawn, the card is gone.
  await choose(page, "Visualize", "Single Source Shortest Path Visualization");
  await expect(pictures(visualizeRow).first()).toBeVisible();
  await expect(failedNote(visualizeRow)).toHaveCount(0);

  // The broken table crashes again (the card is not just remembered), and switching the problem
  // brings a picture back too.
  await choose(page, "Visualize", "SSSP Table Visualization");
  await expect(failedNote(visualizeRow)).toBeVisible();
  await choose(page, "Problem", "Clique");
  await expect(pictures(visualizeRow).first()).toBeVisible();
  await expect(failedNote(visualizeRow)).toHaveCount(0);
  await expectNoCrash();
});

test("a reduction picture that crashes while drawing shows Failed to Visualize on the reduction side", async ({
  page,
}) => {
  // StandardGraphSvgReact maps over nodes in its drawing effect; a number there throws a
  // TypeError outside any try/catch, which only an error boundary catches.
  await page.route(/visualizeReduction\?reduction=SipserReduceToCliqueStandard/, (route) =>
    route.fulfill({ json: [{ nodes: 5, links: [] }] }),
  );
  const expectNoCrash = watchForCrashes(page);
  await page.goto("/");
  const visualizeRow = row(page, "Visualize");
  await expect(pictures(visualizeRow).first()).toBeVisible();

  const toggle = visualizeRow.getByLabel("Show reduction");
  await expect(toggle).toBeEnabled();
  await toggle.check();

  const failed = failedNote(reductionPane(page));
  await expect(failed).toBeVisible();
  await expect(failed).toContainText("failed to render.");
  await expect(failed).toContainText("TypeError");
  // Only the reduction side failed; the main picture is still drawn.
  await expect(pictures(row(page, "Visualize")).first()).toBeVisible();
  await expect(failedNote(visualizeRow)).toHaveCount(1);
  await expectNoCrash();

  // Switching the reduction target draws the new target's reduction.
  await choose(page, "Reduce", "Graph Coloring");
  await expect(pictures(reductionPane(page)).first()).toBeVisible();
  await expect(failedNote(visualizeRow)).toHaveCount(0);
  await expectNoCrash();
});
