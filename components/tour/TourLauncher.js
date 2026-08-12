import { HelpOutlined as HelpIcon } from "@mui/icons-material";
import { Fab } from "@mui/material";
import React, { useSyncExternalStore } from "react";
import { startTour } from "./tour";

const TOUR_KEY = "redux.tour.v1";

let listeners = [];
const subscribe = (listener) => {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};
const getCompleted = () => localStorage.getItem(TOUR_KEY) === "completed";
const getServerCompleted = () => null;

function markCompleted() {
  localStorage.setItem(TOUR_KEY, "completed");
  listeners.forEach((listener) => listener());
}

export default function TourLauncher() {
  const completed = useSyncExternalStore(subscribe, getCompleted, getServerCompleted);

  const start = () =>
    startTour({
      onDone: (finished) => {
        if (finished) markCompleted();
      },
    });

  const shared = { color: "secondary", className: "corner-button-left", onClick: start };

  return (
    completed !== null &&
    (completed ? (
      <Fab {...shared} size="medium" aria-label="Replay getting started tour">
        <HelpIcon />
      </Fab>
    ) : (
      <Fab {...shared} variant="extended">
        <HelpIcon sx={{ mr: 1 }} />
        Getting started
      </Fab>
    ))
  );
}
