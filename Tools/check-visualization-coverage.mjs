#!/usr/bin/env node
// Cross-repo CI guard (Redux_GUI half). The API commits
// Documentation/visualization-types.json as the source of truth for
// `visualizationType`; this repo vendors a copy of it at
// components/Visualization/svgs/visualizationTypes.json and this script
// checks that copy against the renderer registry in Visualizations.js.
//
// Deliberately plain Node with zero dependencies: the only reason a test
// runner would be needed is that Visualizations.js contains JSX, which
// plain Node can't import -- so this reads the file as text and extracts
// the registry keys with a regex instead of importing the module. That
// makes the extraction fragile to certain refactors, which is what the two
// structural guards below are for: they turn a silent zero-keys match into
// a loud CI failure instead of a script that "passes" having checked
// nothing.
//
// Run via `npm run check:visualizations`.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const VISUALIZATIONS_PATH = path.join(ROOT, "components/Visualization/svgs/Visualizations.js");
const MANIFEST_PATH = path.join(ROOT, "components/Visualization/svgs/visualizationTypes.json");

// Legacy (pre-rename) wire values kept in the registry for the dual-accept deploy window -- see
// the header comment in Visualizations.js and plan section 2.10. Expected to NOT appear in the
// vendored manifest; treated as an explicitly accepted set rather than as unknown/stale keys.
// Once the aliases are deleted from Visualizations.js (2.10), delete this set too.
const LEGACY_ALIASES = new Set([
  "Graph D3",
  "Graph LaTeX",
  "Set D3",
  "Boolean Satisfiability",
  "Quantum Circuit D3",
  "Quantum Circuit Q.js",
  "pump",
  "Dynamic Table",
]);

// Structural guard: below this many extracted keys, assume the regex broke rather than that the
// registry actually shrank this much. Current registry has 8 current-name keys + 8 legacy
// aliases = 16; set well below that but above zero so a broken extractor can't sneak by.
const MIN_EXTRACTED_KEYS = 9;

const errors = [];
function fail(message) {
  errors.push(message);
}

function relPath(p) {
  return path.relative(ROOT, p).split(path.sep).join("/");
}

function reportAndExit() {
  if (errors.length > 0) {
    console.error("check-visualization-coverage: FAILED\n");
    for (const message of errors) {
      console.error(`  - ${message}`);
    }
    process.exit(1);
  }
}

const source = fs.readFileSync(VISUALIZATIONS_PATH, "utf8");
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));

// --- Structural guard 1: exactly one `new Map(` ----------------------------
// The extractor below assumes the registry is a single Map literal. If a refactor splits it,
// renames it, or introduces a second Map in this file, the regex extraction below is no longer
// trustworthy -- fail loudly instead of silently extracting the wrong set of keys.
const mapCount = (source.match(/new Map\(/g) ?? []).length;
if (mapCount !== 1) {
  fail(
    `expected exactly one "new Map(" in ${relPath(VISUALIZATIONS_PATH)}, found ${mapCount}. ` +
      "This checker assumes a single registry Map; update the checker's extraction logic if " +
      "that assumption changed on purpose.",
  );
}
reportAndExit();

// --- Extract registry keys --------------------------------------------------
// Keys must be double-quoted string literals at the head of each Map entry -- see the header
// comment in Visualizations.js. This intentionally does not parse JS; it only recognizes that
// exact shape.
//
// Two narrowing steps before matching, both guarding against phantom keys -- a match found
// somewhere that is not an actual registry entry. That failure mode is nastier than a missed
// key, because it makes the checker report a renderer that does not exist:
//   1. Start at the Map literal, so nothing in the file header can match. The header documents
//      the required key shape, so it is exactly where someone would write a worked example.
//   2. Strip comments inside the Map body, so a commented-out or illustrative entry is not
//      counted as live.
const mapStart = source.indexOf("new Map(");
const registrySource = source
  .slice(mapStart)
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/(^|[^:])\/\/[^\n]*/g, "$1");

const keyPattern = /\[\s*"((?:[^"\\]|\\.)*)"\s*,/g;
const registryKeys = [...registrySource.matchAll(keyPattern)].map((m) => m[1]);

// --- Structural guard 2: enough keys extracted ------------------------------
if (registryKeys.length < MIN_EXTRACTED_KEYS) {
  fail(
    `only extracted ${registryKeys.length} registry key(s) from ${relPath(VISUALIZATIONS_PATH)}, ` +
      `expected at least ${MIN_EXTRACTED_KEYS}. Either the registry actually lost entries, or a ` +
      "refactor (multi-line keys, single quotes, computed/templated keys, ...) broke this " +
      "script's regex extraction -- fix Tools/check-visualization-coverage.mjs, don't ignore " +
      "this failure.",
  );
}
reportAndExit();

const registryKeySet = new Set(registryKeys);
const manifestSet = new Set(manifest);

// (a) every manifest type except "Unimplemented" has a registry key.
const missingFromRegistry = manifest.filter(
  (type) => type !== "Unimplemented" && !registryKeySet.has(type),
);
if (missingFromRegistry.length > 0) {
  fail(
    "the vendored manifest declares visualizationType(s) with no renderer in " +
      `${relPath(VISUALIZATIONS_PATH)}: ${missingFromRegistry.join(", ")}. Add a registry entry ` +
      "for each, or if a type is genuinely not renderable it belongs represented as " +
      '"Unimplemented" on the API side, not as its own manifest entry.',
  );
}

// (b) every non-alias registry key is in the manifest.
const unknownKeys = registryKeys.filter((key) => !manifestSet.has(key) && !LEGACY_ALIASES.has(key));
if (unknownKeys.length > 0) {
  fail(
    `${relPath(VISUALIZATIONS_PATH)} registers key(s) that are neither in the vendored manifest ` +
      `nor a recognized legacy alias: ` +
      `${unknownKeys.join(", ")}. This usually means a typo, a dead renderer that should be ` +
      "removed, or a manifest that has drifted from the API " +
      `(re-vendor ${relPath(MANIFEST_PATH)} from Redux's Documentation/visualization-types.json).`,
  );
}

reportAndExit();

console.log(
  "check-visualization-coverage: OK " +
    `(${registryKeys.length} registry keys, ${manifest.length} manifest types, ` +
    `${LEGACY_ALIASES.size} legacy aliases accepted)`,
);
