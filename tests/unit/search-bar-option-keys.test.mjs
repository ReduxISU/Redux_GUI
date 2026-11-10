// Dropdown label -> option key (issue #405): two problems can each list a solver called
// "Grover's Algorithm", so the lookup must stay within the options the dropdown shows.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { keyForLabel } from "../../components/widgets/optionKeys.js";

describe("keyForLabel", () => {
  // The solver name map is shared by every problem, so both Grover solvers are in it.
  const optionsMap = new Map([
    ["SATGroverSolver", "Grover's Algorithm"],
    ["UnstructuredGroverSolver", "Grover's Algorithm"],
    ["BruteForceSolver", "Brute Force"],
  ]);

  test("resolves a label shared by two solvers to the one in the current options", () => {
    const unstructuredOptions = ["UnstructuredGroverSolver", "BruteForceSolver"];
    assert.equal(
      keyForLabel(unstructuredOptions, optionsMap, "Grover's Algorithm"),
      "UnstructuredGroverSolver",
    );
  });

  test("returns null for a label that is not one of the current options", () => {
    assert.equal(keyForLabel(["BruteForceSolver"], optionsMap, "Grover's Algorithm"), null);
  });

  test("falls back to the key itself when the map has no display name for it", () => {
    assert.equal(keyForLabel(["NoNameSolver"], optionsMap, "NoNameSolver"), "NoNameSolver");
  });
});
