// The "Report a bug" link (#393): a prefilled GitHub new-issue address that always stays under
// the length GitHub accepts, cutting the page address short when it has to.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  BUG_TITLE,
  buildBugReportUrl,
  MAX_ISSUE_URL_LENGTH,
  NEW_ISSUE_URL,
  TRUNCATED_MARK,
} from "../../components/widgets/bugReportLink.js";

const UA = "Mozilla/5.0 (X11; Linux x86_64) Chrome/140.0";

function bodyOf(url) {
  return new URL(url).searchParams.get("body");
}

describe("buildBugReportUrl", () => {
  test("opens a new issue with the title, page, browser and the three headings", () => {
    const page = "https://redux.example/?problem=SAT3&instance=(x1|!x2|x3)&solver=PPZ";
    const url = buildBugReportUrl(page, UA);
    assert.ok(url.startsWith(`${NEW_ISSUE_URL}?`));
    const params = new URL(url).searchParams;
    assert.equal(params.get("title"), BUG_TITLE);
    const body = params.get("body");
    assert.ok(body.includes(`**Page:** ${page}`), "the page address, query included, round-trips");
    assert.ok(body.includes(`**Browser:** ${UA}`));
    for (const heading of ["### What happened", "### What you expected", "### Steps"]) {
      assert.ok(body.includes(heading), heading);
    }
  });

  test("encodes characters that would break the link", () => {
    const page = "https://redux.example/?instance=a&b#c d+e%";
    const url = buildBugReportUrl(page, UA);
    assert.ok(!url.includes("#"), "a raw # would end the query early");
    assert.ok(!url.includes(" "));
    assert.ok(bodyOf(url).includes(`**Page:** ${page}`));
  });

  test("a huge page address is cut short and marked, and the link stays under the limit", () => {
    const page = `https://redux.example/?problem=SAT3&instance=${"(x1|x2|x3)&".repeat(2000)}`;
    const url = buildBugReportUrl(page, UA);
    assert.ok(url.length <= MAX_ISSUE_URL_LENGTH, `${url.length} characters`);
    const body = bodyOf(url);
    assert.ok(body.includes(TRUNCATED_MARK));
    assert.ok(body.includes("**Page:** https://redux.example/?problem=SAT3&instance=(x1|x2|x3)"));
    assert.ok(body.includes(`**Browser:** ${UA}`), "the rest of the report is kept");
    assert.ok(body.includes("### Steps"));
  });

  test("the cut uses as much of the limit as it can", () => {
    const url = buildBugReportUrl(`https://redux.example/?x=${"%".repeat(5000)}`, UA);
    assert.ok(url.length <= MAX_ISSUE_URL_LENGTH);
    // Each "%" encodes to "%2525"; the next one would not fit.
    assert.ok(url.length > MAX_ISSUE_URL_LENGTH - 5, `${url.length} characters`);
  });

  test("an address under the limit is not cut", () => {
    const page = `https://redux.example/?instance=${"a".repeat(1000)}`;
    assert.ok(!bodyOf(buildBugReportUrl(page, UA)).includes(TRUNCATED_MARK));
  });
});
