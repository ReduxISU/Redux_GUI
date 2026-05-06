import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";

import {
  createTheme,
  ThemeProvider,
  Container,
  Box,
  Typography,
  CssBaseline,
  Link,
} from "@mui/material";

const backgroundLinks = [
  {
    label: "Wikipedia: Computational problem",
    url: "https://en.wikipedia.org/wiki/Computational_problem",
  },
  {
    label: "Wikipedia: Algorithm",
    url: "https://en.wikipedia.org/wiki/Algorithm",
  },
  {
    label: "Wikipedia: List of algorithms",
    url: "https://en.wikipedia.org/wiki/List_of_algorithms",
  },
  {
    label: "Wikipedia: Complexity class",
    url: "https://en.wikipedia.org/wiki/Complexity_class",
  },
  {
    label: "Wikipedia: P (complexity)",
    url: "https://en.wikipedia.org/wiki/P_(complexity)",
  },
  {
    label: "Wikipedia: NP (complexity)",
    url: "https://en.wikipedia.org/wiki/NP_(complexity)",
  },
  {
    label: "Wikipedia: NP-hardness",
    url: "https://en.wikipedia.org/wiki/NP-hardness",
  },
  {
    label: "Wikipedia: NP-completeness",
    url: "https://en.wikipedia.org/wiki/NP-completeness",
  },
  {
    label: "Wikipedia: Karp's 21 NP-complete problems",
    url: "https://en.wikipedia.org/wiki/Karp%27s_21_NP-complete_problems",
  },
  {
    label: "Wikipedia: List of NP-complete problems",
    url: "https://en.wikipedia.org/wiki/List_of_NP-complete_problems",
  },
  {
    label: "Wikipedia: Many-one reduction",
    url: "https://en.wikipedia.org/wiki/Many-one_reduction",
  },
  {
    label: "Wikipedia: Gadget (computer science)",
    url: "https://en.wikipedia.org/wiki/Gadget_(computer_science)",
  },
  {
    label: "Wikipedia: Approximation algorithm",
    url: "https://en.wikipedia.org/wiki/Approximation_algorithm",
  },
];

const accessLinks = [
  {
    label: "RESTful API",
    url: "https://api.redux.portneuf.cose.isu.edu/swagger/index.html",
  },
];

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

const sectionCardStyle = {
  background: "#FFFFFF",
  borderRadius: "16px",
  border: "1px solid #E5E7EB",
  padding: { xs: 3, md: 4 },
  boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
  transition: "all 0.25s ease",
  "&:hover": {
    borderColor: "#8b5cf6",
    boxShadow: "0 12px 30px rgba(0,0,0,0.07)",
  },
};

const innerCard = {
  background: "#F9FAFB",
  border: "1px solid #E5E7EB",
  borderRadius: "10px",
  px: 1.2,
  py: 1,
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#8b5cf6",
    background: "#FFFFFF",
  },
};

function SectionTitle({ children }) {
  return (
    <Typography
      sx={{
        color: "#111827",
        fontSize: "0.85rem",
        fontWeight: 700,
        letterSpacing: "0.22em",
        mb: 2,
      }}
    >
      {children}
    </Typography>
  );
}

export default function HelpPage() {
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

        <Container maxWidth="lg" sx={{ pt: 4, pb: 5 }}>
          <Box sx={{ maxWidth: "980px", mx: "auto" }}>
            <Box sx={{ ...sectionCardStyle, mb: 1.5 }}>
              <SectionTitle>WELCOME TO REDUX</SectionTitle>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  lineHeight: 1.9,
                  textAlign: "justify",
                  mb: 2.2,
                }}
              >
                Redux is a dynamic, interactive computer science knowledgebase
                consisting of canonical computer science problems, solutions,
                and reduction algorithms. The following pages provide helpful
                background to the organization of problems, solutions, and
                reductions in Redux based on the concept of complexity classes:
              </Typography>

              <Box sx={{ display: "grid", gap: 1 }}>
                {backgroundLinks.map((link) => (
                  <Box key={link.label} sx={innerCard}>
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      sx={{
                        color: "#F47C20",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                      }}
                    >
                      {link.label}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ ...sectionCardStyle, mb: 1.5 }}>
              <SectionTitle>ACCESS REDUX CONTENT</SectionTitle>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  lineHeight: 1.9,
                  textAlign: "justify",
                  mb: 2,
                }}
              >
                All of the content of the Redux knowledge base can be accessed
                directly via:
              </Typography>

              <Box sx={{ display: "grid", gap: 1 }}>
                {accessLinks.map((link) => (
                  <Box key={link.label} sx={innerCard}>
                    <Link
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      sx={{
                        color: "#F47C20",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                      }}
                    >
                      {link.label}
                    </Link>
                  </Box>
                ))}

                <Box sx={innerCard}>
                  <Typography
                    sx={{
                      color: "#374151",
                      fontSize: "0.82rem",
                      lineHeight: 1.7,
                    }}
                  >
                    C# Library import{" "}
                    <Box
                      component="span"
                      sx={{
                        color: "#6B7280",
                        fontStyle: "italic",
                      }}
                    >
                      (instructions coming soon)
                    </Box>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
