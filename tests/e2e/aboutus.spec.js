/**
 * The About Us contributor boxes: the whole box is one control that opens that contributor's
 * details dialog, so the orange hover highlight is truthful and keyboard users can reach it.
 * Contributor names come from the backend directory, so these tests use whoever is first.
 */
import { expect, test } from "./fixtures";

async function openContributors(page) {
  await page.goto("/aboutus");
  // Sections start collapsed; the toggle is the button in the section's header.
  const section = page.locator(".accordion").filter({
    has: page.getByText("CONTRIBUTORS", { exact: true }),
  });
  await section.locator("[data-tour-toggle]").click();
  const first = page.locator('button[aria-haspopup="dialog"]').first();
  await expect(first).toBeVisible();
  return first;
}

test("a contributor's details open and close with the keyboard alone", async ({ page }) => {
  const trigger = await openContributors(page);
  const name = (await trigger.textContent()).trim();

  await trigger.focus();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(name, { exact: true })).toBeVisible();
  await expect(dialog.getByText("Contributions", { exact: true })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  // Space opens it too.
  await page.keyboard.press("Space");
  await expect(dialog).toBeVisible();
});

test("clicking anywhere on the contributor box, not just the name, opens the details", async ({
  page,
}) => {
  const trigger = await openContributors(page);
  const name = (await trigger.textContent()).trim();

  // Click the box's right-hand edge, well away from the name text.
  const box = trigger.locator("xpath=../..");
  const rect = await box.boundingBox();
  await page.mouse.click(rect.x + rect.width - 12, rect.y + rect.height / 2);

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(name, { exact: true })).toBeVisible();
});
