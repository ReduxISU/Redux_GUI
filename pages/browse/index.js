import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  createTheme,
  Grid,
  ThemeProvider,
  Typography,
} from "@mui/material";
import React, { useMemo } from "react";
import { buildFacetOptions } from "../../components/hooks/ProblemFilters/facetOptions";
import { useProblemFilters } from "../../components/hooks/ProblemFilters/useProblemFilters";
import { useProblemIndex } from "../../components/hooks/ProblemFilters/useProblemIndex";
import FacetFilterGroup from "../../components/widgets/FacetFilterGroup";
import ProblemCard from "../../components/widgets/ProblemCard";
import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
import SearchBarExtensible from "../../components/widgets/SearchBarExtensible";

// Same dark palette as pages/aboutus/index.js, for visual consistency across
// the app's newer MUI-Grid-card pages.
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#8b5cf6" },
    secondary: { main: "#a855f7" },
    background: {
      default: "#07070b",
      paper: "rgba(255,255,255,0.04)",
    },
    text: {
      primary: "#ffffff",
      secondary: "#b4b4c7",
    },
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
});

const theSectionCard = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.10)",
  padding: { xs: 2, md: 2.5 },
};

const reduxBaseUrl = "/api/redux/";

export default function BrowsePage() {
  const { problemIndex, reductionGraph, loading } = useProblemIndex(reduxBaseUrl);
  const {
    selectedComplexityClasses,
    setSelectedComplexityClasses,
    selectedSolverTypes,
    setSelectedSolverTypes,
    selectedVisualizationTypes,
    setSelectedVisualizationTypes,
    reachabilitySource,
    setReachabilitySource,
    reachabilityMode,
    setReachabilityMode,
    filteredProblems,
    clearFilters,
  } = useProblemFilters(problemIndex, reductionGraph);

  const complexityClassOptions = useMemo(
    () => buildFacetOptions(problemIndex, (tags) => [tags.complexityClass]),
    [problemIndex],
  );
  const solverTypeOptions = useMemo(
    () => buildFacetOptions(problemIndex, (tags) => tags.solverTypes),
    [problemIndex],
  );
  const visualizationTypeOptions = useMemo(
    () => buildFacetOptions(problemIndex, (tags) => tags.visualizationTypes),
    [problemIndex],
  );

  const problemNames = useMemo(() => [...problemIndex.keys()].sort(), [problemIndex]);
  const problemNameMap = useMemo(
    () => new Map(problemNames.map((name) => [name, name])),
    [problemNames],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, rgba(139,92,246,0.16), transparent 32%), linear-gradient(180deg, #09090f 0%, #07070b 100%)",
        }}
      >
        <ResponsiveAppBar />

        <Container maxWidth="lg" sx={{ pt: 3, pb: 6 }}>
          <Typography sx={{ color: "#ffffff", fontSize: "1.4rem", fontWeight: 600, mb: 0.5 }}>
            Browse Problems
          </Typography>
          <Typography sx={{ color: "#9ca3af", fontSize: "0.87rem", mb: 3 }}>
            Filter the full problem list by complexity class, solver type, visualization type, or
            reduction reachability.
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 6 }}>
              <CircularProgress size={22} sx={{ color: "#a855f7" }} />
              <Typography sx={{ color: "#d1d5db" }}>Loading problem data…</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Box
                  sx={{
                    ...theSectionCard,
                    display: "grid",
                    gap: 2.5,
                    position: { md: "sticky" },
                    top: { md: 16 },
                  }}
                >
                  <FacetFilterGroup
                    label="Complexity Class"
                    options={complexityClassOptions}
                    selected={selectedComplexityClasses}
                    onChange={setSelectedComplexityClasses}
                  />
                  <FacetFilterGroup
                    label="Solver Type"
                    options={solverTypeOptions}
                    selected={selectedSolverTypes}
                    onChange={setSelectedSolverTypes}
                  />
                  <FacetFilterGroup
                    label="Visualization Type"
                    options={visualizationTypeOptions}
                    selected={selectedVisualizationTypes}
                    onChange={setSelectedVisualizationTypes}
                  />

                  <Box>
                    <Typography
                      sx={{
                        color: "#ffffff",
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
                          color: reachabilityMode === "oneHop" ? "#fff" : "#9ca3af",
                          background:
                            reachabilityMode === "oneHop"
                              ? "rgba(168,85,247,0.45)"
                              : "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.10)",
                        }}
                      />
                      <Chip
                        label="Any reductions"
                        clickable
                        onClick={() => setReachabilityMode("anyHops")}
                        sx={{
                          fontSize: "0.72rem",
                          color: reachabilityMode === "anyHops" ? "#fff" : "#9ca3af",
                          background:
                            reachabilityMode === "anyHops"
                              ? "rgba(168,85,247,0.45)"
                              : "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.10)",
                        }}
                      />
                    </Box>
                  </Box>

                  <Button
                    onClick={clearFilters}
                    variant="outlined"
                    size="small"
                    sx={{
                      color: "#e9d5ff",
                      borderColor: "rgba(168,85,247,0.4)",
                      "&:hover": { borderColor: "#a855f7", background: "rgba(168,85,247,0.08)" },
                    }}
                  >
                    Clear filters
                  </Button>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 9 }}>
                <Typography sx={{ color: "#9ca3af", fontSize: "0.82rem", mb: 1.5 }}>
                  {filteredProblems.length} problem{filteredProblems.length === 1 ? "" : "s"}
                </Typography>

                {filteredProblems.length === 0 ? (
                  <Box sx={{ ...theSectionCard, textAlign: "center", py: 5 }}>
                    <Typography sx={{ color: "#9ca3af" }}>
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
                            complexityClass={tags.complexityClass}
                            solverTypes={[...tags.solverTypes].sort()}
                            hasRenderableVisualization={tags.hasRenderableVisualization}
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
    </ThemeProvider>
  );
}
