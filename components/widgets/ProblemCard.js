import React from "react";
import Link from "next/link";
import { Box, Chip, Typography } from "@mui/material";
import { CheckCircle as CheckCircleIcon, RemoveCircleOutlined as DashIcon } from "@mui/icons-material";

// Same glassmorphism card treatment as pages/aboutus/index.js's theSectionCard,
// scaled down for a dense grid of many cards.
const cardSx = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.10)",
  padding: 2,
  height: "100%",
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "rgba(168,85,247,0.4)",
    boxShadow: "0 0 25px rgba(168,85,247,0.15)",
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
 */
export default function ProblemCard({
  name,
  displayName = name,
  complexityClass,
  solverTypes,
  hasRenderableVisualization,
}) {
  return (
    <Box sx={cardSx}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Link
          href={`/?problem=${encodeURIComponent(name)}`}
          style={{ textDecoration: "none" }}
        >
          <Typography
            sx={{
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "1rem",
              "&:hover": { color: "#d8b4fe" },
            }}
          >
            {displayName}
          </Typography>
        </Link>
        {hasRenderableVisualization ? (
          <CheckCircleIcon titleAccess="Has a renderable visualization" sx={{ color: "#4ade80", fontSize: "1.1rem" }} />
        ) : (
          <DashIcon titleAccess="No renderable visualization" sx={{ color: "#4b5563", fontSize: "1.1rem" }} />
        )}
      </Box>

      <Chip
        label={complexityClass}
        size="small"
        sx={{
          mb: 1.25,
          color: "#e9d5ff",
          background: "rgba(168,85,247,0.15)",
          border: "1px solid rgba(168,85,247,0.35)",
          fontSize: "0.72rem",
        }}
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {solverTypes.length === 0 ? (
          <Typography sx={{ color: "#6b7280", fontSize: "0.75rem", fontStyle: "italic" }}>
            No solvers
          </Typography>
        ) : (
          solverTypes.map((type) => (
            <Chip
              key={type}
              label={type}
              size="small"
              sx={{
                color: "#d1d5db",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                fontSize: "0.7rem",
              }}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
