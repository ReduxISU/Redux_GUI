import { expect, test } from "./fixtures";

const row = (page, title) =>
  page.locator(".accordion").filter({ has: page.getByText(title, { exact: true }) });
const visualization = (page) => row(page, "Visualize");
const weights = (page) => visualization(page).locator(".node-weight-label");
const selectedNodes = (page) => visualization(page).locator('circle[fill="#00e676"]');
const selectedEdges = (page) => visualization(page).locator('line[style*="rgb(0, 230, 118)"]');

async function loadWeightedClique(page) {
  await page.goto("/?problem=WEIGHTEDMAXCLIQUE");
  await expect(visualization(page).getByRole("combobox")).toHaveValue(
    "Weighted Maximum Clique Visualization",
  );
  await expect(weights(page)).toHaveCount(4);
}

async function chooseSolver(page, name) {
  const solve = row(page, "Solve");
  await expect(
    solve.getByRole("button", { name: "Solve", exact: true, includeHidden: true }),
  ).toBeEnabled();
  await solve.getByRole("button", { name: "▼" }).click();
  const input = solve.getByRole("combobox");
  await input.click();
  await input.fill(name);
  await page.getByRole("listbox").getByText(name, { exact: true }).click();
  await expect(input).toHaveValue(name);
}

async function setInstance(page, input) {
  await row(page, "Problem").locator("textarea").first().fill(input);
  await expect(visualization(page).getByLabel("Highlight solution")).not.toBeChecked();
}

test("initial weighted graph keeps names and secondary labels attached to equal-size nodes", async ({
  page,
}) => {
  await loadWeightedClique(page);
  await expect(weights(page)).toHaveText(["w=4", "w=3", "w=5", "w=7"]);
  const picture = visualization(page);
  for (const name of ["a", "b", "c", "d"])
    await expect(
      picture
        .locator("text:not(.node-weight-label):not(.link-label)")
        .filter({ hasText: new RegExp(`^${name}$`) }),
    ).toHaveCount(1);
  await expect(selectedNodes(page)).toHaveCount(0);
  expect(
    await picture
      .locator("circle")
      .evaluateAll((nodes) => nodes.every((n) => n.getAttribute("r") === "20")),
  ).toBe(true);
  await expect
    .poll(() =>
      weights(page).evaluateAll((labels) =>
        labels.every((label) => {
          const circle = [...label.parentNode.querySelectorAll("circle")].find(
            (node) => node.__data__.name === label.__data__.name,
          );
          return (
            Math.abs(Number(label.getAttribute("x")) - Number(circle.getAttribute("cx"))) < 0.01 &&
            Math.abs(Number(label.getAttribute("y")) - Number(circle.getAttribute("cy")) + 27) <
              0.01 &&
            getComputedStyle(label).pointerEvents === "none"
          );
        }),
      ),
    )
    .toBe(true);
});

for (const [key, name] of [
  ["WeightedMaxCliqueBruteForceSolver", "Weighted Maximum Clique Exact Brute Force"],
  ["WeightedMaxCliqueBranchAndBoundSolver", "Weighted Maximum Clique Exact Branch and Bound"],
  [
    "WeightedMaxCliqueGreedyLocalSearchSolver",
    "Weighted Maximum Clique Greedy Multi-Start Local Search Heuristic",
  ],
]) {
  test(`selected solver ${key} supplies the solved weighted picture`, async ({ page }) => {
    await loadWeightedClique(page);
    const requested = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname.endsWith("/ProblemProvider/visualize") &&
        url.searchParams.get("solver") === key
      );
    });
    // The default solver has already been requested; changing to either other solver must fetch again.
    if (key === "WeightedMaxCliqueBruteForceSolver") {
      await chooseSolver(page, "Weighted Maximum Clique Exact Branch and Bound");
      const input = row(page, "Solve").getByRole("combobox");
      await input.click();
      await input.fill(name);
      await page.getByRole("listbox").getByText(name, { exact: true }).click();
    } else await chooseSolver(page, name);
    expect((await requested).ok()).toBe(true);
    await expect(weights(page)).toHaveCount(4);
    await visualization(page).getByLabel("Highlight solution").check();
    await expect(selectedNodes(page)).toHaveCount(3);
    expect(
      await selectedNodes(page).evaluateAll((nodes) => nodes.map((n) => n.__data__.name).sort()),
    ).toEqual(["a", "b", "c"]);
    await expect(selectedEdges(page)).toHaveCount(3);
    await expect(weights(page)).toHaveText(["w=4", "w=3", "w=5", "w=7"]);
    await visualization(page).getByLabel("Highlight solution").uncheck();
    await expect(selectedNodes(page)).toHaveCount(0);
    await expect(weights(page)).toHaveCount(4);
  });
}

test("heuristic suboptimal result is drawn instead of the default exact solution", async ({
  page,
}) => {
  await loadWeightedClique(page);
  await setInstance(
    page,
    "(({a,b,c,d,e,f},{{a,d},{b,e},{c,f},{d,e},{d,f},{e,f}}),((a,10),(b,10),(c,10),(d,6),(e,6),(f,6)))",
  );
  await expect(weights(page)).toHaveCount(6);
  await visualization(page).getByLabel("Highlight solution").check();
  await expect(selectedNodes(page)).toHaveCount(3); // Exact optimum: {d,e,f}, weight 18.
  await chooseSolver(page, "Weighted Maximum Clique Greedy Multi-Start Local Search Heuristic");
  await expect(visualization(page).getByLabel("Highlight solution")).not.toBeChecked();
  await expect(weights(page)).toHaveCount(6);
  await visualization(page).getByLabel("Highlight solution").check();
  await expect(selectedNodes(page)).toHaveCount(2); // Feasible heuristic: {a,d}, weight 16.
  expect(
    await selectedNodes(page).evaluateAll((nodes) => nodes.map((n) => n.__data__.name).sort()),
  ).toEqual(["a", "d"]);
  await expect(selectedEdges(page)).toHaveCount(1);
  const input = row(page, "Solve").getByRole("combobox");
  await input.click();
  await input.fill("Weighted Maximum Clique Exact Branch and Bound");
  await page
    .getByRole("listbox")
    .getByText("Weighted Maximum Clique Exact Branch and Bound", { exact: true })
    .click();
  await expect(visualization(page).getByLabel("Highlight solution")).not.toBeChecked();
  await expect(weights(page)).toHaveCount(6);
  await visualization(page).getByLabel("Highlight solution").check();
  await expect(selectedNodes(page)).toHaveCount(3);
  await expect(selectedEdges(page)).toHaveCount(3);
});

test("feasible suboptimal picture redraw preserves weights and selects b,d", async ({
  page,
  request,
}) => {
  // The endpoint runs a solver rather than accepting arbitrary certificates. Use its real
  // initial payload and a fixture for this known feasible suboptimal certificate. Backend
  // tests independently cover construction of the same solved payload from ({b,d},10).
  const input = "(({a,b,c,d},{{a,b},{a,c},{b,c},{b,d}}),((a,4),(b,3),(c,5),(d,7)))";
  const response = await request.post(
    "/api/redux/ProblemProvider/visualize?visualization=WeightedMaxCliqueVisualization",
    { data: JSON.stringify(input), headers: { "Content-Type": "application/json" } },
  );
  expect(response.ok()).toBe(true);
  const [initial] = await response.json();
  const selected = new Set(["b", "d"]);
  const solved = {
    ...initial,
    nodes: initial.nodes.map((node) => ({
      ...node,
      color: selected.has(node.name) ? "Solution" : "Background",
    })),
    links: initial.links.map((edge) => ({
      ...edge,
      color: selected.has(edge.source) && selected.has(edge.target) ? "Solution" : "Background",
    })),
  };
  await page.route(
    /ProblemProvider\/visualize\?visualization=WeightedMaxCliqueVisualization/,
    (route) => route.fulfill({ json: [initial, solved] }),
  );
  await loadWeightedClique(page);
  await visualization(page).getByLabel("Highlight solution").check();
  await expect(selectedNodes(page)).toHaveCount(2);
  expect(
    await selectedNodes(page).evaluateAll((nodes) => nodes.map((n) => n.__data__.name).sort()),
  ).toEqual(["b", "d"]);
  await expect(selectedEdges(page)).toHaveCount(1);
  await expect(weights(page)).toHaveText(["w=4", "w=3", "w=5", "w=7"]);
  const verified = await request.post(
    "/api/redux/ProblemProvider/verify?verifier=weightedmaxcliquesolutionverifier",
    {
      data: {
        ProblemInstance: "(({a,b,c,d},{{a,b},{a,c},{b,c},{b,d}}),((a,4),(b,3),(c,5),(d,7)))",
        Certificate: "({b,d},10)",
      },
    },
  );
  expect(verified.ok()).toBe(true);
  expect(await verified.json()).toBe("True");
});

test("zero and maximum Int64 labels survive initial-to-solved redraws", async ({ page }) => {
  await loadWeightedClique(page);
  await setInstance(page, "(({zero,heavy},{}),((zero,0),(heavy,9223372036854775807)))");
  await expect(weights(page)).toHaveText(["w=0", "w=9223372036854775807"]);
  await visualization(page).getByLabel("Highlight solution").check();
  await expect(selectedNodes(page)).toHaveCount(1);
  await expect(weights(page)).toHaveText(["w=0", "w=9223372036854775807"]);
  expect(
    await visualization(page)
      .locator("circle")
      .evaluateAll((nodes) => nodes.every((n) => n.getAttribute("r") === "20")),
  ).toBe(true);
});

test("empty and all-zero graphs show no false solution selection", async ({ page }) => {
  await loadWeightedClique(page);
  await setInstance(page, "(({a,b},{{a,b}}),((a,0),(b,0)))");
  await expect(weights(page)).toHaveText(["w=0", "w=0"]);
  await visualization(page).getByLabel("Highlight solution").check();
  await expect(selectedNodes(page)).toHaveCount(0);
  await setInstance(page, "(({},{}),())");
  await expect(visualization(page).locator("circle")).toHaveCount(0);
  await expect(weights(page)).toHaveCount(0);
  await expect(visualization(page)).not.toContainText(/Failed to Visualize|failed to render/);
});

test("ordinary Clique keeps node names, highlights, and no vertex-weight labels", async ({
  page,
}) => {
  await page.goto("/?problem=CLIQUE");
  await expect(visualization(page).locator("circle")).toHaveCount(6);
  await expect(weights(page)).toHaveCount(0);
  await visualization(page).getByLabel("Highlight solution").check();
  await expect(selectedNodes(page)).toHaveCount(4);
  await expect(weights(page)).toHaveCount(0);
});

test("optional labels ignore missing, null, and empty weights while preserving edge labels", async ({
  page,
}) => {
  // Exercise renderer compatibility for payload fields that the weighted-clique backend
  // intentionally never emits: missing/null/empty weights and independently weighted edges.
  const graph = {
    kind: "graph",
    nodes: [
      { name: "a", id: "a", color: "Solution", weight: "0" },
      { name: "b", id: "b", color: "Background" },
      { name: "c", id: "c", color: "Background", weight: null },
      { name: "d", id: "d", color: "Background", weight: "" },
    ],
    links: [{ source: "a", target: "b", weight: "7", weighted: true, color: "Solution" }],
  };
  await page.route(
    /ProblemProvider\/visualize\?visualization=WeightedMaxCliqueVisualization/,
    (route) => route.fulfill({ json: [graph, graph] }),
  );
  await page.goto("/?problem=WEIGHTEDMAXCLIQUE");
  await expect(weights(page)).toHaveText(["w=0"]);
  await expect(visualization(page).locator(".link-label")).toHaveText(["7"]);
  await expect(selectedNodes(page)).toHaveCount(1);
});

for (const theme of ["light", "dark"]) {
  test(`vertex weights use the ${theme} theme text color`, async ({ page }) => {
    await page.addInitScript((mode) => localStorage.setItem("theme", mode), theme);
    await loadWeightedClique(page);
    await expect(weights(page).first()).toHaveAttribute(
      "fill",
      theme === "dark" ? "#F9FAFB" : "#111827",
    );
    await visualization(page).getByLabel("Highlight solution").check();
    await expect(weights(page).first()).toHaveAttribute(
      "fill",
      theme === "dark" ? "#F9FAFB" : "#111827",
    );
  });
}
