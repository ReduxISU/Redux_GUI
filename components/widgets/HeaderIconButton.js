/**
 * The small icon buttons in a section header (info, filter, drag handle, collapse toggle) share one
 * look: transparent, a subtle hover fill, a visible keyboard focus ring and a 44px touch target on
 * phones. Pass `sx` to add to it.
 */

import { IconButton } from "@mui/material";
import { forwardRef } from "react";
import { useThemeMode } from "../ThemeModeContext";
import { textColors } from "../theme";

const FOCUS_RING = "#d4441c";

const HeaderIconButton = forwardRef(function HeaderIconButton({ sx, ...props }, ref) {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  const hover = mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.07)";

  return (
    <IconButton
      ref={ref}
      {...props}
      sx={{
        width: { xs: 44, md: 36 },
        height: { xs: 44, md: 36 },
        flexShrink: 0,
        color: text.body,
        backgroundColor: "transparent",
        transition: "background-color 150ms",
        "&:hover": { backgroundColor: hover },
        "&:focus-visible": { outline: `2px solid ${FOCUS_RING}`, outlineOffset: 1 },
        ...sx,
      }}
    />
  );
});

export default HeaderIconButton;
