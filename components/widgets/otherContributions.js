// Pure helpers for the "Other Contributions:" section of the About Us contributor popup.
// The backend's contributor profile carries `otherContributions`: PRs outside problems,
// solvers, verifiers, reductions and visualizations, grouped by area (in the backend's
// order) with each area's PRs newest first. The field is filled at release time only, so
// it is often missing, null or [] -- every helper here treats that as "nothing to show".
//
// Deliberately free of imports: node --test loads this file directly
// (tests/unit/other-contributions.test.mjs).

// PRs shown per area before the "Show all N" toggle; one contributor has hundreds.
export const OTHER_CONTRIBUTIONS_PREVIEW_COUNT = 5;

function pick(obj, camel, pascal) {
  return obj[camel] ?? obj[pascal];
}

// Returns [{ area, pullRequests: [{ repo, number, title, url }] }], keeping the backend's
// order and dropping areas with no usable PRs and PRs with no url. Accepts camelCase or
// PascalCase keys, like the rest of the popup.
export function normalizeOtherContributions(raw) {
  if (!Array.isArray(raw)) return [];
  const areas = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const area = pick(entry, "area", "Area");
    const prs = pick(entry, "pullRequests", "PullRequests");
    if (!area || !Array.isArray(prs)) continue;
    const pullRequests = prs
      .filter((pr) => pr && typeof pr === "object" && pick(pr, "url", "Url"))
      .map((pr) => ({
        repo: pick(pr, "repo", "Repo") ?? "",
        number: pick(pr, "number", "Number"),
        title: pick(pr, "title", "Title") ?? "",
        url: pick(pr, "url", "Url"),
      }));
    if (pullRequests.length > 0) areas.push({ area, pullRequests });
  }
  return areas;
}

// "(1 PR)" / "(4 PRs)"
export function prCountLabel(count) {
  return `(${count} ${count === 1 ? "PR" : "PRs"})`;
}

// "Redux #880: Move CI to rbs"
export function prLinkText({ repo, number, title }) {
  const ref = [repo, number != null ? `#${number}` : null].filter(Boolean).join(" ");
  return title ? `${ref}: ${title}` : ref;
}

// The PRs to list for an area: all of them when expanded, otherwise the first few.
export function visiblePullRequests(
  pullRequests,
  expanded,
  limit = OTHER_CONTRIBUTIONS_PREVIEW_COUNT,
) {
  return expanded ? pullRequests : pullRequests.slice(0, limit);
}

// Toggle text, or null when the area is short enough to need no toggle.
export function toggleLabel(total, expanded, limit = OTHER_CONTRIBUTIONS_PREVIEW_COUNT) {
  if (total <= limit) return null;
  return expanded ? "Show fewer" : `Show all ${total}`;
}
