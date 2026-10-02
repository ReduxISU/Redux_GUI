/**
 * A singular section of a problem.
 */

import React, { useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { Box } from "@mui/material";
import { Accordion, AccordionContext, Card } from "react-bootstrap";
import { useAccordionButton } from "react-bootstrap/AccordionButton";
import { useThemeMode } from "../ThemeModeContext";
import { surfaceColors, textColors } from "../theme";
import HeaderIconButton from "./HeaderIconButton";

const ORANGE = "#d4441c";

/// Width of the label column (section title in the header, field label in the body) on desktop, so
/// every row's label sits in the same column. On phones the label stacks above its controls.
export const LABEL_COLUMN_WIDTH = 110;

/**
 * Represents the button that triggers the accordion component opening or closing.
 */
function ContextAwareToggle({ eventKey, callback, title }) {
  const { activeEventKey } = useContext(AccordionContext);

  const decoratedOnClick = useAccordionButton(eventKey, () => callback && callback(eventKey));

  const isCurrentEventKey = activeEventKey === eventKey;
  return (
    <HeaderIconButton
      data-tour-toggle=""
      type="button"
      aria-expanded={isCurrentEventKey}
      aria-label={`${isCurrentEventKey ? "Collapse" : "Expand"} ${title} section`}
      onClick={decoratedOnClick}
    >
      <ExpandMoreIcon
        sx={{
          transition: "transform 200ms",
          transform: isCurrentEventKey ? "rotate(180deg)" : "none",
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        }}
      />
    </HeaderIconButton>
  );
}

/**
 * The card itself. An open section shows a 3px orange accent bar down its left edge (this replaces
 * the old orange/grey toggle button as the open/closed cue).
 */
function SectionCard({ children }) {
  const { mode } = useThemeMode();
  const surface = surfaceColors(mode);
  const { activeEventKey } = useContext(AccordionContext);

  return (
    <Card
      style={{
        backgroundColor: surface.surface,
        borderColor: mode === "dark" ? "transparent" : surface.border,
      }}
    >
      {activeEventKey === "0" && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: 3,
            zIndex: 1,
            backgroundColor: ORANGE,
            borderRadius: "var(--bs-card-border-radius) 0 0 var(--bs-card-border-radius)",
          }}
        />
      )}
      {children}
    </Card>
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

  return (
    <div>
      <Accordion
        className="accordion"
        defaultActiveKey={defaultCollapsed ? "1" : "0"}
        style={{ borderColor: mode === "dark" ? "transparent" : undefined }}
      >
        <SectionCard>{children}</SectionCard>
      </Accordion>
    </div>
  );
}

// Below md the title and collapse toggle share the first line and the controls wrap onto the
// next. The inline width Autocomplete carries needs !important to be overridden, leaving room
// beside it for the info/filter icon that follows.
const NARROW = "@media (max-width: 899.95px)";

ProblemSection.Header = function Header({ children, title }) {
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
      <Box
        sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 2, rowGap: 1 }}
      >
        <Box
          sx={{
            order: 1,
            flex: { xs: "1 1 auto", md: `0 0 ${LABEL_COLUMN_WIDTH}px` },
            display: "flex",
            justifyContent: { xs: "flex-start", md: "center" },
            alignItems: "center",
            fontWeight: { xs: 500, md: 400 },
          }}
        >
          {title}
        </Box>
        <Box
          sx={{
            order: { xs: 3, md: 2 },
            flex: { xs: "1 1 100%", md: "1 1 0" },
            minWidth: 0,
            display: "flex",
            flexWrap: { xs: "wrap", md: "nowrap" },
            alignItems: "center",
            gap: 1,
            [NARROW]: { "& .MuiAutocomplete-root": { width: "calc(100% - 52px) !important" } },
          }}
        >
          {children}
        </Box>
        <Box sx={{ order: { xs: 2, md: 3 }, display: "flex" }}>
          <ContextAwareToggle eventKey="0" title={title} />
        </Box>
      </Box>
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
