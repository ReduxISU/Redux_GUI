import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
import isulogo from "../../components/images/ISULogo.png";

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
    label: "Computational problem",
    url: "https://en.wikipedia.org/wiki/Computational_problem",
  },
  {
    label: "Algorithm",
    url: "https://en.wikipedia.org/wiki/Algorithm",
  },
  {
    label: "List of algorithms",
    url: "https://en.wikipedia.org/wiki/List_of_algorithms",
  },
  {
    label: "Complexity class",
    url: "https://en.wikipedia.org/wiki/Complexity_class",
  },
  {
    label: "P (complexity)",
    url: "https://en.wikipedia.org/wiki/P_(complexity)",
  },
  {
    label: "NP (complexity)",
    url: "https://en.wikipedia.org/wiki/NP_(complexity)",
  },
  {
    label: "NP-hardness",
    url: "https://en.wikipedia.org/wiki/NP-hardness",
  },
  {
    label: "NP-completeness",
    url: "https://en.wikipedia.org/wiki/NP-completeness",
  },
  {
    label: "Karp's 21 NP-complete problems",
    url: "https://en.wikipedia.org/wiki/Karp%27s_21_NP-complete_problems",
  },
  {
    label: "List of NP-complete problems",
    url: "https://en.wikipedia.org/wiki/List_of_NP-complete_problems",
  },
  {
    label: "Many-one reduction",
    url: "https://en.wikipedia.org/wiki/Many-one_reduction",
  },
  {
    label: "Gadget (computer science)",
    url: "https://en.wikipedia.org/wiki/Gadget_(computer_science)",
  },
  {
    label: "Approximation algorithm",
    url: "https://en.wikipedia.org/wiki/Approximation_algorithm",
  },
];

const accessLinks = [
  {
    label: "RESTful API",
    url: "https://api.redux.portneuf.cose.isu.edu/swagger/index.html",
  },
];

const learnMoreLinks = [
  { label: "Github", url: "https://github.com/ReduxISU/" },
  {
    label: "Karp's 21 NP-Complete Problems",
    url: "https://cgi.di.uoa.gr/~sgk/teaching/grad/handouts/karp.pdf",
  },
  {
    label: "Redux GUI Documentation",
    url: "https://github.com/ReduxISU/Redux_GUI/blob/ReduxAPI_GUI/Documentation/index.md",
  },
  {
    label: "Redux Backend Documentation",
    url: "https://github.com/ReduxISU/Redux/blob/CSharpAPI/Documentation/index.md",
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
    borderColor: "#F47C20",
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
    borderColor: "#F47C20",
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

              <Typography
  sx={{
    color: "#374151",
    fontSize: "0.87rem",
    lineHeight: 1.9,
    textAlign: "justify",
  }}
>
  {backgroundLinks.map((link, index) => (
    <span key={link.label}>
      <Link
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        sx={{
          color: "#F47C20",
          fontWeight: 600,
        }}
      >
        {link.label}
      </Link>
      {index < backgroundLinks.length - 1 ? ", " : "."}
    </span>
  ))}
</Typography>
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

            <Box sx={{ ...sectionCardStyle, mb: 1.5 }}>
              <SectionTitle>LEARN MORE</SectionTitle>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  mb: 2,
                }}
              >
                Additional documentation can be found at the following links:
              </Typography>

              <Box sx={{ display: "grid", gap: 1 }}>
                {learnMoreLinks.map((link) => (
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
          </Box>
        </Container>
        <Box
  sx={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    pt: 2,
    pb: 3,
  }}
>
  <Link
    href="https://www.isu.edu/cs/"
    target="_blank"
    rel="noopener noreferrer"
    underline="none"
    sx={{ display: "inline-flex" }}
  >
    <Box
      component="img"
      src={isulogo.src}
      alt="Idaho State University Computer Science"
      sx={{
        height: 72,
        width: "auto",
        display: "block",
        opacity: 1,
        filter: "none",
      }}
    />
  </Link>
</Box>
      </Box>
    </ThemeProvider>
  );
}
