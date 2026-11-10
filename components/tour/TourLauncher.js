import { Close as CloseIcon, HelpOutlined as HelpIcon } from "@mui/icons-material";
import { Fab, IconButton } from "@mui/material";
import React, { useSyncExternalStore } from "react";
import { startTour } from "./tour";

const TOUR_KEY = "redux.tour.v1";

// "completed": the visitor finished the tour. "dismissed": they closed the Getting started button
// without taking it (#394). Either way the button shrinks to the small "?" that replays the tour.
const COMPLETED = "completed";
const DISMISSED = "dismissed";

let listeners = [];
const subscribe = (listener) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};
const getCompact = () => [COMPLETED, DISMISSED].includes(localStorage.getItem(TOUR_KEY));
const getServerCompact = () => null;

function remember(value) {
  localStorage.setItem(TOUR_KEY, value);
  listeners.forEach((listener) => listener());
}

export default function TourLauncher() {
  const compact = useSyncExternalStore(subscribe, getCompact, getServerCompact);

  const start = () =>
    startTour({
      onDone: (finished) => {
        if (finished) remember(COMPLETED);
      },
    });

  if (compact === null) return null;

  return (
    <span className="corner-button-left">
      {compact ? (
        <Fab
          color="secondary"
          size="medium"
          aria-label="Replay getting started tour"
          onClick={start}
        >
          <HelpIcon />
        </Fab>
      ) : (
        <span style={{ position: "relative", display: "inline-block" }}>
          <Fab color="secondary" variant="extended" onClick={start}>
            <HelpIcon sx={{ mr: 1 }} />
            Getting started
          </Fab>
          <IconButton
            size="small"
            aria-label="Close getting started"
            title="Close (you can still replay the tour with the ? button)"
            onClick={() => remember(DISMISSED)}
            sx={{
              position: "absolute",
              top: -10,
              right: -10,
              p: "2px",
              bgcolor: "background.paper",
              color: "text.primary",
              border: 1,
              borderColor: "divider",
              boxShadow: 1,
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </span>
      )}
    </span>
  );
}
