/**
 * "Report a bug" (#393): always in the top bar, opens a prefilled GitHub issue in a new tab.
 * The tab is not followed to GitHub; the test reads the link the click produced.
 */
import { expect, test } from "./fixtures";

for (const path of ["/", "/browse", "/help"]) {
  test(`the Report a bug link is in the top bar on ${path}`, async ({ page }) => {
    await page.goto(path);
    const link = page.getByRole("link", { name: /Report a bug/ });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  });
}

test("clicking it opens a new issue filled in with the page address and browser", async ({
  page,
  context,
}) => {
  await page.goto("/help?from=test");
  // Answer the new tab locally instead of loading GitHub.
  await context.route("https://github.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<p>stub</p>" }),
  );

  const [popup] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("link", { name: /Report a bug/ }).click(),
  ]);
  const url = new URL(popup.url());
  expect(`${url.origin}${url.pathname}`).toBe("https://github.com/ReduxISU/Redux_GUI/issues/new");
  const body = url.searchParams.get("body");
  expect(body).toContain("/help?from=test");
  expect(body).toContain(await page.evaluate(() => navigator.userAgent));
  for (const heading of ["### What happened", "### What you expected", "### Steps"]) {
    expect(body).toContain(heading);
  }
});

test("the link stays visible on a phone-sized screen", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Report a bug/ })).toBeVisible();
});
