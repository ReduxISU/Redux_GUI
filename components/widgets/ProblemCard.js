import React from "react";
import Link from "next/link";
import { Box, Chip, Typography } from "@mui/material";
import { sectionCardSx, textColors } from "../theme";
import { useThemeMode } from "../ThemeModeContext";
import { tagChipSx } from "../hooks/ProblemFilters/tagStyles";

// Label to the left of the Solvers/Visualizations chip rows -- fixed width so
// both rows' chip lists start at the same x position regardless of which
// label is longer, and never wraps/shrinks even when its row's chip list is
// scrolling under it.
function sectionLabelSx(text) {
  return {
    color: text.heading,
    fontSize: "0.68rem",
    fontWeight: 600,
    letterSpacing: "0.06em",
    flexShrink: 0,
    width: "5.5rem",
  };
}

// Direct project-owner instruction: a category row's chip list scrolls
// horizontally in its own lane next to the label, rather than wrapping onto
// further lines below it -- keeps each card's height predictable in the
// results grid regardless of how many solver/visualization types a problem
// declares. minWidth: 0 is load-bearing on a flex child -- without it the row
// grows to fit every chip instead of clipping/scrolling them.
//
// The scrollbar itself is hidden (direct project-owner instruction) -- the
// row still scrolls via wheel/trackpad/touch/drag exactly as before, this
// only suppresses the browser's own scrollbar chrome, which read as visual
// noise on a card this small. Three separate properties because no single
// one covers every engine: scrollbar-width is Firefox's own (not part of any
// vendor-prefixed rule), -ms-overflow-style is legacy Edge/IE, and
// ::-webkit-scrollbar is Chrome/Safari/Chromium-Edge's pseudo-element --
// display: none on it removes the bar without disabling the scrolling it
// controls.
const chipScrollRowSx = {
  display: "flex",
  gap: 0.5,
  overflowX: "auto",
  flexWrap: "nowrap",
  minWidth: 0,
  py: 0.25,
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
};

/**
 * Presentational card for one problem in the /browse results grid. Clicking
 * the problem name navigates to `/?problem=<name>`, which the home page
 * reads on mount to auto-select that problem.
 *
 * @param name Raw class/reflection name (e.g. "DEUTSCHJOZSA") -- used only for the
 * link and the React key, never shown to the user.
 * @param displayName Human-facing name (e.g. "Deutsch Jozsa") -- what's actually
 * rendered. Falls back to `name` if not given.
 * @param complexityClass Display label for the complexity-class chip (e.g. "NP-Complete").
 * @param complexityClassValue Raw wire value behind that label (e.g. "NPComplete") --
 * what gets passed to `onComplexityClassClick`, since that's what
 * `useProblemFilters`'s `selectedComplexityClasses` Set is keyed on.
 * @param problemType Display label for the problem-type chip (e.g. "Graph Theory").
 * @param problemTypeValue Raw wire value behind that label (e.g. "GraphTheory") --
 * what gets passed to `onProblemTypeClick`, since that's what
 * `useProblemFilters`'s `selectedProblemTypes` Set is keyed on.
 * @param solverTypes `[{value, label}]` -- raw wire value plus display label for
 * each solver-type chip, so a click can report the raw value while still
 * rendering the human-facing label.
 * @param visualizationTypes `[{value, label}]` -- each renderable visualization's
 * simplified display category (e.g. "Graph", "Table") from
 * `visualizationCategories.js`. Category strings are already display-ready, so
 * `value` and `label` are the same string here, unlike `solverTypes`. Never
 * includes useProblemIndex's "Unimplemented" sentinel -- the caller
 * (pages/browse/index.js) strips that before this prop is built, so an empty
 * array here means "genuinely no renderable visualization" and this component
 * doesn't have to know the sentinel exists.
 * @param onComplexityClassClick Called with `complexityClassValue` when the
 * complexity-class chip is clicked. Omit to render the chip as non-interactive.
 * @param onProblemTypeClick Called with `problemTypeValue` when the problem-type
 * chip is clicked. Omit to render the chip as non-interactive.
 * @param onSolverTypeClick Called with a solver type's raw `value` when its chip
 * is clicked. Omit to render solver chips as non-interactive.
 * @param onVisualizationTypeClick Called with a visualization category's value
 * when its chip is clicked. Omit to render visualization chips as non-interactive.
 */
export default function ProblemCard({
  name,
  displayName = name,
  complexityClass,
  complexityClassValue,
  problemType,
  problemTypeValue,
  solverTypes,
  visualizationTypes = [],
  onComplexityClassClick,
  onProblemTypeClick,
  onSolverTypeClick,
  onVisualizationTypeClick,
}) {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  // Same card treatment as pages/aboutus/index.js's theSectionCard, scaled
  // down for a dense grid of many cards.
  const cardSx = { ...sectionCardSx(mode), padding: 2, height: "100%", borderRadius: "16px" };

  return (
    <Box sx={cardSx}>
      <Box sx={{ mb: 1 }}>
        <Link
          href={`/?problem=${encodeURIComponent(name)}`}
          style={{ textDecoration: "none" }}
        >
          <Typography
            sx={{
              color: text.heading,
              fontWeight: 600,
              fontSize: "1rem",
              "&:hover": { color: "#F47C20" },
            }}
          >
            {displayName}
          </Typography>
        </Link>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.25 }}>
        <Chip
          label={complexityClass}
          size="small"
          clickable={!!onComplexityClassClick}
          onClick={
            onComplexityClassClick
              ? (event) => {
                  event.stopPropagation();
                  onComplexityClassClick(complexityClassValue);
                }
              : undefined
          }
          sx={tagChipSx("complexityClass", { clickable: !!onComplexityClassClick, mode })}
        />
        {problemType ? (
          <Chip
            label={problemType}
            size="small"
            clickable={!!onProblemTypeClick}
            onClick={
              onProblemTypeClick
                ? (event) => {
                    event.stopPropagation();
                    onProblemTypeClick(problemTypeValue);
                  }
                : undefined
            }
            sx={tagChipSx("problemType", { clickable: !!onProblemTypeClick, mode })}
          />
        ) : null}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", mb: 1.25 }}>
        <Typography sx={sectionLabelSx(text)}>Solvers:</Typography>
        {solverTypes.length === 0 ? (
          <Typography sx={{ color: text.caption, fontSize: "0.75rem", fontStyle: "italic" }}>
            No solvers
          </Typography>
        ) : (
          <Box sx={chipScrollRowSx}>
            {solverTypes.map(({ value, label }) => (
              <Chip
                key={value}
                label={label}
                size="small"
                clickable={!!onSolverTypeClick}
                onClick={
                  onSolverTypeClick
                    ? (event) => {
                        event.stopPropagation();
                        onSolverTypeClick(value);
                      }
                    : undefined
                }
                sx={{ ...tagChipSx("solverType", { clickable: !!onSolverTypeClick, mode }), flexShrink: 0 }}
              />
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography sx={sectionLabelSx(text)}>Visualizations:</Typography>
        {visualizationTypes.length === 0 ? (
          <Typography sx={{ color: text.caption, fontSize: "0.75rem", fontStyle: "italic" }}>
            No visualizations
          </Typography>
        ) : (
          <Box sx={chipScrollRowSx}>
            {visualizationTypes.map(({ value, label }) => (
              <Chip
                key={value}
                label={label}
                size="small"
                clickable={!!onVisualizationTypeClick}
                onClick={
                  onVisualizationTypeClick
                    ? (event) => {
                        event.stopPropagation();
                        onVisualizationTypeClick(value);
                      }
                    : undefined
                }
                sx={{
                  ...tagChipSx("visualizationType", { clickable: !!onVisualizationTypeClick, mode }),
                  flexShrink: 0,
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
