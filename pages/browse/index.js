import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  COMPLEXITY_CLASS_ORDER,
  complexityClassLabel,
  complexityClassRank,
} from "../../components/hooks/ProblemFilters/complexityClassOrder";
import { buildFacetOptions } from "../../components/hooks/ProblemFilters/facetOptions";
import {
  PROBLEM_TYPE_ORDER,
  problemTypeLabel,
} from "../../components/hooks/ProblemFilters/problemTypeOrder";
import {
  solverComplexityLabel,
  solverComplexityRank,
} from "../../components/hooks/ProblemFilters/solverComplexityOrder";
import { solverTypeLabel } from "../../components/hooks/ProblemFilters/tagLabels";
import { useProblemFilters } from "../../components/hooks/ProblemFilters/useProblemFilters";
import { useProblemIndex } from "../../components/hooks/ProblemFilters/useProblemIndex";
import { useThemeMode } from "../../components/ThemeModeContext";
import { pageBackground, sectionCardSx, surfaceColors, textColors } from "../../components/theme";
import { ALL_VISUALIZATIONS_KEY } from "../../components/Visualization/svgs/visualizationCategories";
import ActiveFilterSummary from "../../components/widgets/ActiveFilterSummary";
import FacetFilterGroup from "../../components/widgets/FacetFilterGroup";
import ProblemCard from "../../components/widgets/ProblemCard";
import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
import SearchBarExtensible from "../../components/widgets/SearchBarExtensible";

const reduxBaseUrl = "/api/redux/";

export default function BrowsePage() {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  const surface = surfaceColors(mode);
  // Browse's sidebar/empty-state card is denser than a full content page's
  // section card, so it overrides padding -- everything else (color, hover)
  // stays shared.
  const theSectionCard = { ...sectionCardSx(mode), padding: { xs: 2, md: 2.5 } };

  // Filters sidebar collapse state (#325). Starts expanded on both server and client's first
  // render -- identical output on both sides avoids a hydration mismatch -- then, once mounted,
  // an effect corrects it to collapsed on small screens (`useMediaQuery` itself reports the SSR
  // default on that very first client render too, so this only takes effect after the real
  // media-query result is known). `userToggledFilters` stops that correction from fighting a
  // manual toggle: once the visitor has clicked the toggle, a later resize/breakpoint change no
  // longer overrides their choice.
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const userToggledFilters = useRef(false);
  useEffect(() => {
    if (!userToggledFilters.current) {
      setFiltersExpanded(!isSmallScreen);
    }
  }, [isSmallScreen]);
  const toggleFiltersExpanded = () => {
    userToggledFilters.current = true;
    setFiltersExpanded((current) => !current);
  };

  const { problemIndex, reductionGraph, loading } = useProblemIndex(reduxBaseUrl);
  const {
    selectedComplexityClasses,
    setSelectedComplexityClasses,
    selectedSolverTypes,
    setSelectedSolverTypes,
    selectedSolverComplexities,
    setSelectedSolverComplexities,
    selectedProblemTypes,
    setSelectedProblemTypes,
    selectedVisualizationTypes,
    setSelectedVisualizationTypes,
    reachabilitySource,
    setReachabilitySource,
    reachabilityMode,
    setReachabilityMode,
    filteredProblems,
    clearFilters,
  } = useProblemFilters(problemIndex, reductionGraph);

  // Classical-then-quantum, low-to-high (complexityClassOrder.js) rather than
  // alphabetical -- same ranking the results grid and the problem-picker dropdown
  // already sort by. Labels via complexityClassLabel so the checkboxes read
  // "NP-Complete"/"NP-Hard" rather than the raw "NPComplete"/"NPHard" wire values.
  //
  // tags.complexityClasses (the NP-Complete/NP-Hard-implies-NP expanded Set from
  // useProblemIndex), not tags.complexityClass (the single raw declared value) --
  // direct project-owner instruction: "NP (n)" should count every problem checking
  // that box actually returns (NP-Complete and NP-Hard problems included, alongside
  // anything declared bare "NP"), not just the ones declared bare "NP". Using the
  // same expanded Set the filter itself already intersects against keeps this count
  // and the filter's real behavior from silently drifting apart.
  const complexityClassOptions = useMemo(
    () =>
      buildFacetOptions(
        problemIndex,
        (tags) => tags.complexityClasses,
        (a, b) => complexityClassRank(a) - complexityClassRank(b),
        complexityClassLabel,
      ),
    [problemIndex],
  );
  // Unlisted values (e.g. the "Unclassified" fallback) sort after the known taxonomy.
  const problemTypeRank = (value) => {
    const rank = PROBLEM_TYPE_ORDER.indexOf(value);
    return rank === -1 ? PROBLEM_TYPE_ORDER.length : rank;
  };
  // Problem Type gets its own facet so a filter applied by clicking a card's Problem
  // Type chip is visible and can be unchecked here, like every other chip-driven
  // filter. Ordered by the problemTypeOrder.js taxonomy rather than alphabetically.
  const problemTypeOptions = useMemo(
    () =>
      buildFacetOptions(
        problemIndex,
        (tags) => [tags.problemType],
        (a, b) => problemTypeRank(a) - problemTypeRank(b),
        problemTypeLabel,
      ),
    [problemIndex],
  );
  // Labels via solverTypeLabel so the checkboxes read "Brute Force"/"Breadth First
  // Search" rather than the raw "BruteForce"/"BreadthFirstSearch" wire values.
  const solverTypeOptions = useMemo(
    () => buildFacetOptions(problemIndex, (tags) => tags.solverTypes, undefined, solverTypeLabel),
    [problemIndex],
  );
  // Best-to-worst growth (solverComplexityOrder.js) rather than alphabetical --
  // same sorted-fixed-vocabulary pattern as complexityClassOptions above.
  const solverComplexityOptions = useMemo(
    () =>
      buildFacetOptions(
        problemIndex,
        (tags) => tags.solverComplexities,
        (a, b) => solverComplexityRank(a) - solverComplexityRank(b),
        solverComplexityLabel,
      ),
    [problemIndex],
  );
  // visualizationCategories, not the raw visualizationTypes -- several raw renderer
  // values collapse to the same category (GraphD3 + GraphLaTeX -> "Graph"), and
  // building from the raw set would produce two checkboxes both reading "Graph"
  // instead of one with the combined count. See visualizationCategories.js.
  // "All Visualizations" is prepended as a synthetic option (ALL_VISUALIZATIONS_KEY,
  // handled specially in useProblemFilters) rather than a real category, so it's
  // built here instead of via buildFacetOptions. useProblemIndex's "Unimplemented"
  // sentinel stays an ordinary option (unlike the ProblemCard chip list below, which
  // strips it) so every "No visualizations" card can still be found.
  const visualizationTypeOptions = useMemo(() => {
    const categoryOptions = buildFacetOptions(problemIndex, (tags) => tags.visualizationCategories);
    const renderableCount = [...problemIndex.values()].filter(
      (tags) => tags.hasRenderableVisualization,
    ).length;
    return [
      { key: ALL_VISUALIZATIONS_KEY, label: "All Visualizations", count: renderableCount },
      ...categoryOptions,
    ];
  }, [problemIndex]);

  // Clicking a chip on a card toggles that value in the matching sidebar facet
  // selection -- same effect as checking/unchecking it in FacetFilterGroup.
  // Sets store raw wire values (e.g. "NPComplete"), so these take the chip's
  // raw value, not its display label.
  const toggleComplexityClassFilter = (value) => {
    setSelectedComplexityClasses((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };
  const toggleSolverTypeFilter = (value) => {
    setSelectedSolverTypes((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };
  const toggleProblemTypeFilter = (value) => {
    setSelectedProblemTypes((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };
  const toggleVisualizationTypeFilter = (value) => {
    setSelectedVisualizationTypes((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const problemNames = useMemo(() => [...problemIndex.keys()].sort(), [problemIndex]);
  const problemNameMap = useMemo(
    () => new Map(problemNames.map((name) => [name, problemIndex.get(name)?.displayName ?? name])),
    [problemNames, problemIndex],
  );

  // Every active filter across every facet, counted and labeled for the "Clear
  // Filters (n)" button and the "problems matching:" heading below.
  const activeFilterTags = useMemo(() => {
    const visualizationTypeLabel = (value) =>
      value === ALL_VISUALIZATIONS_KEY ? "All Visualizations" : value;
    return [
      ...[...selectedComplexityClasses].map(complexityClassLabel),
      ...[...selectedSolverTypes].map(solverTypeLabel),
      ...[...selectedSolverComplexities].map(solverComplexityLabel),
      ...[...selectedProblemTypes].map(problemTypeLabel),
      ...[...selectedVisualizationTypes].map(visualizationTypeLabel),
      ...(reachabilitySource
        ? [`Reachable from ${problemNameMap.get(reachabilitySource) ?? reachabilitySource}`]
        : []),
    ];
  }, [
    selectedComplexityClasses,
    selectedSolverTypes,
    selectedSolverComplexities,
    selectedProblemTypes,
    selectedVisualizationTypes,
    reachabilitySource,
    problemNameMap,
  ]);

  // The same active filters, grouped the way they combine (see ActiveFilterSummary): groups AND
  // together, values inside a group OR together, and Solver Type + Solver Complexity form one
  // group when both are set because a single solver has to match both.
  const filterGroups = useMemo(() => {
    const visualizationTypeLabel = (value) =>
      value === ALL_VISUALIZATIONS_KEY ? "All Visualizations" : value;
    const part = (label, selected, toLabel) => ({ label, values: [...selected].map(toLabel) });
    const groups = [];
    if (selectedComplexityClasses.size > 0) {
      groups.push({
        key: "complexityClass",
        parts: [part("Complexity class", selectedComplexityClasses, complexityClassLabel)],
      });
    }
    if (selectedProblemTypes.size > 0) {
      groups.push({
        key: "problemType",
        parts: [part("Problem type", selectedProblemTypes, problemTypeLabel)],
      });
    }
    if (selectedSolverTypes.size > 0 && selectedSolverComplexities.size > 0) {
      groups.push({
        key: "solver",
        parts: [
          part("A solver that is", selectedSolverTypes, solverTypeLabel),
          part("", selectedSolverComplexities, solverComplexityLabel),
        ],
        note: "(both on the same solver)",
      });
    } else if (selectedSolverTypes.size > 0) {
      groups.push({
        key: "solver",
        parts: [part("Solver type", selectedSolverTypes, solverTypeLabel)],
      });
    } else if (selectedSolverComplexities.size > 0) {
      groups.push({
        key: "solver",
        parts: [part("Solver complexity", selectedSolverComplexities, solverComplexityLabel)],
      });
    }
    if (selectedVisualizationTypes.size > 0) {
      groups.push({
        key: "visualization",
        parts: [part("Visualization", selectedVisualizationTypes, visualizationTypeLabel)],
      });
    }
    if (reachabilitySource) {
      groups.push({
        key: "reachability",
        parts: [
          {
            label: "Reachable from",
            values: [problemNameMap.get(reachabilitySource) ?? reachabilitySource],
          },
        ],
        note: reachabilityMode === "anyHops" ? "by any number of reductions" : "by one reduction",
      });
    }
    return groups;
  }, [
    selectedComplexityClasses,
    selectedSolverTypes,
    selectedSolverComplexities,
    selectedProblemTypes,
    selectedVisualizationTypes,
    reachabilitySource,
    reachabilityMode,
    problemNameMap,
  ]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: pageBackground(mode),
      }}
    >
      <ResponsiveAppBar />

      <Container maxWidth="lg" sx={{ pt: 3, pb: 6 }}>
        <Typography sx={{ color: text.heading, fontSize: "1.4rem", fontWeight: 600, mb: 0.5 }}>
          Browse Problems
        </Typography>
        <Typography sx={{ color: text.body, fontSize: "0.87rem", mb: 3 }}>
          Filter the full problem list by complexity class, problem type, solver type, solver
          complexity, visualization type, or reduction reachability.
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 6 }}>
            <CircularProgress size={22} sx={{ color: "#F47C20" }} />
            <Typography sx={{ color: text.body }}>Loading problem data…</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: filtersExpanded ? 3 : 2 }}>
              <Box
                sx={{
                  ...theSectionCard,
                  display: "grid",
                  gap: 1.5,
                  position: { md: "sticky" },
                  top: { md: 16 },
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <Typography sx={{ color: text.heading, fontSize: "0.95rem", fontWeight: 700 }}>
                    Filters
                  </Typography>
                  <IconButton
                    onClick={toggleFiltersExpanded}
                    size="small"
                    aria-expanded={filtersExpanded}
                    aria-controls="browse-filters-panel"
                    aria-label={filtersExpanded ? "Collapse filters" : "Expand filters"}
                    sx={{
                      color: text.caption,
                      border: "1px solid transparent",
                      borderRadius: "6px",
                      "&:hover, &:focus-visible": {
                        borderColor: "#F47C20",
                        background: "rgba(244,124,32,0.08)",
                      },
                    }}
                  >
                    <ExpandMoreIcon
                      fontSize="small"
                      sx={{
                        transform: filtersExpanded ? "rotate(180deg)" : "none",
                        transition: "transform 0.15s ease",
                      }}
                    />
                  </IconButton>
                </Box>

                <Button
                  onClick={clearFilters}
                  variant="outlined"
                  size="small"
                  disabled={activeFilterTags.length === 0}
                  sx={{
                    color: "#F47C20",
                    borderColor: "rgba(244,124,32,0.4)",
                    "&:hover": { borderColor: "#F47C20", background: "rgba(244,124,32,0.08)" },
                  }}
                >
                  Clear Filters ({activeFilterTags.length})
                </Button>

                <Collapse in={filtersExpanded} id="browse-filters-panel">
                  <Box sx={{ display: "grid", gap: 2.5 }}>
                    <FacetFilterGroup
                      label="Complexity Class"
                      options={complexityClassOptions}
                      selected={selectedComplexityClasses}
                      onChange={setSelectedComplexityClasses}
                      collapsible
                      groupBy={(key) =>
                        COMPLEXITY_CLASS_ORDER.indexOf(key) <=
                        COMPLEXITY_CLASS_ORDER.indexOf("NPHard")
                          ? "Classical"
                          : key === "Unclassified"
                            ? null
                            : "Quantum"
                      }
                    />
                    <FacetFilterGroup
                      label="Problem Type"
                      options={problemTypeOptions}
                      selected={selectedProblemTypes}
                      onChange={setSelectedProblemTypes}
                      collapsible
                    />
                    <FacetFilterGroup
                      label="Solver Type"
                      options={solverTypeOptions}
                      selected={selectedSolverTypes}
                      onChange={setSelectedSolverTypes}
                      collapsible
                    />
                    <FacetFilterGroup
                      label="Solver Complexity"
                      options={solverComplexityOptions}
                      selected={selectedSolverComplexities}
                      onChange={setSelectedSolverComplexities}
                      collapsible
                    />
                    <FacetFilterGroup
                      label="Visualization Type"
                      options={visualizationTypeOptions}
                      selected={selectedVisualizationTypes}
                      onChange={setSelectedVisualizationTypes}
                      collapsible
                    />

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
                        REACHABLE FROM
                      </Typography>
                      <SearchBarExtensible
                        selected={reachabilitySource ?? ""}
                        onSelect={(value) => setReachabilitySource(value || null)}
                        placeholder="Source problem"
                        options={problemNames}
                        optionsMap={problemNameMap}
                        extenderButtons={() => []}
                      />
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Chip
                          label="One reduction"
                          clickable
                          onClick={() => setReachabilityMode("oneHop")}
                          sx={{
                            fontSize: "0.72rem",
                            color: reachabilityMode === "oneHop" ? "#fff" : text.caption,
                            background:
                              reachabilityMode === "oneHop" ? "#F47C20" : surface.surfaceAlt,
                            border: `1px solid ${surface.border}`,
                          }}
                        />
                        <Chip
                          label="Any reductions"
                          clickable
                          onClick={() => setReachabilityMode("anyHops")}
                          sx={{
                            fontSize: "0.72rem",
                            color: reachabilityMode === "anyHops" ? "#fff" : text.caption,
                            background:
                              reachabilityMode === "anyHops" ? "#F47C20" : surface.surfaceAlt,
                            border: `1px solid ${surface.border}`,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: filtersExpanded ? 9 : 10 }}>
              <ActiveFilterSummary count={filteredProblems.length} groups={filterGroups} />

              {filteredProblems.length === 0 ? (
                <Box sx={{ ...theSectionCard, textAlign: "center", py: 5 }}>
                  <Typography sx={{ color: text.caption }}>
                    No problems match the current filters.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={1.5}>
                  {filteredProblems.map((name) => {
                    const tags = problemIndex.get(name);
                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={name}>
                        <ProblemCard
                          name={name}
                          displayName={tags.displayName}
                          complexityClass={complexityClassLabel(tags.complexityClass)}
                          complexityClassValue={tags.complexityClass}
                          problemType={problemTypeLabel(tags.problemType)}
                          problemTypeValue={tags.problemType}
                          solverTypes={[...tags.solverTypes]
                            .map((type) => ({ value: type, label: solverTypeLabel(type) }))
                            .sort((a, b) => a.label.localeCompare(b.label))}
                          visualizationTypes={[...tags.visualizationCategories]
                            // useProblemIndex's "Unimplemented" sentinel is a real facet
                            // option (so it can still be filtered on below) but never a
                            // real category -- stripped here so ProblemCard never renders
                            // it as a chip; its length-0 fallback ("No visualizations")
                            // fires instead. Direct project-owner instruction.
                            .filter((category) => category !== "Unimplemented")
                            .map((category) => ({ value: category, label: category }))
                            .sort((a, b) => a.label.localeCompare(b.label))}
                          onComplexityClassClick={toggleComplexityClassFilter}
                          onProblemTypeClick={toggleProblemTypeFilter}
                          onSolverTypeClick={toggleSolverTypeFilter}
                          onVisualizationTypeClick={toggleVisualizationTypeFilter}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}
