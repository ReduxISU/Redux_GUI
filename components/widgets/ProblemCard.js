import React from "react";
import Link from "next/link";
import { Box, Chip, Typography } from "@mui/material";
import { CheckCircle as CheckCircleIcon, RemoveCircleOutlined as DashIcon } from "@mui/icons-material";

// Same light card treatment as pages/aboutus/index.js's theSectionCard,
// scaled down for a dense grid of many cards.
const cardSx = {
  background: "#FFFFFF",
  borderRadius: "16px",
  border: "1px solid #E5E7EB",
  padding: 2,
  height: "100%",
  boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
  transition: "all 0.25s ease",
  "&:hover": {
    borderColor: "#F47C20",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
};

/**
 * Presentational card for one problem in the /browse results grid. Clicking
 * the problem name navigates to `/?problem=<name>`, which the home page
 * reads on mount to auto-select that problem.
 */
export default function ProblemCard({ name, complexityClass, solverTypes, hasRenderableVisualization }) {
  return (
    <Box sx={cardSx}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Link
          href={`/?problem=${encodeURIComponent(name)}`}
          style={{ textDecoration: "none" }}
        >
          <Typography
            sx={{
              color: "#111827",
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
          <DashIcon titleAccess="No renderable visualization" sx={{ color: "#4b5563", fontSize: "1.1rem" }} />
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
                color: "#374151",
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                fontSize: "0.7rem",
              }}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
