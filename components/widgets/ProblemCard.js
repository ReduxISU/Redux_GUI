import React from "react";
import Link from "next/link";
import { Box, Chip, Typography } from "@mui/material";
import { CheckCircle as CheckCircleIcon, RemoveCircleOutlined as DashIcon } from "@mui/icons-material";
import { sectionCardSx, textColors, surfaceColors } from "../theme";
import { useThemeMode } from "../ThemeModeContext";

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
 * @param solverTypes `[{value, label}]` -- raw wire value plus display label for
 * each solver-type chip, so a click can report the raw value while still
 * rendering the human-facing label.
 * @param onComplexityClassClick Called with `complexityClassValue` when the
 * complexity-class chip is clicked. Omit to render the chip as non-interactive.
 * @param onSolverTypeClick Called with a solver type's raw `value` when its chip
 * is clicked. Omit to render solver chips as non-interactive.
 */
export default function ProblemCard({
  name,
  displayName = name,
  complexityClass,
  complexityClassValue,
  solverTypes,
  hasRenderableVisualization,
  onComplexityClassClick,
  onSolverTypeClick,
}) {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  const surface = surfaceColors(mode);
  // Same card treatment as pages/aboutus/index.js's theSectionCard, scaled
  // down for a dense grid of many cards.
  const cardSx = { ...sectionCardSx(mode), padding: 2, height: "100%", borderRadius: "16px" };

  return (
    <Box sx={cardSx}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
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
        {hasRenderableVisualization ? (
          <CheckCircleIcon titleAccess="Has a renderable visualization" sx={{ color: "#4ade80", fontSize: "1.1rem" }} />
        ) : (
          <DashIcon titleAccess="No renderable visualization" sx={{ color: text.caption, fontSize: "1.1rem" }} />
        )}
      </Box>

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
        sx={{
          mb: 1.25,
          color: "#c2410c",
          background: "rgba(244,124,32,0.12)",
          border: "1px solid rgba(244,124,32,0.35)",
          fontSize: "0.72rem",
          ...(onComplexityClassClick && {
            cursor: "pointer",
            "&:hover": { background: "rgba(244,124,32,0.22)" },
          }),
        }}
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {solverTypes.length === 0 ? (
          <Typography sx={{ color: text.caption, fontSize: "0.75rem", fontStyle: "italic" }}>
            No solvers
          </Typography>
        ) : (
          solverTypes.map(({ value, label }) => (
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
              sx={{
                color: text.body,
                background: surface.surfaceAlt,
                border: `1px solid ${surface.border}`,
                fontSize: "0.7rem",
                ...(onSolverTypeClick && {
                  cursor: "pointer",
                  "&:hover": { background: surface.border },
                }),
              }}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
