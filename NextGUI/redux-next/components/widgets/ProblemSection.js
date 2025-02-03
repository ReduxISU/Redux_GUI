/**
 * A singular section of a problem.
 */

import React from "react";
import { useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Accordion, Card, AccordionContext } from "react-bootstrap";
import { Stack, Button, Box } from "@mui/material";
import { useAccordionButton } from "react-bootstrap/AccordionButton";

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
 */
export default function ProblemSection({ children, defaultCollapsed = true }) {
  return (
    <div>
      <Accordion className="accordion" defaultActiveKey={defaultCollapsed ? "1" : "0"}>
        <Card>{children}</Card>
      </Accordion>
    </div>
  );
}

ProblemSection.Header = function Header({ children, title, titleWidth }) {
  return (
    <Card.Header>
      <Stack direction="row" gap={2}>
        <Box sx={{ width: titleWidth ?? "10%" }}>{title}</Box>
        {children}
        <ContextAwareToggle eventKey="0" colors={THEME.colors}>
          ▼
        </ContextAwareToggle>
      </Stack>
    </Card.Header>
  );
};

ProblemSection.Body = function Body({ children }) {
  return (
    <Accordion.Collapse eventKey="0">
      <Card.Body>{children}</Card.Body>
    </Accordion.Collapse>
  );
};
