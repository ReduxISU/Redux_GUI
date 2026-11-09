// Maps a dropdown's display label back to its option key, looking only at the keys the
// dropdown is showing (issue #405). Labels are not unique across problems: SATGroverSolver
// and UnstructuredGroverSolver are both named "Grover's Algorithm", and the solver name map
// is shared by every problem, so a lookup over the whole map returns whichever key comes
// first and the choice is then dropped as not being an option.
//
// Deliberately free of imports: node --test loads this file directly
// (tests/unit/search-bar-option-keys.test.mjs).
// A key with no display name is listed under the key itself (SearchBarExtensible maps options
// with `optionsMap.get(x) ?? x`), so the fallback here matches the label the dropdown shows.
export function keyForLabel(keys, optionsMap, label) {
  for (const key of keys) {
    if ((optionsMap.get(key) ?? key) === label) {
      return key;
    }
  }
  // Return a default value (e.g., null) if the label is not one of the options
  return null;
}
