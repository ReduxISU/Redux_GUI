import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
/**
 * UI Components. Every concepts are taken from aboutus page.
 */
import {
  createTheme,
  ThemeProvider,
  Container,
  Box,
  Typography,
  CssBaseline,
  Link,
} from "@mui/material";
/**
 * External links for additional documentations. 
 */
const resourceLinks = [
  { label: "GitHub", url: "https://github.com/ReduxISU/" },
  {
    label: "Wikipedia: What is NP-Complete?",
    url: "https://en.wikipedia.org/wiki/NP-completeness",
  },
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
  {
    label: "API Swagger Documentation",
    url: "https://api.redux.portneuf.cose.isu.edu/swagger/index.html",
  },
];
/**
 * This is the theme configuration for the whole page.
 */
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

/**
 * We have box styling across all the sections. 
 * And this is the common pattern for the box styling
 */
const sectionCardStyle = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.10)",
  padding: { xs: 3, md: 4 },
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: "rgba(168,85,247,0.4)",
    boxShadow: "0 0 25px rgba(168,85,247,0.15)",
  },
};

/**
 * This is the typography for each section's title.
 */
function SectionTitle({ children }) {
  return (
    <Typography
      sx={{
        color: "#ffffff",
        fontSize: "0.85rem",
        fontWeight: 600,
        letterSpacing: "0.22em",
        mb: 2,
      }}
    >
      {children}
    </Typography>
  );
}
/**
 * This is the help page component. 
 * This provides the YouTube tutorial for Redux setup.
 */
export default function HelpPage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Background has been inserted with subtle purple gradient */}
      <Box
        sx={{
          minHeight: "100vh",
          background: `
            radial-gradient(circle at 50% -10%, rgba(139,92,246,0.18), transparent 50%),
            linear-gradient(180deg, #09090f 0%, #07070b 100%)
          `,
        }}
      >
        <ResponsiveAppBar />

        <Container maxWidth="lg" sx={{ pt: 2 }}>
          <Box sx={{ maxWidth: "900px", mx: "auto" }}>

            {/* Intro Section */}
            <Box sx={{ ...sectionCardStyle, mb: 1.5 }}>
              <SectionTitle>HELP</SectionTitle>

              <Typography
                sx={{
                  color: "#d1d5db",
                  fontSize: "0.87rem",
                  lineHeight: 1.9,
                }}
              >
                This page includes a setup tutorial and additional resources to help
                you use Redux and explore NP-Complete problems in more detail.
              </Typography>
            </Box>

            {/* Video Tutorial Section */}
            <Box sx={{ ...sectionCardStyle, mb: 1.5 }}>
              <SectionTitle>VIDEO TUTORIAL</SectionTitle>

              <Typography
                sx={{
                  color: "#d1d5db",
                  fontSize: "0.87rem",
                  lineHeight: 1.8,
                  mb: 2,
                }}
              >
                With the guidance of Dr. Paul Bodily and Michael Trosper, we are
                excited to share the Redux setup tutorial. This video walks through
                running Redux locally. More tutorials will be added over time.
              </Typography>

              <Box
                sx={{
                  width: "100%",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <iframe
                  width="100%"
                  height="420"
                  src="https://www.youtube.com/embed/9vTl522tyhU"
                  title="Redux Setup Tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Box>
            </Box>

            {/* Section where there are links to the resources*/}
            <Box sx={{ ...sectionCardStyle, mb: 4 }}>
              <SectionTitle>LEARN MORE</SectionTitle>

              <Typography
                sx={{
                  color: "#d1d5db",
                  fontSize: "0.87rem",
                  mb: 2,
                }}
              >
                Additional documentation can be found at the following links:
              </Typography>

              <Box sx={{ display: "grid", gap: 1.2 }}>
                {resourceLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none"
                    sx={{
                      color: "#c084fc",
                      fontSize: "0.8rem",
                      "&:hover": { color: "#e9d5ff" },
                    }}
                  >
                    • {link.label}
                  </Link>
                ))}
              </Box>
            </Box>

          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
