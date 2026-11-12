// Whether the selected value's tags are drawn inside the search box (issue #341). With
// `hideWhileTyping` (the main problem picker), they show only while the input text is that value's
// label, not while the user is typing a search. A selected key with no label in the options map
// shows nothing in that mode. Other pickers keep showing them whenever a value is selected.
//
// Deliberately free of imports: node --test loads this file directly
// (tests/unit/search-bar-selected-tags.test.mjs).
export function showsSelectedTags({
  disabled,
  hasOptionTag,
  selected,
  selectedLabel,
  input,
  hideWhileTyping,
}) {
  const shows = !disabled && hasOptionTag && Boolean(selected);
  if (!hideWhileTyping) {
    return shows;
  }
  return shows && selectedLabel !== "" && input === selectedLabel;
}
