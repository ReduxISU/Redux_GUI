import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Checkbox, Collapse, FormControlLabel, FormGroup, Typography } from "@mui/material";
import React, { useId, useState } from "react";
import { useThemeMode } from "../ThemeModeContext";
import { textColors } from "../theme";

// Shared hover/focus treatment for anything that should pick up the site's
// orange accent on hover -- a transparent border reserves the same space the
// hover border occupies so nothing shifts when it appears. `:has(:focus-visible)`
// covers keyboard users tabbing to the checkbox nested inside a row/label (which
// never receives focus itself); unlike `:focus-within`, it doesn't leave the
// highlight stuck on after a mouse click.
const hoverHighlightSx = {
  border: "1px solid transparent",
  borderRadius: "6px",
  transition: "background-color 0.15s ease, border-color 0.15s ease",
  "&:hover, &:has(:focus-visible), &:focus-visible": {
    borderColor: "#F47C20",
    backgroundColor: "rgba(244,124,32,0.08)",
  },
};

/**
 * Generic, reusable multi-select checkbox facet. Not specific to any one
 * facet's meaning (complexity class, solver type, visualization type, ...) --
 * pass the option list and it just renders checkboxes and toggles set
 * membership.
 *
 * @param label Facet group heading.
 * @param options `[{key, label, count}]`, the distinct values actually
 * present in the data (not a hardcoded enum list).
 * @param selected `Set` of currently-selected option keys.
 * @param onChange Called with the next `Set` whenever a checkbox is toggled.
 * @param groupBy Opt-in: `(key) => groupLabel | null`. When given, a small
 * subheading is rendered before each new group's first option as the
 * (already-sorted) `options` array is walked, only when the group differs
 * from the previous option's -- e.g. "Classical"/"Quantum" above the
 * Complexity Class facet's options. `null`/undefined for a key renders no
 * subheading before it. Omit entirely for the plain ungrouped list every
 * other facet uses.
 * @param collapsible Opt-in (default `false`): renders the heading as a
 * toggle button that collapses/expands the option list, starting expanded.
 * While collapsed, if any options are selected, the heading shows the count
 * (e.g. "SOLVER TYPE (2)") so the active filter stays visible without the
 * list open. Callers that don't pass this prop keep the plain, always-open
 * heading exactly as before.
 */
export default function FacetFilterGroup({
  label,
  options,
  selected,
  onChange,
  groupBy = null,
  collapsible = false,
}) {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  const [expanded, setExpanded] = useState(true);
  const contentId = useId();

  const toggle = (key) => {
    const next = new Set(selected);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange(next);
  };

  let previousGroup = undefined;

  const checkboxList = (
    <FormGroup>
      {options.length === 0 ? (
        <Typography sx={{ color: text.caption, fontSize: "0.8rem", fontStyle: "italic" }}>
          No values available
        </Typography>
      ) : (
        options.map(({ key, label: optionLabel, count }) => {
          const group = groupBy ? groupBy(key) : null;
          const showGroupHeading = groupBy && group && group !== previousGroup;
          previousGroup = group;

          return (
            <React.Fragment key={key}>
              {showGroupHeading && (
                <Typography
                  sx={{
                    color: text.caption,
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    mt: 0.75,
                    mb: 0.25,
                  }}
                >
                  {group.toUpperCase()}
                </Typography>
              )}
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={selected.has(key)}
                    onChange={() => toggle(key)}
                    sx={{
                      color: text.faint,
                      "&.Mui-checked": { color: "#F47C20" },
                    }}
                  />
                }
                label={
                  <Typography sx={{ color: text.body, fontSize: "0.83rem" }}>
                    {optionLabel}{" "}
                    <Box component="span" sx={{ color: text.caption }}>
                      ({count})
                    </Box>
                  </Typography>
                }
                sx={{
                  ...hoverHighlightSx,
                  width: "100%",
                  boxSizing: "border-box",
                  ml: -1,
                  mr: 0,
                  pl: 1,
                  pr: 1,
                  py: 0.25,
                }}
              />
            </React.Fragment>
          );
        })
      )}
    </FormGroup>
  );

  const headingSx = {
    color: text.heading,
    fontSize: "0.78rem",
    fontWeight: 600,
    letterSpacing: "0.14em",
  };

  const selectedCount = selected?.size ?? 0;
  const headingText =
    collapsible && !expanded && selectedCount > 0
      ? `${label.toUpperCase()} (${selectedCount})`
      : label.toUpperCase();

  return (
    <Box>
      {collapsible ? (
        <Box
          component="button"
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-controls={contentId}
          sx={{
            all: "unset",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 0.5,
            width: "100%",
            boxSizing: "border-box",
            mx: -0.5,
            px: 0.5,
            mb: 0.5,
            ...hoverHighlightSx,
          }}
        >
          <Typography sx={headingSx}>{headingText}</Typography>
          <ExpandMoreIcon
            fontSize="small"
            sx={{
              color: text.caption,
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 0.15s ease",
              flexShrink: 0,
            }}
          />
        </Box>
      ) : (
        <Typography sx={{ ...headingSx, mb: 0.5 }}>{label.toUpperCase()}</Typography>
      )}
      {collapsible ? (
        <Collapse in={expanded} id={contentId}>
          {checkboxList}
        </Collapse>
      ) : (
        checkboxList
      )}
    </Box>
  );
}
