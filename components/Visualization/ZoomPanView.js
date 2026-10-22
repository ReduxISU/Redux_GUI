/**
 * ZoomPanView.js
 *
 * Shared zoom/pan wrapper for visualizations. Wrap any rendered visualization and it gains:
 *   - mouse wheel: zoom around the cursor (the page does not scroll while the cursor is over it)
 *   - right-click drag: pan (the browser context menu is suppressed inside the view only)
 *   - two-finger pinch / drag on touch screens (a one-finger swipe still scrolls the page)
 *   - a "Fit / reset view" button
 *
 * Left-click and left-drag are deliberately NOT claimed, so the renderers' own hover, click and
 * drag handling keeps working. The zoom transform is applied as a CSS transform on an inner div
 * rather than inside each renderer's SVG, so renderers need no changes and keep their own
 * coordinate maths (browsers account for the transform when mapping pointer positions).
 *
 * `resetKey` is any value that should put the view back to the fitted state when it changes
 * (e.g. the problem, instance or visualization).
 */

import { CenterFocusStrong as FitIcon } from "@mui/icons-material";
import { Box, IconButton, Tooltip } from "@mui/material";
import * as d3 from "d3";
import { useCallback, useEffect, useRef } from "react";
import { useThemeMode } from "../ThemeModeContext";
import { surfaceColors, textColors } from "../theme";

const MIN_SCALE = 0.25;
const MAX_SCALE = 8;

// Only wheel, right-button drag and multi-finger touch drive the view.
function zoomFilter(event) {
  if (event.type === "wheel") return true;
  if (event.type === "mousedown") return event.button === 2;
  if (event.type === "touchstart") return event.touches.length >= 2;
  return false;
}

export default function ZoomPanView({ children, resetKey }) {
  const { mode } = useThemeMode();
  const surface = surfaceColors(mode);
  const text = textColors(mode);
  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const zoomRef = useRef(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    const zoom = d3
      .zoom()
      .scaleExtent([MIN_SCALE, MAX_SCALE])
      .filter(zoomFilter)
      .on("zoom", (event) => {
        const { x, y, k } = event.transform;
        content.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
      });
    d3.select(viewport).call(zoom).on("dblclick.zoom", null);
    zoomRef.current = zoom;
    return () => d3.select(viewport).on(".zoom", null);
  }, []);

  const reset = useCallback(() => {
    d3.select(viewportRef.current).call(zoomRef.current.transform, d3.zoomIdentity);
  }, []);

  // A different problem/instance/visualization starts from the fitted view again.
  useEffect(() => {
    reset();
  }, [resetKey, reset]);

  return (
    <Box
      ref={viewportRef}
      data-zoom-viewport=""
      onContextMenu={(e) => e.preventDefault()}
      sx={{
        position: "relative",
        overflow: "hidden",
        // Lets a one-finger swipe scroll the page while two-finger gestures reach the zoom handler.
        touchAction: "pan-x pan-y",
      }}
    >
      <Box ref={contentRef} data-zoom-content="" sx={{ transformOrigin: "0 0" }}>
        {children}
      </Box>
      <Tooltip title="Fit / reset view">
        <IconButton
          size="small"
          aria-label="Fit / reset view"
          onClick={reset}
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            color: text.body,
            backgroundColor: surface.surface,
            border: `1px solid ${surface.border}`,
            "&:hover": { backgroundColor: surface.surfaceAltHover },
            "&.Mui-focusVisible": { outline: "2px solid #d4441c", outlineOffset: 2 },
          }}
        >
          <FitIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
