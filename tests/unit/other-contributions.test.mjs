// "Other Contributions:" in the About Us contributor popup: the backend's
// `otherContributions` field is often empty (filled at release time), so empty input must
// produce nothing, and long areas show a preview with a toggle.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  normalizeOtherContributions,
  OTHER_CONTRIBUTIONS_PREVIEW_COUNT,
  prCountLabel,
  prLinkText,
  toggleLabel,
  visiblePullRequests,
} from "../../components/widgets/otherContributions.js";

const pr = (number) => ({
  repo: "Redux",
  number,
  title: `PR ${number}`,
  url: `https://github.com/ReduxISU/Redux/pull/${number}`,
});

describe("normalizeOtherContributions", () => {
  test("missing, null and empty fields give no areas", () => {
    assert.deepEqual(normalizeOtherContributions(undefined), []);
    assert.deepEqual(normalizeOtherContributions(null), []);
    assert.deepEqual(normalizeOtherContributions([]), []);
    assert.deepEqual(normalizeOtherContributions({}), []);
  });

  test("keeps the backend's area order and PR order", () => {
    const raw = [
      { area: "Tests", pullRequests: [pr(3), pr(1)] },
      { area: "CI and build tooling", pullRequests: [pr(2)] },
    ];
    assert.deepEqual(normalizeOtherContributions(raw), raw);
  });

  test("drops areas with no PRs and PRs with no url", () => {
    const raw = [
      { area: "Documentation", pullRequests: [] },
      { area: "Tests", pullRequests: [{ repo: "Redux", number: 9, title: "x" }, pr(4)] },
      { area: "Redux_GUI interface" },
      null,
    ];
    assert.deepEqual(normalizeOtherContributions(raw), [{ area: "Tests", pullRequests: [pr(4)] }]);
  });

  test("accepts PascalCase keys", () => {
    const raw = [
      {
        Area: "Tests",
        PullRequests: [{ Repo: "Redux", Number: 4, Title: "PR 4", Url: pr(4).url }],
      },
    ];
    assert.deepEqual(normalizeOtherContributions(raw), [{ area: "Tests", pullRequests: [pr(4)] }]);
  });
});

describe("labels", () => {
  test("PR count is singular for one", () => {
    assert.equal(prCountLabel(1), "(1 PR)");
    assert.equal(prCountLabel(4), "(4 PRs)");
  });

  test("link text is repo #number: title", () => {
    assert.equal(
      prLinkText({ repo: "Redux", number: 880, title: "Move CI to rbs" }),
      "Redux #880: Move CI to rbs",
    );
    assert.equal(prLinkText({ repo: "Redux_GUI", number: 7, title: "" }), "Redux_GUI #7");
  });
});

describe("preview and toggle", () => {
  const many = Array.from({ length: 12 }, (_, i) => pr(i + 1));

  test("shows the first five until expanded", () => {
    assert.equal(OTHER_CONTRIBUTIONS_PREVIEW_COUNT, 5);
    assert.deepEqual(visiblePullRequests(many, false), many.slice(0, 5));
    assert.equal(visiblePullRequests(many, true).length, 12);
  });

  test("toggle appears only past the preview count", () => {
    assert.equal(toggleLabel(5, false), null);
    assert.equal(toggleLabel(12, false), "Show all 12");
    assert.equal(toggleLabel(12, true), "Show fewer");
  });
});
