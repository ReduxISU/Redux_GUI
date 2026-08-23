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
import { buildFacetOptions, buildGroupedFacetOptions } from "../hooks/ProblemFilters/facetOptions";
import { visualizationTypeCategory } from "../Visualization/svgs/visualizationCategories";

function toggle(set, key) {
  const next = new Set(set);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  return next;
}

function FacetCheckbox({ optionKey, label, count, selected, onChange }) {
  return (
    <FormControlLabel
      key={optionKey}
      control={
        <Checkbox
          size="small"
          checked={selected.has(optionKey)}
          onChange={() => onChange(toggle(selected, optionKey))}
        />
      }
      label={
        <Typography variant="body2">
          {label} <Box component="span" sx={{ color: "text.secondary" }}>({count})</Box>
        </Typography>
      }
    />
  );
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
            <FacetCheckbox
              key={key}
              optionKey={key}
              label={label}
              count={count}
              selected={selected}
              onChange={onChange}
            />
          ))
        )}
      </FormGroup>
    </Box>
  );
}

// Same as FacetGroup, but options are pre-grouped under a coarser display category
// (see buildGroupedFacetOptions) -- each category gets its own subheading, and its
// options render underneath. Selecting a checkbox still toggles the raw option key,
// same as FacetGroup.
function GroupedFacetGroup({ title, groups, selected, onChange }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      {groups.length === 0 ? (
        <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
          No values available
        </Typography>
      ) : (
        groups.map(({ category, options }) => (
          <Box key={category} sx={{ mb: 0.75, ml: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 600, display: "block" }}
            >
              {category}
            </Typography>
            <FormGroup>
              {options.map(({ key, label, count }) => (
                <FacetCheckbox
                  key={key}
                  optionKey={key}
                  label={label}
                  count={count}
                  selected={selected}
                  onChange={onChange}
                />
              ))}
            </FormGroup>
          </Box>
        ))
      )}
    </Box>
  );
}

/**
 * Filter button + popover for the problem dropdown -- lets the user restrict
 * which problems appear by complexity class, solver Big-O bucket (worst-case
 * complexity of any solver the problem has), and/or visualization type (#379).
 * Facet option lists are derived from `problemIndex` (see `useProblemIndex`), so
 * only values actually present show up.
 */
export default function ProblemFilterMenu({
  problemIndex,
  selectedComplexityClasses,
  setSelectedComplexityClasses,
  selectedSolverComplexityBuckets,
  setSelectedSolverComplexityBuckets,
  selectedVisualizationTypes,
  setSelectedVisualizationTypes,
  clearFilters,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const complexityClassOptions = buildFacetOptions(problemIndex, (tags) => [tags.complexityClass]);
  const solverComplexityBucketOptions = buildFacetOptions(
    problemIndex,
    (tags) => tags.solverComplexityBuckets,
  );
  // Grouped by the #378 simplified categories (e.g. GraphD3/GraphLaTeX -> "Graph")
  // for display; the underlying checkbox options are still the raw visualizationType
  // wire values, so selecting one still matches `tags.visualizationTypes` exactly
  // like the other facets -- see buildGroupedFacetOptions' own comment.
  const visualizationTypeGroups = buildGroupedFacetOptions(
    problemIndex,
    (tags) => tags.visualizationTypes,
    visualizationTypeCategory,
  );

  // #375: every facet actually offered below must count toward the badge and
  // "Clear filters" enablement -- a facet selection that isn't counted here is
  // effectively invisible/unclearable even though it's still filtering results.
  const activeCount =
    selectedComplexityClasses.size +
    selectedSolverComplexityBuckets.size +
    selectedVisualizationTypes.size;

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

          <Divider sx={{ my: 1.5 }} />

          <GroupedFacetGroup
            title="Visualization type"
            groups={visualizationTypeGroups}
            selected={selectedVisualizationTypes}
            onChange={setSelectedVisualizationTypes}
          />

          <Button size="small" onClick={clearFilters} disabled={activeCount === 0}>
            Clear filters
          </Button>
        </Box>
      </Popover>
    </>
  );
}
