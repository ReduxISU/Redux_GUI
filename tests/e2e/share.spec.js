/**
 * Link sharing (#281, short links ReduxISU/Redux#844): Share makes a link to the current view,
 * opening that link or pasting it into Import restores the view, and restoring never runs
 * anything by itself.
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

// Browsers only offer navigator.clipboard on secure pages (https or localhost). CI serves the GUI
// from another container over plain http, so these tests put in a stand-in clipboard instead:
// one that keeps what is written, or one that refuses, to reach Share's manual-copy dialog.
async function fakeClipboard(page, { refuse = false } = {}) {
  await page.addInitScript((refuse) => {
    let text = "";
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value) => {
          if (refuse) throw new DOMException("Write permission denied.", "NotAllowedError");
          text = value;
        },
        readText: async () => text,
      },
    });
  }, refuse);
}

test("Share copies a link that opens the same view", async ({ page }) => {
  await fakeClipboard(page);
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

test("Share shows the link to copy by hand when the browser won't copy it", async ({ page }) => {
  await fakeClipboard(page, { refuse: true });
  await page.goto(`/${sharedQuery()}`);
  await expectRestored(page);

  await page.getByRole("button", { name: "Share a link to this view" }).click();
  const dialog = page.getByRole("dialog", { name: "Copy this link" });
  await expect(dialog).toBeVisible();
  await expect(page.getByText("Link copied.")).toHaveCount(0);

  const params = new URL(await dialog.getByLabel("Share link").inputValue()).searchParams;
  for (const [key, value] of Object.entries(SHARED)) expect(params.get(key)).toBe(value);
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

// Short links (ReduxISU/Redux#844): a view too big for a plain link is saved by the API and
// shared as ?share={id}. These stand in for the API's ShareLinks endpoints with page.route, so
// they need no database on the server.
const SHORT_ID = "abc123XYZ0";
const HUGE = `(${"x1|x2|x3)&(".repeat(1000)}x1|x2|x3)`;

/** Answers every ShareLinks request with `answer(request)`'s { status, body }, and keeps them. */
async function fakeShareLinks(page, answer) {
  const requests = [];
  await page.route("**/ShareLinks**", async (route) => {
    const request = route.request();
    requests.push({ method: request.method(), url: request.url(), body: request.postData() });
    const { status, body } = answer(request);
    await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
  });
  return requests;
}

/** Puts a view too big for a plain link into the page (importing never runs it). */
async function importHugeView(page) {
  await page.goto("/");
  await expect(row(page, "Problem").getByRole("combobox")).toHaveValue("3SAT");
  await page.getByRole("button", { name: "Import a shared link" }).click();
  await page
    .getByRole("textbox", { name: "Shared link" })
    .fill(`?${new URLSearchParams({ problem: "SAT3", instance: HUGE }).toString()}`);
  await page.getByRole("button", { name: "Import", exact: true }).click();
  await expect(row(page, "Problem").locator("textarea").first()).toHaveValue(HUGE);
}

test("Share saves a view too big for a plain link and copies a short link", async ({ page }) => {
  await fakeClipboard(page);
  const requests = await fakeShareLinks(page, () => ({
    status: 201,
    body: { id: SHORT_ID, createdAt: "2026-11-25T00:00:00Z", expiresAt: "2027-05-25T00:00:00Z" },
  }));
  await importHugeView(page);

  await page.getByRole("button", { name: "Share a link to this view" }).click();
  await expect(page.getByText("Saved link copied.")).toBeVisible();
  await expect(page.getByText("about 6 months")).toBeVisible();

  const link = new URL(await page.evaluate(() => navigator.clipboard.readText()));
  expect(link.pathname).toBe("/");
  expect([...link.searchParams.entries()]).toEqual([["share", SHORT_ID]]);

  expect(requests).toHaveLength(1);
  expect(requests[0].method).toBe("POST");
  const { view } = JSON.parse(requests[0].body);
  expect(view.problem).toBe("SAT3");
  expect(view.instance).toBe(HUGE);
});

test("Share says why when the server can't save a too-big view", async ({
  page,
  expectedFailures,
}) => {
  expectedFailures.push({ url: "ShareLinks", status: 503, log: "SHARE LINK REQUEST FAILED" });
  await fakeShareLinks(page, () => ({
    status: 503,
    body: {
      error: "short_links_unavailable",
      message: "Short links are not available on this server.",
    },
  }));
  await importHugeView(page);

  await page.getByRole("button", { name: "Share a link to this view" }).click();
  const dialog = page.getByRole("dialog", { name: "Too big to share as a link" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("too big to fit in a link");
  await expect(dialog).toContainText("can't save links right now");
  await expect(dialog).toContainText("Try a smaller instance");
});

test("opening a short link restores the saved view and runs nothing until the user clicks", async ({
  page,
}) => {
  const requests = await fakeShareLinks(page, () => ({
    status: 200,
    body: { id: SHORT_ID, view: SHARED, createdAt: "x", expiresAt: "y" },
  }));
  const compute = watchCompute(page);
  await page.goto(`/?share=${SHORT_ID}`);

  await expectRestored(page);
  await expect(page.getByTestId("shared-view-notice")).toContainText("Nothing has been run yet");
  expect(requests.map((request) => new URL(request.url).pathname)).toEqual([
    `/api/redux/ShareLinks/${SHORT_ID}`,
  ]);
  // The used link is taken off the address, like a plain link's ?problem=.
  await expect.poll(() => new URL(page.url()).search).toBe("");

  await page.waitForTimeout(3000);
  expect(compute, "restoring a short link must not run anything").toEqual([]);
});

test("opening a short link that doesn't exist says so and opens the page as usual", async ({
  page,
  expectedFailures,
}) => {
  expectedFailures.push({ url: "ShareLinks", status: 404, log: "SHARE LINK REQUEST FAILED" });
  await fakeShareLinks(page, () => ({
    status: 404,
    body: { error: "share_not_found", message: "No such share link." },
  }));
  await page.goto(`/?share=${SHORT_ID}`);

  await expect(page.getByTestId("shared-view-notice")).toContainText(
    "This share link doesn't exist or has expired (links last about 6 months).",
  );
  // The hold is released: the default view is there and can run as usual.
  await expect(row(page, "Problem").getByRole("combobox")).toHaveValue("3SAT");
  await expect(page.getByTestId("share-held-pictures")).toHaveCount(0);
});

test("Import restores a pasted short link", async ({ page }) => {
  await fakeShareLinks(page, () => ({
    status: 200,
    body: { id: SHORT_ID, view: SHARED, createdAt: "x", expiresAt: "y" },
  }));
  await page.goto("/");
  await expect(row(page, "Problem").getByRole("combobox")).toHaveValue("3SAT");

  await page.getByRole("button", { name: "Import a shared link" }).click();
  await page
    .getByRole("textbox", { name: "Shared link" })
    .fill(`https://elsewhere.example/?share=${SHORT_ID}`);
  await page.getByRole("button", { name: "Import", exact: true }).click();

  await expectRestored(page);
});
