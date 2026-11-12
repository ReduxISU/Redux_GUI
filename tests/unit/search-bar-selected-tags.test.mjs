// Tags inside the search box (issue #341): with hideWhileTyping (the main problem picker), they must
// hide while the typed text differs from the selected value's label. The rule lives in a JSX-free
// helper so node --test can load it and check behavior directly.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { showsSelectedTags } from "../../components/widgets/selectedTagVisibility.js";

describe("showsSelectedTags", () => {
  const selectedAndShowing = {
    disabled: false,
    hasOptionTag: true,
    selected: "SATProblem",
    selectedLabel: "SAT",
    input: "SAT",
    hideWhileTyping: true,
  };

  test("shows the selected value's tags while the input is its label", () => {
    assert.equal(showsSelectedTags(selectedAndShowing), true);
  });

  test("hides them while the user has typed text that differs from the label", () => {
    assert.equal(showsSelectedTags({ ...selectedAndShowing, input: "sa" }), false);
    assert.equal(showsSelectedTags({ ...selectedAndShowing, input: "" }), false);
  });

  test("keeps them while typing when hideWhileTyping is off (solver and visualization pickers)", () => {
    assert.equal(
      showsSelectedTags({ ...selectedAndShowing, hideWhileTyping: false, input: "sa" }),
      true,
    );
  });

  test("hides them when nothing is selected", () => {
    assert.equal(
      showsSelectedTags({ ...selectedAndShowing, selected: "", selectedLabel: "", input: "" }),
      false,
    );
  });

  test("hides them when the selected key has no label in the options map", () => {
    assert.equal(showsSelectedTags({ ...selectedAndShowing, selectedLabel: "", input: "" }), false);
  });

  test("hides them when disabled or when the component has no optionTag", () => {
    assert.equal(showsSelectedTags({ ...selectedAndShowing, disabled: true }), false);
    assert.equal(showsSelectedTags({ ...selectedAndShowing, hasOptionTag: false }), false);
  });
});
