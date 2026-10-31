// The colours every format=frames picture draws with, per theme. Values are the approved mockup
// tokens (Redux: Documentation/Visualizations/mockups/design.src.html, :root blocks), which pass
// the spec's contrast audit: text 4.5:1, lines and marks 3:1, in both modes. Fading is done by
// colour, never opacity, so the faded states still clear 3:1.
//
// A state family has `line` (outline, edge, mark), `fill` (the piece's body), `ink` (text drawn
// on the fill) and `text` (the state's colour for text straight on the canvas).

const LIGHT = {
  canvas: "#ffffff",
  ink: "#19202d",
  muted: "#5b6577",
  line: "#d8dde6",
  edge: "#616773",
  edgeDim: "#7b8392",
  state: {
    Background: { line: "#7d879a", fill: "#ffffff", ink: "#19202d", text: "#19202d" },
    ElementHighlight: { line: "#a97809", fill: "#f3ecdd", ink: "#1b1300", text: "#896107" },
    Solution: { line: "#1e774e", fill: "#1e774e", ink: "#ffffff", text: "#1e774e" },
    Committed: { line: "#3b9467", fill: "#eef8f2", ink: "#1d6b45", text: "#1d6b45" },
    Rejected: { line: "#ba3932", fill: "#fbe1df", ink: "#ba3932", text: "#ba3932" },
    Covered: { line: "#67927e", fill: "#d8f1e4", ink: "#1e774e", text: "#1e774e" },
    Blocked: { line: "#7b8392", fill: "#ffffff", ink: "#5b6577", text: "#5b6577" },
    False: { line: "#7b8392", fill: "#e9ecf1", ink: "#646b77", text: "#646b77" },
    Untraveled: { line: "#7b8392", fill: "#ffffff", ink: "#5b6577", text: "#5b6577" },
  },
  groups: [
    { fill: "#56B4E9", line: "#2b7fb0", ink: "#2a7cac" },
    { fill: "#E69F00", line: "#a87200", ink: "#a06c00" },
    { fill: "#b59ce0", line: "#7a5cb8", ink: "#7a5cb8" },
    { fill: "#F0E442", line: "#968c0c", ink: "#827809" },
    { fill: "#5fc4a8", line: "#2a8a70", ink: "#28846c" },
    { fill: "#CC79A7", line: "#9a4c78", ink: "#9a4c78" },
  ],
};

const DARK = {
  canvas: "#191d26",
  ink: "#e5e8ee",
  muted: "#9aa3b4",
  line: "#2b3240",
  edge: "#929aa7",
  edgeDim: "#7b8595",
  state: {
    Background: { line: "#8791a5", fill: "#1f2430", ink: "#e5e8ee", text: "#e5e8ee" },
    ElementHighlight: { line: "#f0b63e", fill: "#3a3529", ink: "#e5e8ee", text: "#f0b63e" },
    Solution: { line: "#4cc38a", fill: "#4cc38a", ink: "#0b1f15", text: "#4cc38a" },
    Committed: { line: "#8ad8b1", fill: "#132a1f", ink: "#9fe3c1", text: "#9fe3c1" },
    Rejected: { line: "#ff6b61", fill: "#3d1d1b", ink: "#ff6b61", text: "#ff6b61" },
    Covered: { line: "#467c64", fill: "#173828", ink: "#4cc38a", text: "#4cc38a" },
    Blocked: { line: "#7b8595", fill: "#1f2430", ink: "#9aa3b4", text: "#9aa3b4" },
    False: { line: "#7b8595", fill: "#1a1e27", ink: "#7e8694", text: "#7e8694" },
    Untraveled: { line: "#7b8595", fill: "#1f2430", ink: "#9aa3b4", text: "#9aa3b4" },
  },
  groups: [
    { fill: "#56B4E9", line: "#56B4E9", ink: "#56B4E9" },
    { fill: "#E69F00", line: "#E69F00", ink: "#E69F00" },
    { fill: "#b59ce0", line: "#b59ce0", ink: "#b59ce0" },
    { fill: "#F0E442", line: "#F0E442", ink: "#F0E442" },
    { fill: "#5fc4a8", line: "#5fc4a8", ink: "#5fc4a8" },
    { fill: "#CC79A7", line: "#CC79A7", ink: "#CC79A7" },
  ],
};

/** @param mode "light" | "dark" */
export function pictureTokens(mode) {
  return mode === "dark" ? DARK : LIGHT;
}
