// Dropdown label lookups in SearchBarExtensible (issue #405): every call site must resolve a
// label through keyForLabel with the problem's own options, never the whole-map getKeyByValue.
// The component imports React and MUI, which node --test cannot load, so this reads its source.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

const source = readFileSync(
  new URL("../../components/widgets/SearchBarExtensible.js", import.meta.url),
  "utf8",
);

describe("SearchBarExtensible label lookups", () => {
  test("no call site uses the whole-map getKeyByValue lookup", () => {
    assert.doesNotMatch(source, /getKeyByValue/);
  });

  test("no code walks the whole optionsMap to match a value, under any helper name", () => {
    // Catches a reintroduced whole-map lookup even if it is renamed or inlined. Searching
    // a label list with [...optionsMap.values()] is fine; walking entries to match a value is not.
    assert.doesNotMatch(source, /optionsMap\.entries\(\)|for \([^)]*\) of optionsMap\b/);
  });

  test("every label lookup passes the problem's options to keyForLabel", () => {
    // onChange, filterOptions stringify, getOptionDisabled and renderOption
    const scoped = source.match(/keyForLabel\(options, optionsMap, /g) ?? [];
    assert.equal(scoped.length, 4);
    assert.equal(source.match(/keyForLabel\(/g)?.length, scoped.length);
  });
});
