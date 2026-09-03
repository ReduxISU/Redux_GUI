import React from "react";
import { Checkbox, FormControlLabel, FormGroup, Typography, Box } from "@mui/material";

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
 */
export default function FacetFilterGroup({ label, options, selected, onChange }) {
  const toggle = (key) => {
    const next = new Set(selected);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange(next);
  };

  return (
    <Box>
      <Typography
        sx={{
          color: "#111827",
          fontSize: "0.78rem",
          fontWeight: 600,
          letterSpacing: "0.14em",
          mb: 0.5,
        }}
      >
        {label.toUpperCase()}
      </Typography>
      <FormGroup>
        {options.length === 0 ? (
          <Typography sx={{ color: "#6b7280", fontSize: "0.8rem", fontStyle: "italic" }}>
            No values available
          </Typography>
        ) : (
          options.map(({ key, label: optionLabel, count }) => (
            <FormControlLabel
              key={key}
              control={
                <Checkbox
                  size="small"
                  checked={selected.has(key)}
                  onChange={() => toggle(key)}
                  sx={{
                    color: "#9ca3af",
                    "&.Mui-checked": { color: "#F47C20" },
                  }}
                />
              }
              label={
                <Typography sx={{ color: "#374151", fontSize: "0.83rem" }}>
                  {optionLabel} <Box component="span" sx={{ color: "#6b7280" }}>({count})</Box>
                </Typography>
              }
            />
          ))
        )}
      </FormGroup>
    </Box>
  );
}
