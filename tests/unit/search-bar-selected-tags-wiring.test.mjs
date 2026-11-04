// Wiring for the tags inside the search box (issue #341). SearchBarExtensible imports React and MUI,
// which node --test cannot load, so this reads its source (same approach as search-bar-call-sites).
// It guards that the render path passes the typed text to showsSelectedTags, so reverting that
// wiring fails here, and that only the main problem picker opts in to hiding while typing.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

const searchBar = readFileSync(
  new URL("../../components/widgets/SearchBarExtensible.js", import.meta.url),
  "utf8",
);
const problemRow = readFileSync(
  new URL("../../components/pageblocks/ProblemRowReact.js", import.meta.url),
  "utf8",
);

describe("selected-value tags in the search box", () => {
  test("renderInput decides tag visibility with the typed text", () => {
    assert.match(searchBar, /showsSelectedTags\(\{[\s\S]*?\binput,[\s\S]*?\}\)/);
  });

  test("the main problem picker opts in to hiding tags while typing", () => {
    assert.match(problemRow, /<SearchBarExtensible[\s\S]*?\bhideSelectedTagsWhileTyping\b/);
  });
});
