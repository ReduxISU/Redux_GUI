import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
import StaticSection from "../../components/widgets/StaticSection";
import isulogoLight from "../../components/images/ISULogo-Light.png";
import isulogoDark from "../../components/images/ISULogo-Dark.png";

import { Container, Box, Typography, Link } from "@mui/material";
import { pageBackground, innerCardSx, textColors } from "../../components/theme";
import { useThemeMode } from "../../components/ThemeModeContext";

const contributionSteps = [
  "Creating a fork of the appropriate repository, front end or back end",
  "Getting Redux running locally for development and testing",
  "Downloading, editing, and integrating templates",
  "Submitting a successful pull request",
];

const pullRequestChecklist = [
  "Runs locally without errors — no console errors or warnings introduced",
  "Follows existing project structure and conventions — components and pages placed consistently with the rest of the repo, matching existing naming and styling patterns",
  "Tested before submitting — exercised the change locally, covering the normal case and at least one edge case",
  "Clear PR description — explains what changed, why, and how to verify it",
  "Scoped to one thing — no unrelated files, formatting-only diffs, or drive-by changes bundled in",
  "No secrets or environment-specific values committed — API keys, local paths, .env values, etc.",
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

function SectionTitle({ children }) {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  return (
    <Typography
      sx={{
        color: text.heading,
        fontSize: "0.85rem",
        fontWeight: 700,
        letterSpacing: "0.22em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Typography>
  );
}

export default function ContributePage() {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  const innerCard = innerCardSx(mode);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: pageBackground(mode),
      }}
    >
      <ResponsiveAppBar />

      <Container maxWidth="lg" sx={{ pt: 4, pb: 5 }}>
        <Box sx={{ maxWidth: "980px", mx: "auto" }}>
          <Box sx={{ mb: 1.5 }}>
            <StaticSection>
              <StaticSection.Header title={<SectionTitle>CONTRIBUTE TO REDUX</SectionTitle>} titleWidth="auto" />
              <StaticSection.Body>
                <Typography
                  sx={{
                    color: text.heading,
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
                    color: text.body,
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
                    color: text.body,
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
                          color: text.body,
                          fontSize: "0.82rem",
                          lineHeight: 1.7,
                        }}
                      >
                        • {step}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </StaticSection.Body>
            </StaticSection>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <StaticSection>
              <StaticSection.Header title={<SectionTitle>TUTORIAL VIDEOS</SectionTitle>} titleWidth="auto" />
              <StaticSection.Body>
                <Typography
                  sx={{
                    color: text.body,
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
                    border: mode === "dark" ? "1px solid rgba(255,255,255,0.10)" : "1px solid #E5E7EB",
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
              </StaticSection.Body>
            </StaticSection>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <StaticSection>
              <StaticSection.Header
                title={<SectionTitle>CHECKLIST FOR A SUCCESSFUL PULL REQUEST</SectionTitle>}
                titleWidth="auto"
              />
              <StaticSection.Body>
                <Box sx={{ display: "grid", gap: 1 }}>
                  {pullRequestChecklist.map((item) => (
                    <Box key={item} sx={innerCard}>
                      <Typography
                        sx={{
                          color: text.body,
                          fontSize: "0.82rem",
                          lineHeight: 1.7,
                        }}
                      >
                        • {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </StaticSection.Body>
            </StaticSection>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <StaticSection>
              <StaticSection.Header title={<SectionTitle>HELPFUL LINKS</SectionTitle>} titleWidth="auto" />
              <StaticSection.Body>
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
              </StaticSection.Body>
            </StaticSection>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <StaticSection>
              <StaticSection.Header title={<SectionTitle>GET INVOLVED</SectionTitle>} titleWidth="auto" />
              <StaticSection.Body>
                <Typography
                  sx={{
                    color: text.body,
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
              </StaticSection.Body>
            </StaticSection>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <StaticSection>
              <StaticSection.Header title={<SectionTitle>TERMS OF USE</SectionTitle>} titleWidth="auto" />
              <StaticSection.Body>
                <Typography
                  sx={{
                    color: text.body,
                    fontSize: "0.87rem",
                    lineHeight: 1.9,
                    textAlign: "justify",
                  }}
                >
                  Terms of Use content will be added here. This section is
                  intended to describe expectations and conditions for using Redux.
                </Typography>
              </StaticSection.Body>
            </StaticSection>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <StaticSection>
              <StaticSection.Header title={<SectionTitle>PRIVACY POLICY</SectionTitle>} titleWidth="auto" />
              <StaticSection.Body>
                <Typography
                  sx={{
                    color: text.body,
                    fontSize: "0.87rem",
                    lineHeight: 1.9,
                    textAlign: "justify",
                  }}
                >
                  Privacy Policy content will be added here. This section is
                  intended to explain what information is collected, how it is
                  used, and how user privacy is protected.
                </Typography>
              </StaticSection.Body>
            </StaticSection>
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
            src={mode === "dark" ? isulogoDark.src : isulogoLight.src}
            alt="Idaho State University Computer Science"
            sx={{
              height: 72,
              width: "auto",
              display: "block",
            }}
          />
        </Link>
      </Box>
    </Box>
  );
}
