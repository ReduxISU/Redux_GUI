let previousFocus = null;

export function rememberFocus() {
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
}

export function restoreFocus() {
  if (previousFocus?.isConnected) previousFocus.focus();
  previousFocus = null;
}

const focusableButtons = (wrapper) =>
  [...wrapper.querySelectorAll("button")].filter(
    (button) => !button.disabled && button.offsetParent !== null,
  );

function trapTab(event) {
  const wrapper = event.currentTarget;
  const buttons = event.key === "Tab" ? focusableButtons(wrapper) : [];
  if (buttons.length) {
    const edge = event.shiftKey ? buttons[0] : buttons[buttons.length - 1];
    const wrapTo = event.shiftKey ? buttons[buttons.length - 1] : buttons[0];
    const active = document.activeElement;
    if (active === edge || !wrapper.contains(active)) {
      event.preventDefault();
      wrapTo.focus();
    }
  }
}

export function applyPopoverA11y(popover) {
  const { wrapper, title, description, nextButton } = popover;
  title.id = "driver-popover-title";
  description.id = "driver-popover-description";
  wrapper.setAttribute("role", "dialog");
  wrapper.setAttribute("aria-modal", "true");
  wrapper.setAttribute("aria-labelledby", title.id);
  wrapper.setAttribute("aria-describedby", description.id);
  wrapper.tabIndex = -1;
  if (!wrapper.dataset.a11yBound) {
    wrapper.dataset.a11yBound = "true";
    wrapper.addEventListener("keydown", trapTab);
  }
  const target = nextButton.offsetParent !== null ? nextButton : wrapper;
  target.focus({ preventScroll: true });
}
