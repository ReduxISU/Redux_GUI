import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

/**
 * Mirrors `shouldOfferExtenders` in components/widgets/SearchBarExtensible.js.
 * Kept as a pure predicate so node:test can cover the Add-new rule without a
 * React transform (#387).
 */
function shouldOfferExtenders(input, optionLabels) {
  return (
    input !== "" &&
    optionLabels.findIndex((element) => element.toLowerCase() === input.toLowerCase()) === -1
  );
}

describe("shouldOfferExtenders (Add new … when nothing matches)", () => {
  const labels = ["3SAT", "Clique", "Vertex Cover"];

  it("offers the button when the typed text matches no option", () => {
    assert.equal(shouldOfferExtenders("Pull", labels), true);
  });

  it("hides the button on an exact match (case-insensitive)", () => {
    assert.equal(shouldOfferExtenders("Clique", labels), false);
    assert.equal(shouldOfferExtenders("clique", labels), false);
  });

  it("hides the button when the input is empty", () => {
    assert.equal(shouldOfferExtenders("", labels), false);
  });

  it("still offers the button for a partial non-exact match", () => {
    assert.equal(shouldOfferExtenders("Cli", labels), true);
  });
});

describe("SearchBarExtensible.js keeps the helper and controlled open", () => {
  it("exports shouldOfferExtenders and controls Autocomplete open", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const src = readFileSync(join(root, "components/widgets/SearchBarExtensible.js"), "utf8");
    assert.match(src, /export function shouldOfferExtenders/);
    assert.match(src, /open=\{open\}/);
    assert.match(src, /reason === "blur"/);
  });
});
