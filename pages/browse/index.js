import React, { useMemo } from "react";
import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
import FacetFilterGroup from "../../components/widgets/FacetFilterGroup";
import ProblemCard from "../../components/widgets/ProblemCard";
import SearchBarExtensible from "../../components/widgets/SearchBarExtensible";
import { useProblemIndex } from "../../components/hooks/ProblemFilters/useProblemIndex";
import { useProblemFilters } from "../../components/hooks/ProblemFilters/useProblemFilters";
import { buildFacetOptions } from "../../components/hooks/ProblemFilters/facetOptions";
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";

// Same light orange/grey/white palette as pages/aboutus/index.js and the
// other pages, for visual consistency across the app.
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#3F3F46" },
    secondary: { main: "#F47C20" },
    background: {
      default: "#F9FAFB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#111827",
      secondary: "#4B5563",
    },
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
});

const theSectionCard = {
  background: "#FFFFFF",
  borderRadius: "16px",
  border: "1px solid #E5E7EB",
  padding: { xs: 2, md: 2.5 },
  boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
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
            "radial-gradient(circle at top, rgba(139,92,246,0.08), transparent 38%), #F9FAFB",
        }}
      >
        <ResponsiveAppBar />

        <Container maxWidth="lg" sx={{ pt: 3, pb: 6 }}>
          <Typography sx={{ color: "#111827", fontSize: "1.4rem", fontWeight: 600, mb: 0.5 }}>
            Browse Problems
          </Typography>
          <Typography sx={{ color: "#374151", fontSize: "0.87rem", mb: 3 }}>
            Filter the full problem list by complexity class, solver type, visualization type,
            or reduction reachability.
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 6 }}>
              <CircularProgress size={22} sx={{ color: "#F47C20" }} />
              <Typography sx={{ color: "#374151" }}>Loading problem data…</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ ...theSectionCard, display: "grid", gap: 2.5, position: { md: "sticky" }, top: { md: 16 } }}>
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
                        color: "#111827",
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
                          color: reachabilityMode === "oneHop" ? "#fff" : "#6b7280",
                          background: reachabilityMode === "oneHop" ? "#F47C20" : "#F9FAFB",
                          border: "1px solid #E5E7EB",
                        }}
                      />
                      <Chip
                        label="Any reductions"
                        clickable
                        onClick={() => setReachabilityMode("anyHops")}
                        sx={{
                          fontSize: "0.72rem",
                          color: reachabilityMode === "anyHops" ? "#fff" : "#6b7280",
                          background: reachabilityMode === "anyHops" ? "#F47C20" : "#F9FAFB",
                          border: "1px solid #E5E7EB",
                        }}
                      />
                    </Box>
                  </Box>

                  <Button
                    onClick={clearFilters}
                    variant="outlined"
                    size="small"
                    sx={{
                      color: "#F47C20",
                      borderColor: "rgba(244,124,32,0.4)",
                      "&:hover": { borderColor: "#F47C20", background: "rgba(244,124,32,0.08)" },
                    }}
                  >
                    Clear filters
                  </Button>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 9 }}>
                <Typography sx={{ color: "#6b7280", fontSize: "0.82rem", mb: 1.5 }}>
                  {filteredProblems.length} problem{filteredProblems.length === 1 ? "" : "s"}
                </Typography>

                {filteredProblems.length === 0 ? (
                  <Box sx={{ ...theSectionCard, textAlign: "center", py: 5 }}>
                    <Typography sx={{ color: "#6b7280" }}>
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
