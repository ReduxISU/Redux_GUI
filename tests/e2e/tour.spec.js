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
