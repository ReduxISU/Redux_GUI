import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Popover,
  Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import { buildFacetOptions } from "../hooks/ProblemFilters/facetOptions";

function toggle(set, key) {
  const next = new Set(set);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  return next;
}

function FacetGroup({ title, options, selected, onChange }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <FormGroup>
        {options.length === 0 ? (
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
            No values available
          </Typography>
        ) : (
          options.map(({ key, label, count }) => (
            <FormControlLabel
              key={key}
              control={
                <Checkbox
                  size="small"
                  checked={selected.has(key)}
                  onChange={() => onChange(toggle(selected, key))}
                />
              }
              label={
                <Typography variant="body2">
                  {label} <Box component="span" sx={{ color: "text.secondary" }}>({count})</Box>
                </Typography>
              }
            />
          ))
        )}
      </FormGroup>
    </Box>
  );
}

/**
 * Filter button + popover for the problem dropdown -- lets the user restrict
 * which problems appear by complexity class and/or solver Big-O bucket
 * (worst-case complexity of any solver the problem has). Facet option lists
 * are derived from `problemIndex` (see `useProblemIndex`), so only values
 * actually present show up.
 */
export default function ProblemFilterMenu({
  problemIndex,
  selectedComplexityClasses,
  setSelectedComplexityClasses,
  selectedSolverComplexityBuckets,
  setSelectedSolverComplexityBuckets,
  clearFilters,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const complexityClassOptions = buildFacetOptions(problemIndex, (tags) => [tags.complexityClass]);
  const solverComplexityBucketOptions = buildFacetOptions(
    problemIndex,
    (tags) => tags.solverComplexityBuckets,
  );

  const activeCount = selectedComplexityClasses.size + selectedSolverComplexityBuckets.size;

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={activeCount} color="secondary">
          <FilterListIcon fontSize="medium" />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disableRestoreFocus
      >
        <Box sx={{ p: 2, minWidth: 240, maxWidth: 320 }}>
          <FacetGroup
            title="Complexity class"
            options={complexityClassOptions}
            selected={selectedComplexityClasses}
            onChange={setSelectedComplexityClasses}
          />

          <Divider sx={{ my: 1.5 }} />

          <FacetGroup
            title="Solver Big-O (worst case)"
            options={solverComplexityBucketOptions}
            selected={selectedSolverComplexityBuckets}
            onChange={setSelectedSolverComplexityBuckets}
          />

          <Button size="small" onClick={clearFilters} disabled={activeCount === 0}>
            Clear filters
          </Button>
        </Box>
      </Popover>
    </>
  );
}
