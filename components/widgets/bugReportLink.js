/**
 * The "Report a bug" link (#393): a GitHub new-issue address with the title and body filled in.
 * Pure functions, so they can be unit tested without a browser; ReportBugButton.js uses them.
 */

export const NEW_ISSUE_URL = "https://github.com/ReduxISU/Redux_GUI/issues/new";

/**
 * The longest new-issue link we make, in characters. GitHub refuses (or cuts) longer request
 * URLs, and some browsers and proxies in between stop at about 8 KB too, so we stay under that.
 * The page address is the only part that can be long (a shared view's instance rides in it), so
 * it is what gets cut.
 */
export const MAX_ISSUE_URL_LENGTH = 8000;

export const TRUNCATED_MARK = " ... (address cut short to fit)";

export const BUG_TITLE = "Bug: ";

function issueBody(pageUrl, userAgent) {
  return [
    `**Page:** ${pageUrl}`,
    `**Browser:** ${userAgent}`,
    "",
    "### What happened",
    "",
    "",
    "### What you expected",
    "",
    "",
    "### Steps",
    "1. ",
    "",
  ].join("\n");
}

function issueUrl(pageUrl, userAgent) {
  const params = new URLSearchParams({ title: BUG_TITLE, body: issueBody(pageUrl, userAgent) });
  return `${NEW_ISSUE_URL}?${params.toString()}`;
}

/**
 * Builds the new-issue link for a bug seen on `pageUrl` in a browser that says `userAgent`.
 * When the whole thing would pass MAX_ISSUE_URL_LENGTH, the page address is cut short (and
 * marked as cut) until it fits.
 */
export function buildBugReportUrl(pageUrl = "", userAgent = "") {
  const full = issueUrl(pageUrl, userAgent);
  if (full.length <= MAX_ISSUE_URL_LENGTH) return full;

  // Encoding can turn one character into up to 9 (e.g. "%E2%80%A6"), so search for the longest
  // prefix that fits rather than guessing from the raw length.
  let low = 0;
  let high = pageUrl.length;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (issueUrl(pageUrl.slice(0, mid) + TRUNCATED_MARK, userAgent).length <= MAX_ISSUE_URL_LENGTH)
      low = mid;
    else high = mid - 1;
  }
  const cut = issueUrl(pageUrl.slice(0, low) + TRUNCATED_MARK, userAgent);
  // A user agent alone past the limit (never seen in practice) still gets a working link.
  return cut.length <= MAX_ISSUE_URL_LENGTH ? cut : issueUrl(TRUNCATED_MARK, "");
}
