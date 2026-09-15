import React, { useMemo } from "react";
import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
import FacetFilterGroup from "../../components/widgets/FacetFilterGroup";
import ProblemCard from "../../components/widgets/ProblemCard";
import SearchBarExtensible from "../../components/widgets/SearchBarExtensible";
import { useProblemIndex } from "../../components/hooks/ProblemFilters/useProblemIndex";
import { useProblemFilters } from "../../components/hooks/ProblemFilters/useProblemFilters";
import { buildFacetOptions } from "../../components/hooks/ProblemFilters/facetOptions";
import {
  COMPLEXITY_CLASS_ORDER,
  complexityClassRank,
  complexityClassLabel,
} from "../../components/hooks/ProblemFilters/complexityClassOrder";
import { solverComplexityRank, solverComplexityLabel } from "../../components/hooks/ProblemFilters/solverComplexityOrder";
import { problemTypeLabel } from "../../components/hooks/ProblemFilters/problemTypeOrder";
import { solverTypeLabel } from "../../components/hooks/ProblemFilters/tagLabels";
import { ALL_VISUALIZATIONS_KEY } from "../../components/Visualization/svgs/visualizationCategories";
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import { pageBackground, sectionCardSx, textColors, surfaceColors } from "../../components/theme";
import { useThemeMode } from "../../components/ThemeModeContext";

const reduxBaseUrl = "/api/redux/";

export default function BrowsePage() {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  const surface = surfaceColors(mode);
  // Browse's sidebar/empty-state card is denser than a full content page's
  // section card, so it overrides padding -- everything else (color, hover)
  // stays shared.
  const theSectionCard = { ...sectionCardSx(mode), padding: { xs: 2, md: 2.5 } };

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
  //
  // Includes useProblemIndex's "Unimplemented" sentinel as an ordinary option here
  // (unlike the ProblemCard chip list below, which strips it) -- a person filtering
  // by visualization type still needs a way to find every "No visualizations" card,
  // and useProblemFilters' selectedVisualizationTypes/tags.visualizationCategories
  // intersection already matches it correctly with no filter-logic changes needed.
  //
  // "All Visualizations" is prepended as a synthetic option (ALL_VISUALIZATIONS_KEY,
  // handled specially in useProblemFilters) rather than a real category, so it's
  // built here instead of via buildFacetOptions. Its count is every problem whose
  // visualizationCategories ISN'T just the "Unimplemented" sentinel -- mutually
  // exclusive with real categories by construction (useProblemIndex only adds the
  // sentinel when a problem's real category set is empty), so this is the same "has
  // a renderable visualization" count the old hasRenderableVisualization field used
  // to carry directly, before that field was removed in favor of the sentinel.
  const visualizationTypeOptions = useMemo(() => {
    const categoryOptions = buildFacetOptions(problemIndex, (tags) => tags.visualizationCategories);
    const renderableCount = [...problemIndex.values()].filter(
      (tags) => !tags.visualizationCategories.has("Unimplemented"),
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
          Filter the full problem list by complexity class, solver type, solver complexity,
          visualization type, or reduction reachability.
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 6 }}>
            <CircularProgress size={22} sx={{ color: "#F47C20" }} />
            <Typography sx={{ color: text.body }}>Loading problem data…</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Box sx={{ ...theSectionCard, display: "grid", gap: 2.5, position: { md: "sticky" }, top: { md: 16 } }}>
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

                <FacetFilterGroup
                  label="Complexity Class"
                  options={complexityClassOptions}
                  selected={selectedComplexityClasses}
                  onChange={setSelectedComplexityClasses}
                  scrollable
                  groupBy={(key) =>
                    COMPLEXITY_CLASS_ORDER.indexOf(key) <= COMPLEXITY_CLASS_ORDER.indexOf("NPHard")
                      ? "Classical"
                      : key === "Unclassified"
                        ? null
                        : "Quantum"
                  }
                />
                <FacetFilterGroup
                  label="Solver Type"
                  options={solverTypeOptions}
                  selected={selectedSolverTypes}
                  onChange={setSelectedSolverTypes}
                  scrollable
                />
                <FacetFilterGroup
                  label="Solver Complexity"
                  options={solverComplexityOptions}
                  selected={selectedSolverComplexities}
                  onChange={setSelectedSolverComplexities}
                />
                <FacetFilterGroup
                  label="Visualization Type"
                  options={visualizationTypeOptions}
                  selected={selectedVisualizationTypes}
                  onChange={setSelectedVisualizationTypes}
                  scrollable
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
                        background: reachabilityMode === "oneHop" ? "#F47C20" : surface.surfaceAlt,
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
                        background: reachabilityMode === "anyHops" ? "#F47C20" : surface.surfaceAlt,
                        border: `1px solid ${surface.border}`,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 9 }}>
              <Typography sx={{ color: text.caption, fontSize: "0.82rem", mb: 1.5 }}>
                {filteredProblems.length} problem{filteredProblems.length === 1 ? "" : "s"}
                {activeFilterTags.length > 0 && (
                  <>
                    {" "}
                    matching: <strong>{activeFilterTags.join(", ")}</strong>
                  </>
                )}
              </Typography>

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
