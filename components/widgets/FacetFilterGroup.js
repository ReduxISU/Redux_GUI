import React from "react";
import { Checkbox, FormControlLabel, FormGroup, Typography, Box } from "@mui/material";
import { textColors } from "../theme";
import { useThemeMode } from "../ThemeModeContext";

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
 * @param scrollable Opt-in: when true, the checkbox list scrolls within a
 * fixed-height container instead of growing the sidebar as more options
 * exist. Off by default since this component is reused by facets with only a
 * handful of options (e.g. Visualization Type) where scrolling would be
 * pointless chrome -- callers with long/unbounded option lists (Complexity
 * Class, Solver Type) opt in explicitly.
 * @param groupBy Opt-in: `(key) => groupLabel | null`. When given, a small
 * subheading is rendered before each new group's first option as the
 * (already-sorted) `options` array is walked, only when the group differs
 * from the previous option's -- e.g. "Classical"/"Quantum" above the
 * Complexity Class facet's options. `null`/undefined for a key renders no
 * subheading before it. Omit entirely for the plain ungrouped list every
 * other facet uses.
 */
export default function FacetFilterGroup({
  label,
  options,
  selected,
  onChange,
  scrollable = false,
  groupBy = null,
}) {
  const { mode } = useThemeMode();
  const text = textColors(mode);

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
                    {optionLabel} <Box component="span" sx={{ color: text.caption }}>({count})</Box>
                  </Typography>
                }
              />
            </React.Fragment>
          );
        })
      )}
    </FormGroup>
  );

  return (
    <Box>
      <Typography
        sx={{
          color: text.heading,
          fontSize: "0.78rem",
          fontWeight: 600,
          letterSpacing: "0.14em",
          mb: 0.5,
        }}
      >
        {label.toUpperCase()}
      </Typography>
      {scrollable ? (
        <Box sx={{ maxHeight: "200px", overflowY: "auto" }}>{checkboxList}</Box>
      ) : (
        checkboxList
      )}
    </Box>
  );
}
