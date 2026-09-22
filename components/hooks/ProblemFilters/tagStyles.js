/**
 * Single source of truth for tag/chip coloring by facet kind, so a given kind
 * of tag (a problem's complexity class, its problem type, a solver's type, a
 * visualization's type) always renders in the same color everywhere it shows
 * up -- Browse's ProblemCard, the Home page's problem/solver/visualization
 * dropdowns, and anywhere else a facet tag is rendered.
 */
export const TAG_KIND_STYLES = {
  complexityClass: {
    color: "#c2410c",
    background: "rgba(244,124,32,0.12)",
    border: "rgba(244,124,32,0.35)",
    hoverBackground: "rgba(244,124,32,0.22)",
  },
  problemType: {
    color: "#7c3aed",
    background: "rgba(124,58,237,0.10)",
    border: "rgba(124,58,237,0.32)",
    hoverBackground: "rgba(124,58,237,0.20)",
  },
  solverType: {
    color: "#0f766e",
    background: "rgba(13,148,136,0.12)",
    border: "rgba(13,148,136,0.35)",
    hoverBackground: "rgba(13,148,136,0.22)",
  },
  visualizationType: {
    color: "#1d4ed8",
    background: "rgba(37,99,235,0.10)",
    border: "rgba(37,99,235,0.32)",
    hoverBackground: "rgba(37,99,235,0.20)",
  },
};

/**
 * MUI `sx` object for a tag Chip of the given kind. Falls back to the
 * complexityClass palette for an unrecognized kind (including `undefined`,
 * for a plain-string tag with no kind attached) rather than rendering
 * unstyled, so a not-yet-categorized tag is still visually a "tag."
 *
 * @param kind One of TAG_KIND_STYLES's keys.
 * @param clickable Adds pointer cursor + hover background when true.
 * @param mode Current theme mode ("light" | "dark"). When given, the tag's
 * TEXT is white in dark mode / black in light mode instead of the kind's own
 * accent color -- the background/border still carry the kind's color, so
 * tags stay distinguishable by kind while the label itself is always
 * high-contrast against that background. Omit to keep the older behavior
 * (text colored the same as the kind's accent).
 */
export function tagChipSx(kind, { clickable = false, mode } = {}) {
  const style = TAG_KIND_STYLES[kind] ?? TAG_KIND_STYLES.complexityClass;
  return {
    color: mode ? (mode === "dark" ? "#fff" : "#000") : style.color,
    background: style.background,
    border: `1px solid ${style.border}`,
    fontSize: "0.72rem",
    ...(clickable && {
      cursor: "pointer",
      "&:hover": { background: style.hoverBackground },
    }),
  };
}

/**
 * Normalizes an `optionTag`/tag-list value into an array of `{label, kind}`
 * objects. Accepts a single object, an array of objects, a plain string (kind
 * defaults to undefined -> complexityClass palette via tagChipSx), or
 * null/undefined (-> empty array). Used anywhere a caller-supplied tag value
 * needs to support both the old plain-string shape and the newer
 * `{label, kind}` shape without every call site re-deriving this.
 */
export function normalizeTags(value) {
  return [].concat(value ?? []).filter(Boolean).map((tag) =>
    typeof tag === "string" ? { label: tag, kind: undefined } : tag,
  );
}
