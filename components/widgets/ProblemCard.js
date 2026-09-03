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
 */
export default function ProblemCard({ name, complexityClass, solverTypes, hasRenderableVisualization }) {
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
            {name}
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
        sx={{
          mb: 1.25,
          color: "#c2410c",
          background: "rgba(244,124,32,0.12)",
          border: "1px solid rgba(244,124,32,0.35)",
          fontSize: "0.72rem",
        }}
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {solverTypes.length === 0 ? (
          <Typography sx={{ color: text.caption, fontSize: "0.75rem", fontStyle: "italic" }}>
            No solvers
          </Typography>
        ) : (
          solverTypes.map((type) => (
            <Chip
              key={type}
              label={type}
              size="small"
              sx={{
                color: text.body,
                background: surface.surfaceAlt,
                border: `1px solid ${surface.border}`,
                fontSize: "0.7rem",
              }}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
