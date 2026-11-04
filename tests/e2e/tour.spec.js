/**
 * The "Getting started" tour finds its targets by data-tour-id. A refactor that renames or drops a
 * panel breaks the tour silently: no build error, no lint error, no console error. This is the
 * tour's only fragile dependency, so it gets the one test that would catch it.
 *
 * Every anchor must be on a freshly loaded page exactly once, with no interaction and no backend
 * data: row anchors live in pages/index.js and the in-body anchors sit in rows that default to
 * expanded. TOUR_SELECTORS is derived from TOUR_STEPS, so this cannot drift from what the tour
 * actually asks for. See INTEGRATION_TEST_REQUIREMENTS.md in the parent directory.
 */
import { TOUR_SELECTORS } from "../../components/tour/steps";
import { expect, test } from "./fixtures";

test("every tour anchor is on the page exactly once", async ({ page }) => {
  await page.goto("/");

  for (const selector of TOUR_SELECTORS) {
    await expect(page.locator(selector), selector).toHaveCount(1);
  }

  // One toggle per accordion row (components/widgets/ProblemSection.js); the tour uses these to
  // expand the collapsed Solve and Verify rows.
  await expect(page.locator("[data-tour-toggle]")).toHaveCount(5);
});

// #394: a visitor who doesn't need the tour can close the Getting started button. It shrinks to
// the small "?" (the same as finishing the tour), stays that way after a reload, and still
// replays the tour.
test("closing Getting started shrinks it to the replay button, and that sticks", async ({
  page,
}) => {
  await page.goto("/");
  const gettingStarted = page.getByRole("button", { name: "Getting started", exact: true });
  const replay = page.getByRole("button", { name: "Replay getting started tour" });
  await expect(gettingStarted).toBeVisible();
  await expect(replay).toHaveCount(0);

  await page.getByRole("button", { name: "Close getting started" }).click();
  await expect(gettingStarted).toHaveCount(0);
  await expect(replay).toBeVisible();

  await page.reload();
  await expect(replay).toBeVisible();
  await expect(gettingStarted).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Close getting started" })).toHaveCount(0);

  // Pressed from the keyboard: under `next dev` the Next.js dev tools badge sits on top of this
  // corner and would catch a mouse click. The production build has no badge.
  await replay.press("Enter");
  await expect(page.locator(".driver-popover")).toBeVisible();
});

test("leaving the tour early keeps the Getting started button", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Getting started", exact: true }).click();
  await expect(page.locator(".driver-popover")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".driver-popover")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Getting started", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close getting started" })).toBeVisible();
});
