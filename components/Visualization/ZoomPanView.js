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

// Room left around a fitted picture, in the picture's own units, so outlines and labels at the
// edge aren't cut.
const FIT_PADDING = 16;
// The tallest a fitted picture gets, as a share of the window's height.
const MAX_HEIGHT_SHARE = 0.75;
const MIN_HEIGHT_PX = 200;

// The attributes fitPictures sets; changes to these alone don't call for another fit.
const FIT_ATTRIBUTES = new Set(["viewBox", "preserveAspectRatio", "width", "height", "style"]);

const isPictureSvg = (svg) =>
  !svg.classList.contains("MuiSvgIcon-root") && !svg.classList.contains("MuiCircularProgress-svg");

/**
 * Fits each picture to the pane: the renderers draw into a fixed-size viewBox pinned to its left
 * edge (a force layout centred on a fixed point, say), so a large picture was cut off on the left
 * or right and a small one sat off to one side. The drawing svg's viewBox becomes the box around
 * what is actually drawn, centred, and the picture takes the pane's full width, as tall as its
 * shape needs up to MAX_HEIGHT_SHARE of the window. Pictures without a viewBox are left alone.
 * Returns nothing; safe to call again whenever the drawing changes.
 */
function fitPictures(viewport, content) {
  const paneWidth = viewport.clientWidth; // untransformed by the zoom, unlike getBoundingClientRect
  if (!paneWidth) return;
  const outer = [...content.querySelectorAll("svg")].find(
    (svg) => isPictureSvg(svg) && !svg.parentElement.closest("svg"),
  );
  if (!outer) return;
  const drawing = [outer, ...outer.querySelectorAll("svg")].find(
    (svg) => isPictureSvg(svg) && svg.hasAttribute("viewBox"),
  );
  if (!drawing) return;
  let box;
  try {
    box = drawing.getBBox();
  } catch {
    return; // not rendered (e.g. inside a collapsed section)
  }
  if (!box.width || !box.height) return;
  const viewBox = [
    box.x - FIT_PADDING,
    box.y - FIT_PADDING,
    box.width + 2 * FIT_PADDING,
    box.height + 2 * FIT_PADDING,
  ].map((n) => Math.round(n * 10) / 10);
  const viewBoxText = viewBox.join(" ");
  if (drawing.getAttribute("viewBox") !== viewBoxText) drawing.setAttribute("viewBox", viewBoxText);
  drawing.setAttribute("preserveAspectRatio", "xMidYMid meet");
  if (drawing !== outer) {
    drawing.setAttribute("width", "100%");
    drawing.setAttribute("height", "100%");
  }
  const maxHeight = Math.max(MIN_HEIGHT_PX, window.innerHeight * MAX_HEIGHT_SHARE);
  const height = Math.min(maxHeight, (paneWidth * viewBox[3]) / viewBox[2]);
  outer.style.width = "100%";
  outer.style.height = `${Math.round(height)}px`;
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

  // Keeps the picture fitted to the pane as it is drawn (a force layout moves for a while after it
  // appears), redrawn, or the pane is resized. At most one fit per animation frame.
  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    let frame = 0;
    const scheduleFit = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        fitPictures(viewport, content);
      });
    };
    scheduleFit();
    const mutations = new MutationObserver((records) => {
      // Our own viewBox and size changes would otherwise call for another fit forever.
      if (records.some((r) => !(r.type === "attributes" && FIT_ATTRIBUTES.has(r.attributeName)))) {
        scheduleFit();
      }
    });
    mutations.observe(content, { subtree: true, childList: true, attributes: true });
    const resizes = new ResizeObserver(scheduleFit);
    resizes.observe(viewport);
    window.addEventListener("resize", scheduleFit);
    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      resizes.disconnect();
      window.removeEventListener("resize", scheduleFit);
    };
  }, []);

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
        // Room above the picture for the Fit button, so it never covers part of the drawing.
        pt: "40px",
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
