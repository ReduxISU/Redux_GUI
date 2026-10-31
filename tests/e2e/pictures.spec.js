/**
 * The format=frames rendering foundation (#352, part 1).
 *
 * The Visualize row asks the API for `format=frames` with the Solve row's chosen solver. A
 * response whose `type` is a legacy visualization type is the old picture wrapped, and is drawn
 * from that one answer; a new picture type with no renderer yet makes the row ask for the old flat
 * list and draw that instead. Nothing visible changes until a renderer is registered in
 * components/Visualization/pictures/registry.js.
 */
import { expect, test } from "./fixtures";

const VISUALIZE_REQUEST = /\/api\/redux\/ProblemProvider\/visualize\?/;

const row = (page, title) =>
  page.locator(".accordion").filter({ has: page.getByText(title, { exact: true }) });

/** Records every visualize request as `${visualization} ${format}`, in order. */
function recordVisualizeRequests(page) {
  const asked = [];
  page.on("request", (request) => {
    if (!VISUALIZE_REQUEST.test(request.url())) return;
    const url = new URL(request.url());
    asked.push({
      visualization: url.searchParams.get("visualization"),
      format: url.searchParams.get("format") ?? "list",
      solver: url.searchParams.get("solver"),
    });
  });
  return asked;
}

const drawnSvg = (visualizeRow) => visualizeRow.locator("svg:not(.MuiSvgIcon-root)").first();

test("the default picture is asked for as frames, with the chosen solver, and drawn from one answer", async ({
  page,
}) => {
  const asked = recordVisualizeRequests(page);
  await page.goto("/");

  const visualizeRow = row(page, "Visualize");
  await expect(visualizeRow.getByRole("combobox")).toHaveValue("3SAT Visualization");
  await expect(drawnSvg(visualizeRow)).toBeVisible();
  await expect(visualizeRow).not.toContainText(/can.t render|failed to render/);

  // Only the frames request once the solver is known; the legacy type's wrapped answer is drawn
  // directly, so no list request follows it.
  await expect.poll(() => asked.filter((r) => r.solver).length).toBeGreaterThan(0);
  const withSolver = asked.filter((r) => r.solver);
  expect(withSolver.every((r) => r.format === "frames")).toBe(true);
  expect(withSolver.every((r) => r.visualization === "Sat3DefaultVisualization")).toBe(true);
  expect(asked.some((r) => r.format === "list")).toBe(false);
});

test("a new picture type with no renderer yet falls back to the old flat list", async ({
  page,
}) => {
  const asked = recordVisualizeRequests(page);
  // Pretend 3SAT already serves a redesigned picture this site cannot draw.
  await page.route(VISUALIZE_REQUEST, (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get("format") !== "frames") return route.continue();
    return route.fulfill({
      json: { type: "Formula", payload: { kind: "formula" }, frames: [] },
    });
  });
  await page.goto("/");

  const visualizeRow = row(page, "Visualize");
  await expect(drawnSvg(visualizeRow)).toBeVisible();
  await expect(visualizeRow).not.toContainText(/can.t render|failed to render/);

  await expect.poll(() => asked.some((r) => r.format === "list")).toBe(true);
  const first = asked.findIndex((r) => r.format === "frames");
  const firstList = asked.findIndex((r) => r.format === "list");
  expect(first).toBeGreaterThanOrEqual(0);
  expect(firstList).toBeGreaterThan(first);
});

test("Clique, a live Graph picture with no renderer here yet, falls back to the old list", async ({
  page,
}) => {
  const asked = recordVisualizeRequests(page);
  await page.goto("/?problem=CLIQUE");

  const visualizeRow = row(page, "Visualize");
  await expect(row(page, "Problem").getByRole("combobox")).toHaveValue("Clique");
  await expect(drawnSvg(visualizeRow)).toBeVisible();
  await expect(visualizeRow).not.toContainText(/can.t render|failed to render/);

  await expect
    .poll(() => asked.filter((r) => r.visualization === "CliqueDefaultVisualization"))
    .toEqual(expect.arrayContaining([expect.objectContaining({ format: "list" })]));
  const clique = asked.filter((r) => r.visualization === "CliqueDefaultVisualization");
  expect(clique[0].format).toBe("frames");
  expect(clique.some((r) => r.format === "list")).toBe(true);
});
