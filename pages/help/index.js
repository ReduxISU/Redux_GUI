import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
import ProblemSection from "../../components/widgets/ProblemSection";
import isulogo from "../../components/images/ISULogo.png";

import { Container, Box, Typography, Link } from "@mui/material";
import { pageBackground, innerCardSx, textColors } from "../../components/theme";
import { useThemeMode } from "../../components/ThemeModeContext";

// Expanded section bodies scroll instead of growing the page without bound.
const SCROLLABLE_BODY_SX = { maxHeight: "60vh", overflowY: "auto", pr: 1 };

// Nested per the "Complexity class" grouping -- its `children` render as a
// sub-list indented one level under it.
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
    children: [
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
    ],
  },
  {
    label: "Many-one reduction",
    url: "https://en.wikipedia.org/wiki/Many-one_reduction",
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

// Renders a (possibly nested, one level deep) bulleted list of links, used
// for the "background reading" list in the Welcome to Redux section.
function LinkList({ links, text }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 3, color: text.body, fontSize: "0.87rem", lineHeight: 1.9 }}>
      {links.map((link) => (
        <Box component="li" key={link.label} sx={{ mb: 0.5 }}>
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
          {link.children && (
            <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 3 }}>
              {link.children.map((child) => (
                <Box component="li" key={child.label} sx={{ mb: 0.5 }}>
                  <Link
                    href={child.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{
                      color: "#F47C20",
                      fontWeight: 600,
                    }}
                  >
                    {child.label}
                  </Link>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

export default function HelpPage() {
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
            <ProblemSection defaultCollapsed={false}>
              <ProblemSection.Header title={<SectionTitle>WELCOME TO REDUX</SectionTitle>} titleWidth="auto">
                <Box sx={{ flexGrow: 1 }} />
              </ProblemSection.Header>
              <ProblemSection.Body>
                <Box sx={SCROLLABLE_BODY_SX}>
                  <Typography
                    sx={{
                      color: text.body,
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

                  <LinkList links={backgroundLinks} text={text} />
                </Box>
              </ProblemSection.Body>
            </ProblemSection>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <ProblemSection defaultCollapsed={true}>
              <ProblemSection.Header title={<SectionTitle>ACCESS REDUX CONTENT</SectionTitle>} titleWidth="auto">
                <Box sx={{ flexGrow: 1 }} />
              </ProblemSection.Header>
              <ProblemSection.Body>
                <Box sx={SCROLLABLE_BODY_SX}>
                  <Typography
                    sx={{
                      color: text.body,
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
                          color: text.body,
                          fontSize: "0.82rem",
                          lineHeight: 1.7,
                        }}
                      >
                        C# Library import{" "}
                        <Box
                          component="span"
                          sx={{
                            color: text.caption,
                            fontStyle: "italic",
                          }}
                        >
                          (instructions coming soon)
                        </Box>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </ProblemSection.Body>
            </ProblemSection>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <ProblemSection defaultCollapsed={true}>
              <ProblemSection.Header title={<SectionTitle>LEARN MORE</SectionTitle>} titleWidth="auto">
                <Box sx={{ flexGrow: 1 }} />
              </ProblemSection.Header>
              <ProblemSection.Body>
                <Box sx={SCROLLABLE_BODY_SX}>
                  <Typography
                    sx={{
                      color: text.body,
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
              </ProblemSection.Body>
            </ProblemSection>
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
          {/* Logo's "Idaho State University"/"Computer Science" text and divider
              line are baked into the PNG as near-black pixels -- can't recolor
              per-mode with CSS without also distorting the orange mark, so in
              dark mode it gets a white chip to sit on instead. */}
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
              ...(mode === "dark" && {
                bgcolor: "#FFFFFF",
                borderRadius: "8px",
                p: 1,
              }),
            }}
          />
        </Link>
      </Box>
    </Box>
  );
}
