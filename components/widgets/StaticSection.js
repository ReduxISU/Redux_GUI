/**
 * A non-collapsible section with the same header/body visual styling as
 * ProblemSection, but always fully expanded -- no accordion, no toggle.
 * Used on pages where every section should just be part of the normal page
 * flow (Help, Contribute) rather than click-to-expand (About Us).
 */

import { Box, Stack } from "@mui/material";
import { surfaceColors, textColors } from "../theme";
import { useThemeMode } from "../ThemeModeContext";

export default function StaticSection({ children }) {
  const { mode } = useThemeMode();
  const surface = surfaceColors(mode);

  return (
    <Box
      sx={{
        borderRadius: 1,
        border: `1px solid ${mode === "dark" ? "transparent" : surface.border}`,
        backgroundColor: surface.surface,
        overflow: "hidden",
      }}
    >
      {children}
    </Box>
  );
}

StaticSection.Header = function Header({ children, title, titleWidth }) {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  const surface = surfaceColors(mode);

  return (
    <Box
      sx={{
        backgroundColor: surface.surfaceAlt,
        borderBottom: `1px solid ${mode === "dark" ? "transparent" : surface.border}`,
        color: text.heading,
        px: 2,
        py: 1,
      }}
    >
      <Stack direction="row" gap={2} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            width: titleWidth ?? "10%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {title}
        </Box>
        {children}
      </Stack>
    </Box>
  );
};

StaticSection.Body = function Body({ children }) {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  const surface = surfaceColors(mode);

  return (
    <Box sx={{ backgroundColor: surface.surface, color: text.body, p: 2 }}>
      {children}
    </Box>
  );
};
