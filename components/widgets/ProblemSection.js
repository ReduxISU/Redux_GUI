/**
 * A singular section of a problem.
 */

import React from "react";
import { useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Accordion, Card, AccordionContext } from "react-bootstrap";
import { Stack, Button, Box } from "@mui/material";
import { useAccordionButton } from "react-bootstrap/AccordionButton";
import { surfaceColors, textColors } from "../theme";
import { useThemeMode } from "../ThemeModeContext";

/// Default theme.
const THEME = { colors: { grey: "#424242", orange: "#d4441c", white: "#ffffff" } };

/**
 * Represents the button that triggers the accordion component opening or closing.
 */
function ContextAwareToggle({ children, eventKey, callback, colors }) {
  const { activeEventKey } = useContext(AccordionContext);

  const decoratedOnClick = useAccordionButton(eventKey, () => callback && callback(eventKey));

  const isCurrentEventKey = activeEventKey === eventKey;
  return (
    <Button
      data-tour-toggle=""
      sx={{ height: 54, width: 64 }}
      color="white"
      className="float-end"
      type="button"
      style={{
        backgroundColor: isCurrentEventKey ? colors.orange : colors.grey,
      }}
      onClick={decoratedOnClick}
    >
      {children}
    </Button>
  );
}

/**
 * Represents a singular section of the problem.
 *
 * Bootstrap's Card/Card.Header/Card.Body have their own hardcoded CSS
 * (--bs-card-bg etc.) with no idea our MUI theme -- and thus our light/dark
 * toggle -- exists, so without an explicit style override here they stay a
 * fixed white/near-black regardless of mode. Overridden via inline style,
 * which wins over Bootstrap's class-based CSS.
 */
export default function ProblemSection({ children, defaultCollapsed = true }) {
  const { mode } = useThemeMode();
  const surface = surfaceColors(mode);

  return (
    <div>
      <Accordion
        className="accordion"
        defaultActiveKey={defaultCollapsed ? "1" : "0"}
        style={{ borderColor: mode === "dark" ? "transparent" : undefined }}
      >
        <Card
          style={{
            backgroundColor: surface.surface,
            borderColor: mode === "dark" ? "transparent" : surface.border,
          }}
        >
          {children}
        </Card>
      </Accordion>
    </div>
  );
}

ProblemSection.Header = function Header({ children, title, titleWidth }) {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  const surface = surfaceColors(mode);

  return (
    <Card.Header
      style={{
        backgroundColor: surface.surfaceAlt,
        borderColor: mode === "dark" ? "transparent" : surface.border,
        color: text.heading,
      }}
    >
      <Stack direction="row" gap={2} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            width: titleWidth ?? "10%",
            display: "flex",
            justifyContent: "center", // horizontal center
            alignItems: "center",     // vertical center
          }}
        >
          {title}
        </Box>
        {children}
        <ContextAwareToggle eventKey="0" colors={THEME.colors}>
          ▼
        </ContextAwareToggle>
      </Stack>
    </Card.Header>
  );
};


ProblemSection.Body = function Body({ children }) {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  const surface = surfaceColors(mode);

  return (
    <Accordion.Collapse eventKey="0">
      <Card.Body style={{ backgroundColor: surface.surface, color: text.body }}>
        {children}
      </Card.Body>
    </Accordion.Collapse>
  );
};
