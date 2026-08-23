import { driver } from "driver.js";
import { TOUR_STEPS } from "./steps";
import { applyPopoverA11y, rememberFocus, restoreFocus } from "./tourA11y";

function toggleRow(selector, open) {
  const row = document.querySelector(selector);
  const body = row?.querySelector(".accordion-collapse");
  const toggled = Boolean(body) && body.classList.contains("show") !== open;
  if (toggled) row.querySelector("[data-tour-toggle]")?.click();
  return toggled;
}

export function startTour({ onDone } = {}) {
  rememberFocus();
  const expanded = new Set();
  let lastIndex = 0;

  const withExpansion = (step) => ({
    ...step,
    onHighlightStarted: () => {
      if (toggleRow(step.element, true)) {
        expanded.add(step.element);
        setTimeout(() => tour.refresh(), 400);
      }
    },
  });

  const tour = driver({
    showProgress: true,
    disableActiveInteraction: true,
    overlayOpacity: 0.6,
    stagePadding: 8,
    doneBtnText: "Done",
    onPopoverRender: applyPopoverA11y,
    onHighlighted: () => {
      lastIndex = tour.getActiveIndex() ?? lastIndex;
    },
    onDestroyed: () => {
      expanded.forEach((selector) => toggleRow(selector, false));
      restoreFocus();
      onDone?.(lastIndex === TOUR_STEPS.length - 1);
    },
    steps: TOUR_STEPS.map(({ expandRow, ...step }) => (expandRow ? withExpansion(step) : step)),
  });

  tour.drive();
}
