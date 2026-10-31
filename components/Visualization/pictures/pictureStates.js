// The one table that turns a picture state name into a style. Every picture type Redux serves
// under format=frames labels its pieces with the same state names (Redux `PictureState`,
// Interfaces/Steps/Frames.cs), never with colours, so every renderer reads its colours here and
// the key lists the same entries with the same wording. `dash` is the second, non-colour cue for
// the states that are drawn faded or provisional.

import { pictureTokens } from "./pictureTokens";

export const PICTURE_STATES = [
  { name: "ElementHighlight", legend: "What the solver is looking at now" },
  { name: "Solution", legend: "In the confirmed answer" },
  { name: "Committed", legend: "Kept so far, not yet confirmed", dash: "6 3" },
  { name: "Covered", legend: "A rule the answer takes care of" },
  { name: "Rejected", legend: "Breaks a rule, or a run that found nothing" },
  { name: "Blocked", legend: "Can't be chosen without breaking a rule", dash: "4 3" },
  { name: "False", legend: "Assigned false", dash: "2 2" },
  { name: "Untraveled", legend: "Never reached in this run", dash: "2 3" },
  { name: "Background", legend: "Nothing has happened to it yet" },
];

const BY_NAME = new Map(PICTURE_STATES.map((state) => [state.name, state]));

/** Which state shows when one piece has several, strongest first (Redux `GraphSubsetFrames.Rank`). */
export const STATE_PRECEDENCE = [
  "Rejected",
  "ElementHighlight",
  "Solution",
  "Committed",
  "Covered",
  "Blocked",
  "False",
  "Untraveled",
  "Background",
];

export function isPictureState(name) {
  return BY_NAME.has(name);
}

/** A frame's state maps leave Background out, so a missing or unknown entry is Background. */
export function stateOf(map, id) {
  const name = map?.[id]?.state;
  return isPictureState(name) ? name : "Background";
}

export function strongestState(states) {
  return states.reduce(
    (best, state) =>
      STATE_PRECEDENCE.indexOf(state) < STATE_PRECEDENCE.indexOf(best) ? state : best,
    "Background",
  );
}

/**
 * @param mode "light" | "dark"
 * @param name a picture state; an unknown one gets Background's style
 * @returns {{name, line, fill, ink, text, dash, legend}}
 */
export function pictureStateStyle(mode, name) {
  const state = BY_NAME.get(name) ?? BY_NAME.get("Background");
  return { ...pictureTokens(mode).state[state.name], ...state };
}

/** Every state name a run's frames use, for the key. Only `state` fields count. */
export function statesInFrames(frames) {
  const found = new Set();
  const walk = (value) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        if (key === "state" && isPictureState(child)) found.add(child);
        else walk(child);
      }
    }
  };
  walk(frames);
  return found;
}
