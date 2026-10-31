// Draws one frame of a format=frames picture with the renderer registered for its picture type,
// and the step's caption: what the solver did at this step, in Redux's own words.

import { useThemeMode } from "../../ThemeModeContext";
import { textColors } from "../../theme";
import { pictureStateStyle } from "./pictureStates";
import { hasPictureRenderer, PICTURE_RENDERERS } from "./registry";

const EVENT_TEXT = {
  Try: "Trying",
  Accept: "Kept",
  Reject: "Thrown out",
  Backtrack: "Backed up",
  Done: "Done",
};

export function FrameCaption({ id, frame }) {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  const event = EVENT_TEXT[frame.event];
  const hasVerdict = typeof frame.ok === "boolean";
  const verdictStyle = pictureStateStyle(mode, frame.ok ? "Solution" : "Rejected");
  return (
    <div
      id={id}
      aria-live="polite"
      data-event={frame.event ?? ""}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
        gap: "4px 10px",
        marginBottom: "12px",
        fontSize: "0.95rem",
        color: text.body,
      }}
    >
      {event && (
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: text.secondary,
          }}
        >
          {event}
        </span>
      )}
      <span id={`${id}-text`}>{frame.caption}</span>
      {hasVerdict && (
        <span id={`${id}-verdict`} style={{ fontWeight: 700, color: verdictStyle.text }}>
          {frame.ok ? "Verdict: yes" : "Verdict: no"}
        </span>
      )}
    </div>
  );
}

/**
 * @param {Object} props
 * @param {string} props.idPrefix prefixes every id rendered here
 * @param {string} props.name the visualization's name, for labels
 * @param {string} props.type the response's picture type
 * @param {Object|null} props.payload the response's static part
 * @param {Object|null} props.frame the frame to draw
 * @param {number} props.frameIndex which frame it is
 * @param {number} props.frameCount how many frames the response has
 */
export default function PictureCanvas({
  idPrefix,
  name,
  type,
  payload,
  frame,
  frameIndex,
  frameCount,
}) {
  const { mode } = useThemeMode();
  const Renderer = hasPictureRenderer(type) ? PICTURE_RENDERERS[type] : null;
  const text = textColors(mode);
  if (!Renderer || !frame) {
    return (
      <div id={`${idPrefix}-empty`} style={{ color: text.secondary, textAlign: "center" }}>
        {Renderer ? "No picture for this step." : `This site can't draw ${type} pictures yet.`}
      </div>
    );
  }
  return (
    <div
      id={idPrefix}
      data-picture-type={type}
      data-frame-index={frameIndex}
      style={{ width: "100%", minWidth: 0 }}
    >
      <Renderer
        idPrefix={`${idPrefix}-${type.toLowerCase()}`}
        name={name}
        payload={payload}
        frame={frame}
        frameIndex={frameIndex}
        frameCount={frameCount}
        mode={mode}
      />
    </div>
  );
}
