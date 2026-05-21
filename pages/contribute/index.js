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

const contributionSteps = [
  "Creating a fork of the appropriate repository, front end or back end",
  "Getting Redux running locally for development and testing",
  "Downloading, editing, and integrating templates",
  "Submitting a successful pull request",
];

const helpfulLinks = [
  {
    label: "GitHub",
    url: "https://github.com/ReduxISU/",
  },
  {
    label: "Swagger",
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

export default function ContributePage() {
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
              <SectionTitle>CONTRIBUTE TO REDUX</SectionTitle>

              <Typography
                sx={{
                  color: "#111827",
                  fontSize: "1rem",
                  fontWeight: 700,
                  lineHeight: 1.8,
                  mb: 1.5,
                }}
              >
                Redux depends on contributors like you.
              </Typography>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  lineHeight: 1.9,
                  textAlign: "justify",
                  mb: 2.2,
                }}
              >
                Our goal from the beginning has not been to build a knowledge
                base ourselves but to build a framework for crowd-sourced
                contribution across the world, think Wikipedia. We hope to see
                contributors add everything from new problems, algorithms,
                reductions, visualizations, features, bug fixes, and beyond. Our
                goal is to make the framework easy to understand and even easier
                to extend. Below are tutorials and helpful information to get
                you started.
              </Typography>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  lineHeight: 1.9,
                  mb: 2,
                }}
              >
                Any contribution to Redux requires:
              </Typography>

              <Box sx={{ display: "grid", gap: 1 }}>
                {contributionSteps.map((step) => (
                  <Box key={step} sx={innerCard}>
                    <Typography
                      sx={{
                        color: "#374151",
                        fontSize: "0.82rem",
                        lineHeight: 1.7,
                      }}
                    >
                      • {step}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ ...sectionCardStyle, mb: 1.5 }}>
              <SectionTitle>TUTORIAL VIDEOS</SectionTitle>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  lineHeight: 1.8,
                  mb: 2,
                }}
              >
                Here are tutorial videos for each of these steps:
              </Typography>

              <Box
                sx={{
                  width: "100%",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #E5E7EB",
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

            <Box sx={{ ...sectionCardStyle, mb: 1.5 }}>
              <SectionTitle>CHECKLIST FOR A SUCCESSFUL PULL REQUEST</SectionTitle>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  lineHeight: 1.9,
                  textAlign: "justify",
                }}
              >
                Before submitting a pull request, make sure your changes run
                locally, follow the existing project structure, include clear
                descriptions of the work completed, and are tested carefully.
                Additional checklist details will be added as the contribution
                documentation is expanded.
              </Typography>
            </Box>

            <Box sx={{ ...sectionCardStyle, mb: 1.5 }}>
              <SectionTitle>HELPFUL LINKS</SectionTitle>

              <Box sx={{ display: "grid", gap: 1 }}>
                {helpfulLinks.map((link) => (
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
              <SectionTitle>GET INVOLVED</SectionTitle>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  lineHeight: 1.9,
                  textAlign: "justify",
                }}
              >
                Interested in getting more involved? We love collaboration!
                Whether you are an industry partner, a university research
                group, or an individual passionate about getting involved, we
                have lots of project ideas we could use your help with. If
                interested, please reach out to Dr. Paul Bodily at{" "}
                <Link
                  href="mailto:bodipaul@isu.edu"
                  underline="hover"
                  sx={{
                    color: "#F47C20",
                    fontWeight: 600,
                  }}
                >
                  bodipaul@isu.edu
                </Link>.
              </Typography>
            </Box>

            <Box sx={{ ...sectionCardStyle, mb: 1.5 }}>
              <SectionTitle>TERMS OF USE</SectionTitle>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  lineHeight: 1.9,
                  textAlign: "justify",
                }}
              >
                Terms of Use content will be added here. This section is
                intended to describe expectations and conditions for using Redux.
              </Typography>
            </Box>

            <Box sx={{ ...sectionCardStyle, mb: 1.5 }}>
              <SectionTitle>PRIVACY POLICY</SectionTitle>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  lineHeight: 1.9,
                  textAlign: "justify",
                }}
              >
                Privacy Policy content will be added here. This section is
                intended to explain what information is collected, how it is
                used, and how user privacy is protected.
              </Typography>
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
