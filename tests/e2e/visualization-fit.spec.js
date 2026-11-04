/**
 * A picture fills its pane and nothing of it is cut off (ZoomPanView fits each picture to what is
 * drawn). Before, the force graph drew into a fixed 470×470 box pinned to the left, so a large
 * graph lost its nodes off the left and top edges and a small one sat off to one side.
 */
import { expect, test } from "./fixtures";

const NODES = 30;

// A 30-node path with a chord from every third node: spreads well past the old fixed box.
function largeCliqueInstance() {
  const nodes = Array.from({ length: NODES }, (_, i) => i + 1);
  const edges = nodes.slice(0, -1).map((i) => `{${i},${i + 1}}`);
  for (let i = 1; i <= NODES; i += 3) edges.push(`{${i},${((i * 7) % NODES) + 1}}`);
  return `(({${nodes.join(",")}},{${edges.join(",")}}),3)`;
}

const visualizeRow = (page) =>
  page.locator(".accordion").filter({ has: page.getByText("Visualize", { exact: true }) });

// Where the nodes sit relative to the pane, once the force layout has settled.
async function nodesInPane(page) {
  const viewport = visualizeRow(page).locator("[data-zoom-viewport]").first();
  await expect(viewport.locator("circle")).toHaveCount(NODES, { timeout: 20_000 });
  // The force layout moves for a few seconds; wait until the nodes stop.
  let last = "";
  await expect
    .poll(
      async () => {
        const now = JSON.stringify(
          await viewport.evaluate((v) =>
            [...v.querySelectorAll("circle")].map((c) => [
              c.getAttribute("cx"),
              c.getAttribute("cy"),
            ]),
          ),
        );
        const still = now === last;
        last = now;
        return still;
      },
      { intervals: [500], timeout: 20_000 },
    )
    .toBe(true);
  return viewport.evaluate((v) => {
    const pane = v.getBoundingClientRect();
    const boxes = [...v.querySelectorAll("circle")].map((c) => c.getBoundingClientRect());
    const left = Math.min(...boxes.map((b) => b.left));
    const right = Math.max(...boxes.map((b) => b.right));
    return {
      outside: boxes.filter(
        (b) =>
          b.left < pane.left - 1 ||
          b.right > pane.right + 1 ||
          b.top < pane.top - 1 ||
          b.bottom > pane.bottom + 1,
      ).length,
      leftGap: left - pane.left,
      rightGap: pane.right - right,
      paneWidth: pane.width,
    };
  });
}

for (const [device, viewport] of [
  ["a desktop", { width: 1400, height: 900 }],
  ["a phone", { width: 390, height: 844 }],
]) {
  test(`on ${device}, a large graph fits its pane: no node cut off, centred side to side`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/?problem=CLIQUE");
    const instance = page.locator("textarea").first();
    await expect(instance).not.toHaveValue("");
    await instance.fill(largeCliqueInstance());
    await instance.blur();

    const { outside, leftGap, rightGap, paneWidth } = await nodesInPane(page);
    expect(outside).toBe(0);
    // Centred: the space left and right of the drawing differs by little. (The fitted box is
    // centred, so a tall graph leaves equal room on both sides.)
    expect(Math.abs(leftGap - rightGap)).toBeLessThan(paneWidth * 0.05);
  });
}
