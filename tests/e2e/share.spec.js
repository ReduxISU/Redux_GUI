/**
 * Link sharing, phase 1 (#281): Share makes a link to the current view, opening that link or
 * pasting it into Import restores the view, and restoring never runs anything by itself.
 *
 * "Runs" means any request that makes the server compute: solve, verify, reduce, visualize (and
 * the reduction picture). Catalogue reads (lists, info) are fine. A shared link can carry any
 * instance, so if opening one started a solve, a link could make every visitor's browser start a
 * long job; the user has to click first.
 */
import { expect, test } from "./fixtures";

const row = (page, title) =>
  page.locator(".accordion").filter({ has: page.getByText(title, { exact: true }) });

const COMPUTE =
  /\/api\/redux\/ProblemProvider\/(solve|verify|reduce|visualize|reductionVisualization|problemInstance)\b/;

/**
 * Collects every compute request the page sends from now on. With `instance`, only those sent
 * for that instance (the server gets the instance in the request body).
 */
function watchCompute(page, instance) {
  const seen = [];
  page.on("request", (request) => {
    if (!COMPUTE.test(request.url())) return;
    if (instance && !(request.postData() ?? "").includes(instance)) return;
    seen.push(request.url());
  });
  return seen;
}

// A Clique view that differs from Clique's defaults in every part the link carries.
const INSTANCE = "(({1,2,3,4},{{1,2},{2,3},{3,4},{4,1},{1,3}}),3)";
const SHARED = {
  problem: "CLIQUE",
  instance: INSTANCE,
  solver: "ChibaNishizeki",
  reduceTo: "SETCOVER",
  reductionType: "sipserReductionVertexCover-KarpVertexCoverToSetCover",
  verifier: "CliqueVerifier",
};
const sharedQuery = () => `?${new URLSearchParams(SHARED).toString()}`;

async function expectRestored(page) {
  await expect(row(page, "Problem").getByRole("combobox")).toHaveValue("Clique");
  await expect(row(page, "Problem").locator("textarea").first()).toHaveValue(INSTANCE);
  await expect(row(page, "Reduce").getByRole("combobox").first()).toHaveValue("Set Cover");
  await expect(row(page, "Solve").getByRole("combobox")).toHaveValue(
    "Chiba-Nishizeki k-Clique Listing Algorithm",
  );
  await expect(row(page, "Verify").getByRole("combobox")).toHaveValue("Clique Solution Verifier");
}

test("opening a shared link restores the view and runs nothing until the user clicks", async ({
  page,
}) => {
  const compute = watchCompute(page);
  await page.goto(`/${sharedQuery()}`);

  await expectRestored(page);
  await expect(page.getByTestId("shared-view-notice")).toContainText("Nothing has been run yet");
  await expect(page.getByTestId("share-held-pictures")).toBeVisible();

  // Give anything that would start on its own time to start.
  await page.waitForTimeout(3000);
  expect(compute, "restoring a shared link must not run anything").toEqual([]);

  // The first click ends the hold: the picture is drawn for the restored view.
  const drawn = page.waitForRequest((request) =>
    /ProblemProvider\/visualize\b/.test(request.url()),
  );
  await page.getByRole("button", { name: "Show pictures" }).click();
  await drawn;
  await expect(page.getByTestId("share-held-pictures")).toHaveCount(0);
});

test("Share copies a link that opens the same view", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(`/${sharedQuery()}`);
  await expectRestored(page);

  await page.getByRole("button", { name: "Share a link to this view" }).click();
  await expect(page.getByText("Link copied.")).toBeVisible();
  const link = await page.evaluate(() => navigator.clipboard.readText());

  const params = new URL(link).searchParams;
  for (const [key, value] of Object.entries(SHARED)) expect(params.get(key)).toBe(value);

  await page.goto(link);
  await expectRestored(page);
});

test("Import restores a pasted link in place, without reloading or running anything", async ({
  page,
}) => {
  await page.goto("/");
  // Wait for the default view to settle (it runs as usual), then watch from here on.
  await expect(row(page, "Problem").getByRole("combobox")).toHaveValue("3SAT");
  await expect(
    row(page, "Reduce").getByRole("button", { name: "Reduce", exact: true }),
  ).toBeEnabled();
  await page.evaluate(() => {
    window.__sameDocument = true;
  });
  // The default view's own reduce, solve and pictures may still be going (or waiting to ask a
  // busy server again), so count only requests for the imported instance.
  const compute = watchCompute(page, INSTANCE);

  await page.getByRole("button", { name: "Import a shared link" }).click();
  await page
    .getByRole("textbox", { name: "Shared link" })
    .fill(`https://elsewhere.example/${sharedQuery()}`);
  await page.getByRole("button", { name: "Import", exact: true }).click();

  await expectRestored(page);
  expect(await page.evaluate(() => window.__sameDocument)).toBe(true);
  await page.waitForTimeout(3000);
  expect(compute, "importing a shared link must not run anything").toEqual([]);
});

test("Import explains a link it can't use", async ({ page }) => {
  await page.goto("/");
  await expect(row(page, "Problem").getByRole("combobox")).toHaveValue("3SAT");
  await page.getByRole("button", { name: "Import a shared link" }).click();
  const field = page.getByRole("textbox", { name: "Shared link" });

  await field.fill("https://redux.example/?solver=PPZ");
  await page.getByRole("button", { name: "Import", exact: true }).click();
  await expect(page.getByText("doesn't say which problem")).toBeVisible();

  await field.fill("https://redux.example/?problem=NOTAPROBLEM&instance=x");
  await page.getByRole("button", { name: "Import", exact: true }).click();
  await expect(page.getByText("names a problem this site doesn't have")).toBeVisible();

  // Nothing changed behind the dialog.
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(row(page, "Problem").getByRole("combobox")).toHaveValue("3SAT");
});

test("Share refuses a view too big for a link and says why", async ({ page }) => {
  await page.goto("/");
  await expect(row(page, "Problem").getByRole("combobox")).toHaveValue("3SAT");

  // Import a huge instance (importing never runs it), then try to share it.
  const huge = `(${"x1|x2|x3)&(".repeat(1000)}x1|x2|x3)`;
  await page.getByRole("button", { name: "Import a shared link" }).click();
  await page
    .getByRole("textbox", { name: "Shared link" })
    .fill(`?${new URLSearchParams({ problem: "SAT3", instance: huge }).toString()}`);
  await page.getByRole("button", { name: "Import", exact: true }).click();
  await expect(row(page, "Problem").locator("textarea").first()).toHaveValue(huge);

  await page.getByRole("button", { name: "Share a link to this view" }).click();
  await expect(page.getByText("Too big to share as a link")).toBeVisible();
  await expect(page.getByText("too big to fit in a link")).toBeVisible();
});
