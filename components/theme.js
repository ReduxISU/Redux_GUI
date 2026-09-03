/**
 * theme.js
 *
 * Single source of truth for the app's orange/grey/white palette. Every page
 * used to define its own createTheme() with copy-pasted -- and sometimes
 * drifting -- hex values (e.g. "#3F3F46" vs "#424242" for the "same" grey,
 * "#F47C20" vs "#f47920" for the "same" orange). Centralizing here fixes that
 * drift and is also what makes a future light/dark toggle possible without
 * touching every page's own theme individually.
 */

import { createTheme } from "@mui/material";

export const FONT_FAMILY =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const lightPalette = {
  mode: "light",
  primary: { main: "#3F3F46" },
  secondary: { main: "#F47C20" },
  background: {
    default: "#F9FAFB",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#111827",
    secondary: "#4B5563",
  },
};

// The soft top-of-page glow + light grey backdrop shared by every page.
export const pageBackground =
  "radial-gradient(circle at top, rgba(139,92,246,0.08), transparent 38%), #F9FAFB";

// Elevated white "section" card -- outermost content blocks on a page.
export const sectionCardSx = {
  background: "#FFFFFF",
  borderRadius: "16px",
  border: "1px solid #E5E7EB",
  padding: { xs: 3, md: 4 },
  boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
  transition: "all 0.25s ease",
  "&:hover": {
    borderColor: "#F47C20",
    boxShadow: "0 12px 30px rgba(0,0,0,0.07)",
  },
};

// Inset light-grey "item" card -- nested inside a section card.
export const innerCardSx = {
  background: "#F9FAFB",
  border: "1px solid #E5E7EB",
  borderRadius: "10px",
  px: 1.2,
  py: 1,
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#F47C20",
    background: "#FFFFFF",
  },
};

export const theme = createTheme({
  palette: lightPalette,
  typography: { fontFamily: FONT_FAMILY },
});
