/**
 * The Reduce pane's target list (#46, #19): only problems the selected problem really reduces to,
 * as the backend's reduction graph says, not the whole catalogue.
 */
import { expect, test } from "./fixtures";

const row = (page, title) =>
  page.locator(".accordion").filter({ has: page.getByText(title, { exact: true }) });

async function displayNames(request, keys) {
  const info = await (await request.get("/api/redux/Navigation/Batch/allInfo")).json();
  return keys.map((key) => info[key]?.problemName || key).sort();
}

async function targetsFor(request, problem) {
  const response = await request.get(
    `/api/redux/Navigation/NPC_NavGraph/availableReductions/?chosenProblem=${problem}`,
  );
  return response.json();
}

async function choose(page, rowTitle, name) {
  const input = row(page, rowTitle).getByRole("combobox").first();
  await input.click();
  await input.fill(name);
  await page.getByRole("listbox").getByText(name, { exact: true }).first().click();
  await expect(input).toHaveValue(name);
}

/** The labels in the Reduce pane's target list, read from the open dropdown. */
async function listedTargets(page) {
  const input = row(page, "Reduce").getByRole("combobox").first();
  await input.click();
  await input.fill("");
  const options = page.getByRole("listbox").getByRole("option");
  await expect(options.first()).toBeVisible();
  const labels = (await options.allTextContents()).map((text) => text.trim()).sort();
  await page.keyboard.press("Escape");
  return labels;
}

test("3SAT's target list is exactly the problems it reduces to", async ({ page, request }) => {
  const expected = await displayNames(request, await targetsFor(request, "SAT3"));
  expect(expected.length).toBeGreaterThan(0);

  await page.goto("/");
  await expect(row(page, "Reduce").getByRole("combobox").first()).toHaveValue("Clique");
  expect(await listedTargets(page)).toEqual(expected);
});

test("a problem that reduces to nothing offers no targets, so a P problem gets no NP-complete ones", async ({
  page,
  request,
}) => {
  // Deutsch's problem (in P) is #46's example: 3SAT must not be offered as its target.
  expect(await targetsFor(request, "DEUTSCH")).toEqual([]);
  const [deutsch] = await displayNames(request, ["DEUTSCH"]);

  await page.goto("/");
  await expect(row(page, "Problem").getByRole("combobox")).toHaveValue("3SAT");
  await choose(page, "Problem", deutsch);

  const target = row(page, "Reduce").getByRole("combobox").first();
  await expect(target).toBeDisabled();
  await expect(target).toHaveValue("No reductions from this problem yet.");
});
