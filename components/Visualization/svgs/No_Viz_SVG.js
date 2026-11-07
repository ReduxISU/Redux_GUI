import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import { Card, CircularProgress, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import React, { useEffect, useState } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { useThemeMode } from "../../ThemeModeContext";
import { textColors } from "../../theme";

export function No_Viz_Svg({ niceProblemName }) {
  const { mode } = useThemeMode();
  const textColor = textColors(mode).heading;
  return (
    <Box>
      <Card
        variant="outlined"
        sx={{
          bgcolor: "primary.lGray",
          boxShadow: 1,
          borderRadius: 2,
          p: 2,
          minWidth: 300,
        }}
      >
        <ErrorOutlineIcon fontSize="large"></ErrorOutlineIcon>

        {/* <h1 style={{color: "orange"}}> No visualization is Currently implemented!</h1>
                <p>No visualization is Currently Implemented!</p> */}
        <Typography
          variant="h4"
          component="h4"
          style={{ color: textColor, fontWeight: "normal", textAlign: "center" }}
        >
          The {niceProblemName} visualization has not been implemented yet
        </Typography>
      </Card>
    </Box>
  );
}

export function No_Reduction_Viz_Svg({ niceReductionName }) {
  const { mode } = useThemeMode();
  const textColor = textColors(mode).heading;
  return (
    <Box>
      <Card
        variant="outlined"
        sx={{
          bgcolor: "primary.lGray",
          boxShadow: 1,
          borderRadius: 2,
          p: 2,
          minWidth: 300,
        }}
      >
        <ErrorOutlineIcon fontSize="large"></ErrorOutlineIcon>
        <Typography
          variant="h4"
          component="h4"
          style={{
            color: textColor,
            fontWeight: "normal",
            textAlign: "center",
          }}
        >
          The {niceReductionName ?? "chosen reduction"} visualization has not been implemented yet
        </Typography>
      </Card>
    </Box>
  );
}

// How long a load may take before "Loading..." appears. Most pictures arrive sooner, and showing
// the note for a moment and then the picture would just flash; until then the pane stays empty
// (never the previous picture).
const LOADING_DELAY_MS = 300;

// The card every state below is drawn in, so loading, failed and "no picture" look alike.
function StateCard({ children }) {
  return (
    <Card
      variant="outlined"
      sx={{
        bgcolor: "primary.lGray",
        boxShadow: 1,
        borderRadius: 2,
        p: 2,
        minWidth: 300,
      }}
    >
      {children}
    </Card>
  );
}

/**
 * Shown in place of a picture while it, or anything it needs (the list of pictures, the picture's
 * type, the solve or reduction it is drawn from), is being fetched, so the previous picture is
 * never left on screen after a switch and the pane is never blank.
 */
export function Loading_Viz_Svg() {
  const { mode } = useThemeMode();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShown(true), LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box role="status">
      {shown && (
        <StateCard>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
            <CircularProgress size={28} />
            <Typography
              variant="h4"
              component="p"
              style={{ color: textColors(mode).heading, fontWeight: "normal" }}
            >
              Loading...
            </Typography>
          </Box>
        </StateCard>
      )}
    </Box>
  );
}

/**
 * Shown when a picture could not be drawn because something failed: a request for it or for
 * anything it needs failed or got no answer, or its renderer crashed. Under the main line,
 * `step` says which step failed and for which problem, visualization or reduction, and `detail`
 * what happened (HTTP status and server error text, no answer, or the exception message), so
 * the failure can be acted on.
 */
export function Failed_Viz_Svg({ step, detail }) {
  const { mode } = useThemeMode();
  const colors = textColors(mode);
  return (
    <Box role="alert">
      <StateCard>
        <ErrorOutlineIcon fontSize="large"></ErrorOutlineIcon>
        <Typography
          variant="h4"
          component="p"
          style={{ color: colors.heading, fontWeight: "normal", textAlign: "center" }}
        >
          Failed to Visualize
        </Typography>
        {step && (
          <Typography
            variant="body2"
            style={{ color: colors.body, textAlign: "center", marginTop: 8 }}
          >
            {step}
          </Typography>
        )}
        {detail && (
          <Typography
            variant="body2"
            style={{ color: colors.body, textAlign: "center", overflowWrap: "anywhere" }}
          >
            {detail}
          </Typography>
        )}
      </StateCard>
    </Box>
  );
}

/**
 * Shown when the backend answered, but with nothing to draw, for the current problem or reduction
 * (or the problem has no picture at all). This is an expected state, not a failure.
 */
export function No_Picture_Viz_Svg({ niceProblemName, reduction }) {
  const { mode } = useThemeMode();
  const textColor = textColors(mode).heading;
  const what = reduction ? "reduction" : (niceProblemName ?? "");
  return (
    <Box>
      <Card
        variant="outlined"
        sx={{
          bgcolor: "primary.lGray",
          boxShadow: 1,
          borderRadius: 2,
          p: 2,
          minWidth: 300,
        }}
      >
        <ErrorOutlineIcon fontSize="large"></ErrorOutlineIcon>
        <Typography
          variant="h4"
          component="h4"
          style={{
            color: textColor,
            fontWeight: "normal",
            textAlign: "center",
          }}
        >
          No {what} picture is available for this instance.
        </Typography>
      </Card>
    </Box>
  );
}

/**
 * Shown when a declared `visualizationType` has no renderer registered for it (the "no
 * renderer" case, distinct from a renderer that crashed -- see Viz_Render_Error_Svg). Names the
 * TYPE, not the problem or reduction, since that's the actual missing piece; `niceProblemName`
 * / `niceReductionName` are shown as extra context when available.
 */
export function No_Renderable_Viz_Svg({ niceProblemName, niceReductionName, visualizationType }) {
  const { mode } = useThemeMode();
  const textColor = textColors(mode).heading;
  const contextName = niceReductionName ?? niceProblemName;
  return (
    <Box>
      <Card
        variant="outlined"
        sx={{
          bgcolor: "primary.lGray",
          boxShadow: 1,
          borderRadius: 2,
          p: 2,
          minWidth: 300,
        }}
      >
        <ErrorOutlineIcon fontSize="large"></ErrorOutlineIcon>
        <Typography
          variant="h4"
          component="h4"
          style={{
            color: textColor,
            fontWeight: "normal",
            textAlign: "center",
          }}
        >
          {contextName ? `${contextName} declares` : "This visualization declares"} type &quot;
          {visualizationType || "unknown"}&quot;, which this interface can&apos;t render.
        </Typography>
      </Card>
    </Box>
  );
}

/**
 * Shown when a visualization DOES have a registered renderer, but that renderer threw while
 * rendering -- the "renderer crashed" case, distinct from "no renderer" (No_Renderable_Viz_Svg).
 * Previously both cases were reported identically as "not implemented yet", which hid real
 * bugs behind a missing-feature message. It reads "Failed to Visualize" like any other failure,
 * naming the type (and visualization) whose renderer crashed and the exception message.
 */
export function Viz_Render_Error_Svg({
  niceProblemName,
  niceReductionName,
  visualizationName,
  visualizationType,
  error,
}) {
  const contextName = niceReductionName ?? niceProblemName;
  const which = visualizationName ? `, visualization ${visualizationName}` : "";
  return (
    <Failed_Viz_Svg
      step={`${contextName ? `The ${contextName}` : "This"} visualization (type "${
        visualizationType || "unknown"
      }"${which}) failed to render.`}
      detail={`${error?.name ?? "Error"}: ${error?.message ?? String(error)} (see the console for the stack).`}
    />
  );
}
