import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldOfferExtenders } from "../../components/widgets/shouldOfferExtenders.js";

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
