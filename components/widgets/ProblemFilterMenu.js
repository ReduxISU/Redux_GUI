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
import { buildFixedOrderFacetOptions } from "../hooks/ProblemFilters/facetOptions";
import { COMPLEXITY_CLASS_LABELS } from "../hooks/ProblemFilters/complexityClassOrder";

// Fixed display order for the Complexity Class facet -- P/NP/NP-Complete/NP-Hard,
// the classical hierarchy in containment order. The quantum classes (BQP/EQP/QMA/
// QCMA/QIP/MIPStar, ReduxISU/Redux#396) are deliberately not offered here: those
// problems are incomparable with this hierarchy (see ComplexityClass's doc comment
// on Interfaces/ComplexityClass.cs) and sort near the bottom of the problem
// dropdown instead (ProblemRowReact.js's COMPLEXITY_CLASS_ORDER), filtered or not.
// Labels come from the shared complexityClassOrder.js map (a superset -- the
// quantum/Unclassified entries it also has just go unused here).
const COMPLEXITY_CLASS_ORDER = ["P", "NP", "NPComplete", "NPHard"];

// Fixed display order for the Problem Type facet, matching Interfaces/ProblemType.cs
// (Unclassified excluded -- every problem has a real declared type as of the Problem
// Type filter menu work; ProblemType_Tests.cs's ratchet pair keeps that true).
const PROBLEM_TYPE_ORDER = [
  "GraphTheory",
  "NetworkDesign",
  "SetsAndPartitions",
  "StorageAndRetrieval",
  "SequencingAndScheduling",
  "MathematicalProgramming",
  "AlgebraAndNumberTheory",
  "GamesAndPuzzles",
  "Logic",
  "AutomataAndLanguages",
  "ProgramOptimization",
  "ComputationalGeometry",
  "Miscellaneous",
];
const PROBLEM_TYPE_LABELS = {
  GraphTheory: "Graph Theory",
  NetworkDesign: "Network Design",
  SetsAndPartitions: "Sets and Partitions",
  StorageAndRetrieval: "Storage and Retrieval",
  SequencingAndScheduling: "Sequencing and Scheduling",
  MathematicalProgramming: "Mathematical Programming",
  AlgebraAndNumberTheory: "Algebra and Number Theory",
  GamesAndPuzzles: "Games and Puzzles",
  Logic: "Logic",
  AutomataAndLanguages: "Automata and Languages",
  ProgramOptimization: "Program Optimization",
  ComputationalGeometry: "Computational Geometry",
  Miscellaneous: "Miscellaneous",
};

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

/**
 * Filter button + popover for the problem dropdown -- lets the user restrict which
 * problems appear by complexity class and/or problem type (subject-matter category,
 * e.g. Graph Theory, Logic, Games and Puzzles). Both facets render in a fixed order
 * (not derived alphabetically from what's present) since each is a small, closed
 * vocabulary -- see COMPLEXITY_CLASS_ORDER / PROBLEM_TYPE_ORDER above.
 */
export default function ProblemFilterMenu({
  problemIndex,
  selectedComplexityClasses,
  setSelectedComplexityClasses,
  selectedProblemTypes,
  setSelectedProblemTypes,
  clearFilters,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const complexityClassOptions = buildFixedOrderFacetOptions(
    problemIndex,
    COMPLEXITY_CLASS_ORDER,
    (tags) => tags.complexityClasses,
    (key) => COMPLEXITY_CLASS_LABELS[key],
  );
  const problemTypeOptions = buildFixedOrderFacetOptions(
    problemIndex,
    PROBLEM_TYPE_ORDER,
    (tags) => [tags.problemType],
    (key) => PROBLEM_TYPE_LABELS[key],
  );

  // #375: every facet actually offered below must count toward the badge and
  // "Clear filters" enablement -- a facet selection that isn't counted here is
  // effectively invisible/unclearable even though it's still filtering results.
  const activeCount = selectedComplexityClasses.size + selectedProblemTypes.size;

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
            title="Complexity Class"
            options={complexityClassOptions}
            selected={selectedComplexityClasses}
            onChange={setSelectedComplexityClasses}
          />

          <Divider sx={{ my: 1.5 }} />

          <FacetGroup
            title="Problem Type"
            options={problemTypeOptions}
            selected={selectedProblemTypes}
            onChange={setSelectedProblemTypes}
          />

          <Button size="small" onClick={clearFilters} disabled={activeCount === 0}>
            Clear filters
          </Button>
        </Box>
      </Popover>
    </>
  );
}
