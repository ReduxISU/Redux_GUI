/**
 * /browse filters. Solver Type and Solver Complexity describe the SAME solver, so when both are
 * checked a problem must have at least one single solver satisfying both (solverFiltersMatch in
 * components/hooks/ProblemFilters/useProblemFilters.js) -- not one solver for each facet.
 *
 * The expectations come from the real catalogue (Navigation/Batch/allSolvers + allInfo): no
 * solver is both Brute Force and Polynomial, but Bin Packing and Graph Coloring each have a
 * Brute Force solver (Exponential) AND a different, Polynomial solver (Approximation / Greedy).
 * Evaluating the facets independently wrongly returns those problems; the correct answer is none.
 * Graph Coloring's Brute Force solver is Exponential, so it is the positive control.
 */
import { expect, test } from "./fixtures";

const checkbox = (page, name) =>
  page.getByRole("checkbox", { name: new RegExp(String.raw`^${name} \(\d+\)$`) });
// Result cards render the display name; scope to the results column's cards by text.
const card = (page, name) => page.getByText(name, { exact: true });

test("combined Solver Type + Solver Complexity needs one solver to satisfy both", async ({
  page,
}) => {
  await page.goto("/browse");
  await checkbox(page, "Brute Force").check();
  await checkbox(page, "Polynomial").check();

  await expect(page.getByText(/^0 problems/)).toBeVisible();
  await expect(card(page, "Graph Coloring")).toHaveCount(0);
  await expect(card(page, "Bin Packing")).toHaveCount(0);
  await expect(card(page, "Clique")).toHaveCount(0);

  // Positive control: swap Polynomial for Exponential, which Graph Coloring's Brute Force solver is.
  await checkbox(page, "Polynomial").uncheck();
  await checkbox(page, "Exponential").check();
  await expect(card(page, "Graph Coloring").first()).toBeVisible();
});
