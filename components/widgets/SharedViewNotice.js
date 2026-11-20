/**
 * The banner over the main page that says a shared link was just opened (#281): what was
 * restored, anything in the link that couldn't be, and that nothing has run yet. It also shows
 * why a link couldn't be opened at all.
 */
import { Alert } from "@mui/material";
import React from "react";

export default function SharedViewNotice({ notice, held, onDismiss }) {
  if (!notice) return null;

  if (notice.kind === "error") {
    return (
      <Alert severity="warning" onClose={onDismiss} data-testid="shared-view-notice">
        {notice.message}
      </Alert>
    );
  }

  return (
    <Alert severity="info" onClose={onDismiss} data-testid="shared-view-notice">
      Opened a shared view.{" "}
      {held
        ? "Nothing has been run yet: press Solve, Verify, Reduce or Show pictures when you are ready."
        : ""}
      {notice.notes?.length ? (
        <ul style={{ margin: "4px 0 0", paddingLeft: "20px" }}>
          {notice.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </Alert>
  );
}
