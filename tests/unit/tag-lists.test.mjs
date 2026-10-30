// Tag lists (#409): reading every tag an item declares, with a fallback to the deprecated
// single fields for an API that predates ReduxISU/Redux#946, and the any-tag-matches rules the
// /browse and Home filters are built on.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { buildFacetOptions } from "../../components/hooks/ProblemFilters/facetOptions.js";
import {
  anyTagMatches,
  compareByOrder,
  solverFiltersMatch,
  tagList,
  tagListOrUnclassified,
} from "../../components/hooks/ProblemFilters/tagLists.js";

describe("tagList", () => {
  test("returns the list field, in the backend's order, when present", () => {
    const solver = { solverType: "Greedy", solverTypes: ["Greedy", "Approximation"] };
    assert.deepEqual(tagList(solver, "solverTypes", "solverType"), ["Greedy", "Approximation"]);
  });

  test("falls back to the single field on an API without the list", () => {
    assert.deepEqual(tagList({ solverType: "BruteForce" }, "solverTypes", "solverType"), [
      "BruteForce",
    ]);
  });

  test("falls back to the single field when the list is empty or holds only blanks", () => {
    const reduction = { reductionType: "Restriction", reductionTypes: ["", null] };
    assert.deepEqual(tagList(reduction, "reductionTypes", "reductionType"), ["Restriction"]);
  });

  test("reads PascalCased fields too", () => {
    assert.deepEqual(tagList({ ProblemTypes: ["Logic"] }, "problemTypes", "problemType"), [
      "Logic",
    ]);
    assert.deepEqual(tagList({ ProblemType: "Logic" }, "problemTypes", "problemType"), ["Logic"]);
  });

  test("returns [] when neither field is there, or for a missing object", () => {
    assert.deepEqual(tagList({}, "visualizationTypes", "visualizationType"), []);
    assert.deepEqual(tagList(undefined, "visualizationTypes", "visualizationType"), []);
    assert.deepEqual(tagList(null, "problemVariants"), []);
  });

  test("a category with no single-field predecessor never reads one", () => {
    assert.deepEqual(tagList({ problemVariant: "Decision" }, "problemVariants"), []);
    assert.deepEqual(tagList({ problemVariants: ["Optimization"] }, "problemVariants"), [
      "Optimization",
    ]);
  });
});

describe("tagListOrUnclassified", () => {
  test("returns the tags when there are any", () => {
    assert.deepEqual(tagListOrUnclassified({ problemVariants: ["Decision"] }, "problemVariants"), [
      "Decision",
    ]);
  });

  test("returns [Unclassified] when the item declares nothing", () => {
    assert.deepEqual(tagListOrUnclassified({}, "problemVariants"), ["Unclassified"]);
    assert.deepEqual(tagListOrUnclassified(undefined, "solverTypes", "solverType"), [
      "Unclassified",
    ]);
  });
});

describe("anyTagMatches", () => {
  test("an empty or missing selection never filters", () => {
    assert.equal(anyTagMatches(["Greedy"], new Set()), true);
    assert.equal(anyTagMatches([], new Set()), true);
    assert.equal(anyTagMatches(["Greedy"], undefined), true);
  });

  test("an item matches when any one of its tags is selected", () => {
    const tags = ["Heuristic", "Stochastic"];
    assert.equal(anyTagMatches(tags, new Set(["Stochastic"])), true);
    assert.equal(anyTagMatches(tags, new Set(["Heuristic"])), true);
    assert.equal(anyTagMatches(tags, new Set(["BruteForce", "Heuristic"])), true);
    assert.equal(anyTagMatches(tags, new Set(["BruteForce"])), false);
  });

  test("accepts a Set of tags as well as an Array", () => {
    assert.equal(anyTagMatches(new Set(["Graph"]), new Set(["Graph"])), true);
  });
});

describe("solverFiltersMatch with multi-tag solvers", () => {
  // Bin Packing-like: a Greedy+Approximation polynomial solver and a Brute Force exponential one.
  const tags = {
    solvers: [
      { types: ["Greedy", "Approximation"], complexity: "Polynomial" },
      { types: ["BruteForce"], complexity: "Exponential" },
    ],
    solverTypes: new Set(["Greedy", "Approximation", "BruteForce"]),
    solverComplexities: new Set(["Polynomial", "Exponential"]),
  };

  test("a solver type matches on any of a solver's tags", () => {
    assert.equal(solverFiltersMatch(tags, new Set(["Approximation"]), new Set()), true);
    assert.equal(solverFiltersMatch(tags, new Set(["Heuristic"]), new Set()), false);
  });

  test("type + complexity must hold on the same solver, through any of its tags", () => {
    assert.equal(
      solverFiltersMatch(tags, new Set(["Approximation"]), new Set(["Polynomial"])),
      true,
    );
    assert.equal(
      solverFiltersMatch(tags, new Set(["Approximation"]), new Set(["Exponential"])),
      false,
    );
    assert.equal(solverFiltersMatch(tags, new Set(["BruteForce"]), new Set(["Polynomial"])), false);
  });

  test("no selection on either facet never filters", () => {
    assert.equal(solverFiltersMatch(tags, new Set(), new Set()), true);
  });
});

describe("Decision / Optimization filter", () => {
  const variantOrder = ["Decision", "Optimization", "Unclassified"];
  const problemIndex = new Map([
    [
      "SAT",
      {
        problemVariants: tagListOrUnclassified(
          { problemVariants: ["Decision"] },
          "problemVariants",
        ),
      },
    ],
    [
      "MAXCUT",
      {
        problemVariants: tagListOrUnclassified(
          { problemVariants: ["Optimization"] },
          "problemVariants",
        ),
      },
    ],
    ["TSP", { problemVariants: ["Decision", "Optimization"] }],
    ["CLIQUE", { problemVariants: tagListOrUnclassified({}, "problemVariants") }],
  ]);
  const filter = (selected) =>
    [...problemIndex.entries()]
      .filter(([, tags]) => anyTagMatches(tags.problemVariants, new Set(selected)))
      .map(([name]) => name);

  test("options follow /Navigation/ProblemVariants order and count every variant a problem has", () => {
    const options = buildFacetOptions(
      problemIndex,
      (tags) => tags.problemVariants,
      compareByOrder(variantOrder),
    );
    assert.deepEqual(options, [
      { key: "Decision", label: "Decision", count: 2 },
      { key: "Optimization", label: "Optimization", count: 2 },
      { key: "Unclassified", label: "Unclassified", count: 1 },
    ]);
  });

  test("selecting a variant keeps every problem that declares it", () => {
    assert.deepEqual(filter(["Decision"]), ["SAT", "TSP"]);
    assert.deepEqual(filter(["Optimization"]), ["MAXCUT", "TSP"]);
    assert.deepEqual(filter(["Decision", "Optimization"]), ["SAT", "MAXCUT", "TSP"]);
    assert.deepEqual(filter([]), ["SAT", "MAXCUT", "TSP", "CLIQUE"]);
  });

  test("against an API without problemVariants or the endpoint: one Unclassified option", () => {
    const oldIndex = new Map([
      [
        "SAT",
        { problemVariants: tagListOrUnclassified({ problemType: "Logic" }, "problemVariants") },
      ],
      ["CLIQUE", { problemVariants: tagListOrUnclassified({}, "problemVariants") }],
    ]);
    const options = buildFacetOptions(oldIndex, (tags) => tags.problemVariants, compareByOrder([]));
    assert.deepEqual(options, [{ key: "Unclassified", label: "Unclassified", count: 2 }]);
  });

  test("compareByOrder puts values missing from the order last, alphabetically", () => {
    const sorted = ["Zeta", "Optimization", "Alpha", "Decision"].sort(compareByOrder(variantOrder));
    assert.deepEqual(sorted, ["Decision", "Optimization", "Alpha", "Zeta"]);
    assert.deepEqual(["b", "a"].sort(compareByOrder(undefined)), ["a", "b"]);
  });
});
