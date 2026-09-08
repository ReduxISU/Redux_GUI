/**
 * theme.js
 *
 * Single source of truth for the app's orange/grey/white palette, in both
 * light and dark variants. Every page used to define its own createTheme()
 * with copy-pasted -- and sometimes drifting -- hex values (e.g. "#3F3F46"
 * vs "#424242" for the "same" grey, "#F47C20" vs "#f47920" for the "same"
 * orange). Centralizing here fixes that drift and is what makes the
 * light/dark toggle (ThemeModeContext.js) possible in the first place --
 * one shared palette pair to flip between, instead of five independent
 * page themes that would each need their own dark variant maintained by hand.
 */

import { createTheme } from "@mui/material";

export const FONT_FAMILY =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const lightPalette = {
  mode: "light",
  primary: { main: "#3F3F46", lGray: "#f3f3f3" },
  secondary: { main: "#F47C20" },
  white: { main: "#ffffff" },
  background: {
    default: "#F9FAFB",
    paper: "#FFFFFF",
  },
  text: {
    primary: "#111827",
    secondary: "#4B5563",
  },
};

export const darkPalette = {
  mode: "dark",
  primary: { main: "#D1D5DB", lGray: "#1f1f27" },
  secondary: { main: "#F47C20" },
  white: { main: "#ffffff" },
  background: {
    default: "#0B0B0F",
    paper: "#15151d",
  },
  text: {
    primary: "#F9FAFB",
    secondary: "#9CA3AF",
  },
};

/** @param mode "light" | "dark" */
export function createAppTheme(mode) {
  return createTheme({
    palette: mode === "dark" ? darkPalette : lightPalette,
    typography: { fontFamily: FONT_FAMILY },
  });
}

// The soft top-of-page glow + backdrop shared by every page.
export function pageBackground(mode) {
  return mode === "dark"
    ? "radial-gradient(circle at top, rgba(139,92,246,0.16), transparent 32%), linear-gradient(180deg, #0B0B0F 0%, #07070B 100%)"
    : "radial-gradient(circle at top, rgba(139,92,246,0.08), transparent 38%), #F9FAFB";
}

// Elevated "section" card -- outermost content blocks on a page.
export function sectionCardSx(mode) {
  return mode === "dark"
    ? {
        background: "#15151d",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.10)",
        padding: { xs: 3, md: 4 },
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        transition: "all 0.25s ease",
        "&:hover": {
          borderColor: "#F47C20",
          boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
        },
      }
    : {
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
}

// Inset "item" card -- nested inside a section card.
export function innerCardSx(mode) {
  return mode === "dark"
    ? {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: "10px",
        px: 1.2,
        py: 1,
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "#F47C20",
          background: "rgba(255,255,255,0.07)",
        },
      }
    : {
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
}

// Body-content text tiers, used throughout every page's prose/labels/captions.
// Every page hardcoded these as literal hex per instance before the toggle
// existed; centralizing them here is what keeps dark-mode text legible against
// the dark cards above instead of staying dark-on-dark.
export function textColors(mode) {
  return mode === "dark"
    ? {
        heading: "#F9FAFB", // was #111827
        body: "#D1D5DB", // was #374151
        secondary: "#9CA3AF", // was #4B5563
        caption: "#9CA3AF", // was #6b7280
        faint: "#6B7280", // was #9ca3af
      }
    : {
        heading: "#111827",
        body: "#374151",
        secondary: "#4B5563",
        caption: "#6b7280",
        faint: "#9ca3af",
      };
}

// Plain surface tokens (card backgrounds/borders outside sectionCardSx/
// innerCardSx -- e.g. a chip or avatar background that isn't itself a card).
export function surfaceColors(mode) {
  return mode === "dark"
    ? {
        surface: "#15151d",
        surfaceAlt: "rgba(255,255,255,0.04)",
        surfaceAltHover: "rgba(255,255,255,0.07)",
        border: "rgba(255,255,255,0.10)",
      }
    : {
        surface: "#FFFFFF",
        surfaceAlt: "#F9FAFB",
        surfaceAltHover: "#FFFFFF",
        border: "#E5E7EB",
      };
}
