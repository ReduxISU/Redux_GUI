/**
 * Shows why a Solve or Reduce request failed: the `{ message, hint }` from userFacingError
 * (components/redux/index.js), with the hint on its own line as "Try: ...". Renders nothing when
 * there is no error.
 */
import React from "react";
import { useThemeMode } from "../ThemeModeContext";
import { textColors } from "../theme";

export default function RequestErrorMessage({ error }) {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  if (!error) return null;
  return (
    <p role="alert" style={{ color: text.heading }}>
      {error.message}
      {error.hint ? (
        <>
          <br />
          <span style={{ color: text.body }}>Try: {error.hint}</span>
        </>
      ) : null}
    </p>
  );
}
