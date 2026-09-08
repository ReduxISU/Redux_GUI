import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";

import {
  createTheme,
  ThemeProvider,
  Container,
  Box,
  Typography,
  Link,
  Grid,
  Avatar,
  Tooltip,
  CssBaseline,
} from "@mui/material";

import isulogo from "../../components/images/ISULogo.png";

// The only contributors whose GitHub profiles are known, along with avatar and link
const contributorProfiles = {
  "Pratham Khanal": {
    image: "https://github.com/pkprathamkhanal.png",
    github: "https://github.com/pkprathamkhanal",
  },
  "Sansar Kharal": {
    image: "https://github.com/kharsans.png",
    github: "https://github.com/kharsans",
  },
  "Himanshu Jha": {
    image: "https://github.com/himanshujha05.png",
    github: "https://github.com/himanshujha05",
  },
  "Andrija Sevaljevic": {
    image: "https://github.com/Andrija-Sevaljevic.png",
    github: "https://github.com/Andrija-Sevaljevic",
  },
  "Jason Wright": {
    image: "https://github.com/wrigjl.png",
    github: "https://github.com/wrigjl",
  },
  "Daniel Igbokwe": {
    image: "https://github.com/igbodani.png",
    github: "https://github.com/igbodani",
  },
  "Sabal Subedi": {
    image: "https://github.com/sabal_subedi.png",
    github: "https://github.com/sabal_subedi",
  },
  "Alex Svancara": {
    image: "https://github.com/svanalex.png",
    github: "https://github.com/svanalex",
  },
};

const publications = [
  {
    citation:
      "P. M. Bodily, “LLMs, Computational Theory, and Redux: New Directions for CC in Computational Complexity,” in Proceedings of the Workshop on Theoretical CS and Computational Creativity, 2026.",
    url: "https://computationalcreativity.net/workshops/theorycs-cc-iccc26/",
    pdf: "https://portneuf.cose.isu.edu/research/publications/bodily_cc_in_computational_complexity.pdf",
  },
  {
    citation:
      "R. Phillips and P. M. Bodily. 2025. SPADE: A library for programmatic parsing and verification of discrete data structures. In 2025 Intermountain Engineering, Technology and Computing Conference (IETC), Orem, UT, USA, pp. 1–5.",
    doi: "https://ieeexplore.ieee.org/document/11039449",
    pdf: "https://portneuf.cose.isu.edu/research/publications/SPADE.pdf",
  },
  {
    citation:
      "A. Sevaljevic and P. M. Bodily. 2024. Comparative empirical analysis of dancing links implementations to solve the exact cover problem. In 2024 Intermountain Engineering, Technology and Computing Conference (IETC), Orem, UT, USA, pp. 255–258.",
    doi: "https://ieeexplore.ieee.org/document/10564396",
    pdf: "https://portneuf.cose.isu.edu/research/publications/IETC_2024_submission_dancing_links.pdf",
  },
  {
    citation:
      "Kaden Marchetti, Andrija Sevaljevic, Alex Diviney, Caleb Eardley, Russell Phillips, Rajiv Khadka, Daniel Igbokwe, and Paul Bodily. 2024. Redux: An Interactive, Dynamic Knowledge Base for Teaching NP-completeness. In Proceedings of the 2024 on Innovation and Technology in Computer Science Education V. 1 (ITiCSE 2024). Association for Computing Machinery, New York, NY, USA, 255–261.",
    doi: "https://dl.acm.org/doi/10.1145/3649217.3653544",
    pdf: "https://portneuf.cose.isu.edu/research/publications/ITiSCE_Redux_Submission_2024_WIP.pdf",
  },
  {
    citation:
      "K. Marchetti and P. Bodily. 2022. KAMI: Leveraging the power of crowd-sourcing to solve complex, real-world problems. In 2022 Intermountain Engineering, Technology and Computing Conference (IETC), Orem, UT, USA, pp. 1–4. Best Student Paper Award.",
    doi: "https://ieeexplore.ieee.org/document/9796945",
    pdf: "https://portneuf.cose.isu.edu/research/publications/KAMI_Leveraging_Open_Source_to_Solve_Complex_Problems.pdf",
  },
  {
    citation:
      "K. Marchetti and P. Bodily. 2022. Visualizing the 3SAT to CLIQUE Reduction Process. In 2022 Intermountain Engineering, Technology and Computing Conference (IETC), Orem, UT, USA, pp. 1–5.",
    doi: "https://ieeexplore.ieee.org/document/9796851",
    pdf: "https://portneuf.cose.isu.edu/research/publications/Visualizing_the_3SAT_to_CLIQUE_Reduction.pdf",
  },
  {
    citation:
      "P. M. Bodily and D. Ventura, “Open computational creativity problems in computational theory,” in Proceedings of the 13th International Conference on Computational Creativity (ICCC), 2022.",
    url: "https://computationalcreativity.net/iccc22/accepted-papers/",
    pdf: "https://portneuf.cose.isu.edu/research/publications/ICCC-2022_17L_Bodily-and-Ventura.pdf",
  },
];

const awards = [
  {
    citation:
      "Best Graduate Poster Presentation in Education, Learning & Training, Andrija Sevaljevic, 2026 ISU Research and Creative Works Symposium.",
    url: "https://myemail.constantcontact.com/What-s-Happening-in-CoSE.html?soid=1138359982044&aid=HHJEZevfPfU",
  },
  {
    citation:
      "Best Graduate Oral Presentation in Education, Learning & Training, Andrija Sevaljevic, 2026 ISU Research and Creative Works Symposium.",
    url: "https://myemail.constantcontact.com/What-s-Happening-in-CoSE.html?soid=1138359982044&aid=HHJEZevfPfU",
  },
];

const thesisAndDissertations = [
  {
    citation:
      "Andrija Sevaljevic, M.S. Thesis, Idaho State University, 2026, “Redux: Design and Implementation of a Reusable Web-Based Visualization System for Algorithmic and Logical Problem Solving”",
    url: "https://etd.iri.isu.edu/ViewSpecimen.aspx?ID=2565",
    pdf: "https://portneuf.cose.isu.edu/research/publications/andrija_thesis.pdf",
  },
  {
    citation:
      "Kaden Marchetti, M.S. Thesis, Idaho State University, 2023, “Redux: An Interactive, Dynamic Tool for Learning NP-completeness and Mapping Reductions”",
    url: "https://etd.iri.isu.edu/ViewSpecimen.aspx?ID=2206",
    pdf: "https://portneuf.cose.isu.edu/research/publications/kaden_thesis.pdf",
  },
];

const contributors = [
  "Kaden Marchetti",
  "Caleb Eardley",
  "Daniel Igbokwe",
  "Alex Diviney",
  "Janita Aamir",
  "Andrija Sevaljevic",
  "Garret Stouffer",
  "Alex Svancara",
  "Eric Hill",
  "Porter Glines",
  "Show Pratoomratana",
  "Russell Phillips",
  "Michael Crapse",
  "Ian Gonzalez",
  "Sabal Subedi",
  "Himanshu Jha",
  "Max Grünwoldt",
  "Paul Gilbreath",
  "Sansar Kharal",
  "Pratham Khanal",
  "George Lake",
  "Grant Gardner",
  "Jason Wright",
  "Andreas Kramer",
  "Courtney Bodily",
  "Rakesh Itani",
  "David Lindeman",
];

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#3F3F46" },
    secondary: { main: "#a855f7" },
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
  px: 1.1,
  py: 0.9,
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#F47C20",
    background: "#FFFFFF",
  },
};

function TitleSection({ children }) {
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

function getLastName(name) {
  return name.split(" ").slice(-1)[0].toLowerCase();
}

function ItemContributor({ name }) {
  const profile = contributorProfiles[name];
  if (!profile) {
    return (
      <Typography
        sx={{
          color: "#374151",
          fontSize: "0.9rem",
          lineHeight: 1.35,
        }}
      >
        {name}
      </Typography>
    );
  }
  return (
    <Tooltip
      arrow
      placement="right"
      title={
        <Box sx={{ p: 1, minWidth: 190 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}>
            <Avatar
              src={profile.image}
              alt={name}
              sx={{ width: 50, height: 50 }}
            />
            <Box>
              <Typography
                sx={{
                  color: "#111827",
                  fontWeight: 600,
                  fontSize: "0.92rem",
                }}
              >
                {name}
              </Typography>
              <Typography
                sx={{
                  color: "#6b7280",
                  fontSize: "0.78rem",
                }}
              >
                Contributor
              </Typography>
            </Box>
          </Box>

          <Link
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{
              color: "#F47C20",
              fontSize: "0.9rem",
              fontWeight: 500,
              display: "inline-block",
              mt: 0.25,
              "&:hover": {
                color: "#d9670f",
              },
            }}
          >
            View GitHub Profile
          </Link>
        </Box>
      }
      slotProps={{
        popper: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 6],
              },
            },
          ],
        },
        tooltip: {
          sx: {
            bgcolor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: "10px 12px",
          },
        },
      }}
    >
      <Box
        component="span"
        sx={{
          color: "#374151",
          fontSize: "0.9rem",
          lineHeight: 1.35,
          cursor: "pointer",
          width: "100%",
          "&:hover": {
            color: "#F47C20",
          },
        }}
      >
        {name}
      </Box>
    </Tooltip>
  );
}

export default function AboutUsPage() {
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
            <Box id="about" sx={{ ...theSectionCard, mb: 1.5 }}>
              <TitleSection>ABOUT US</TitleSection>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  lineHeight: 1.9,
                  textAlign: "justify",
                }}
              >
                Welcome to{" "}
                <Box component="span" sx={{ color: "#111827", fontWeight: 700 }}>
                  Redux
                </Box>
                , a platform for NP-Complete problems. Input your challenges and
                gain access to reductions, solutions, verifiers, and
                visualizations. Join our community of problem solvers and unravel
                computational complexities using the application library. The
                project was greatly inspired by Richard Karp&apos;s paper{" "}
                <Link
                  href="https://link.springer.com/chapter/10.1007/978-1-4684-2001-2_9"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ color: "#F47C20", fontWeight: 600 }}
                >
                  &quot;Reducibility Among Combinatorial Problems&quot;
                </Link>{" "}
                (Karp, 1972).
              </Typography>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  lineHeight: 1.8,
                  mt: 2,
                  textAlign: "justify",
                }}
              >
                When citing Redux, please use the following citation:
              </Typography>

              <Box sx={{ ...innerCard, mt: 1.2 }}>
                <Typography
                  sx={{
                    color: "#374151",
                    fontSize: "0.82rem",
                    lineHeight: 1.7,
                  }}
                >
                  Kaden Marchetti, Andrija Sevaljevic, Alex Diviney, Caleb
                  Eardley, Russell Phillips, Rajiv Khadka, Daniel Igbokwe, and
                  Paul Bodily. 2024. Redux: An Interactive, Dynamic Knowledge
                  Base for Teaching NP-completeness. In Proceedings of the 2024
                  on Innovation and Technology in Computer Science Education V. 1
                  (ITiCSE 2024). Association for Computing Machinery, New York,
                  NY, USA, 255–261.{" "}
                  <Link
                    href="https://dl.acm.org/doi/10.1145/3649217.3653544"
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{ color: "#F47C20", fontWeight: 600, ml: 0.4 }}
                  >
                    [DOI]
                  </Link>
                  <Link
                    href="https://portneuf.cose.isu.edu/research/publications/ITiSCE_Redux_Submission_2024_WIP.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{ color: "#F47C20", fontWeight: 600, ml: 0.4 }}
                  >
                    [PDF]
                  </Link>
                </Typography>
              </Box>
            </Box>

            <Box sx={{ ...theSectionCard, mb: 1.5 }}>
              <TitleSection>CONTRIBUTORS</TitleSection>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  lineHeight: 1.6,
                  mb: 2,
                }}
              >
                This project was started by{" "}
                <Link
                  href="https://www2.cose.isu.edu/~bodipaul/index.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ color: "#F47C20", fontWeight: 600 }}
                >
                  Dr. Paul Bodily
                </Link>
                , who is also the ISU Faculty Sponsor of the project.
              </Typography>

              <Typography
                sx={{
                  color: "#9ca3af",
                  fontSize: "0.87rem",
                  mb: 2,
                }}
              >
                Project contributors
              </Typography>

              <Grid container spacing={1.5}>
                {[...contributors]
                  .sort((a, b) => getLastName(a).localeCompare(getLastName(b)))
                  .map((name) => (
                    <Grid item xs={12} sm={6} md={4} key={name}>
                      <Box
                        sx={{
                          border: "1px solid #E5E7EB",
                          background: "#F9FAFB",
                          borderRadius: "10px",
                          px: 1.4,
                          py: 0.8,
                          minHeight: "34px",
                          display: "flex",
                          alignItems: "center",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: "#F47C20",
                            background: "#FFFFFF",
                          },
                        }}
                      >
                        <ItemContributor name={name} />
                      </Box>
                    </Grid>
                  ))}
              </Grid>
            </Box>

            <Box sx={{ ...theSectionCard, mb: 1.5 }}>
              <TitleSection>PUBLICATIONS</TitleSection>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  mb: 3,
                }}
              >
                Below are research publications associated with the Redux
                project and its contributors.
              </Typography>

              <Box sx={{ display: "grid", gap: 0.8 }}>
                {publications.map((item, index) => (
                  <Box key={index} sx={innerCard}>
                    <Typography
                      sx={{
                        color: "#374151",
                        fontSize: "0.82rem",
                        lineHeight: 1.7,
                      }}
                    >
                      {item.citation}{" "}

                      {item.doi && (
                        <Link
                          href={item.doi}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{
                            color: "#F47C20",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            ml: 0.4,
                          }}
                        >
                          [DOI]
                        </Link>
                      )}

                      {item.url && (
                        <Link
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{
                            color: "#F47C20",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            ml: 0.4,
                          }}
                        >
                          [URL]
                        </Link>
                      )}

                      {item.pdf && (
                        <Link
                          href={item.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{
                            color: "#F47C20",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            ml: 0.4,
                          }}
                        >
                          [PDF]
                        </Link>
                      )}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ ...theSectionCard, mb: 1.5 }}>
              <TitleSection>AWARDS</TitleSection>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  mb: 3,
                }}
              >
                Below are awards associated with the Redux project and its
                contributors.
              </Typography>

              <Box sx={{ display: "grid", gap: 0.8 }}>
                {awards.map((item, index) => (
                  <Box key={index} sx={innerCard}>
                    <Typography
                      sx={{
                        color: "#374151",
                        fontSize: "0.82rem",
                        lineHeight: 1.7,
                      }}
                    >
                      {item.citation}{" "}

                      {item.doi && (
                        <Link
                          href={item.doi}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{
                            color: "#F47C20",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            ml: 0.4,
                          }}
                        >
                          [DOI]
                        </Link>
                      )}

                      {item.pdf && (
                        <Link
                          href={item.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{
                            color: "#F47C20",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            ml: 0.4,
                          }}
                        >
                          [PDF]
                        </Link>
                      )}

                      {item.url && (
                        <Link
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{
                            color: "#F47C20",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            ml: 0.4,
                          }}
                        >
                          [URL]
                        </Link>
                      )}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ ...theSectionCard, mb: 1.5 }}>
              <TitleSection>THESES AND DISSERTATIONS</TitleSection>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  mb: 3,
                }}
              >
                Below are theses and dissertations associated with the Redux
                project.
              </Typography>

              <Box sx={{ display: "grid", gap: 0.8 }}>
                {thesisAndDissertations.map((item, index) => (
                  <Box key={index} sx={innerCard}>
                    <Typography
                      sx={{
                        color: "#374151",
                        fontSize: "0.82rem",
                        lineHeight: 1.7,
                      }}
                    >
                      {item.citation}{" "}

                      {item.url && (
                        <Link
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{
                            color: "#F47C20",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            ml: 0.4,
                          }}
                        >
                          [URL]
                        </Link>
                      )}

                      {item.pdf && (
                        <Link
                          href={item.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{
                            color: "#F47C20",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            ml: 0.4,
                          }}
                        >
                          [PDF]
                        </Link>
                      )}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ ...theSectionCard, mb: 1.5 }}>
              <TitleSection>SUPPORT</TitleSection>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  lineHeight: 1.9,
                  mb: 2,
                }}
              >
                Redux has been supported by the following grants:
              </Typography>

              <Box sx={{ display: "grid", gap: 0.8 }}>
                {[
                  "Bodily, P.M. (Co-Lead), Bradley, J. (Co-Lead), Romney, A. (Co-PI), Petersen, J. (Co-I), “BengalBot MCP: Building AI-Literate Students at Idaho State University,” U.S. Department of Education (DOE) Fund for Improvement of Post-Secondary Education (FIPSE). $300,000. 2026.",
                  "Trosper, M.J., “Applied Computational Models and Algorithmic Solutions to Common Optimization Problems In Energy-Water Systems,” Summer Authentic Research Experience (SARE), Idaho Community-engaged Resilience for Energy-Water Systems (I-CREWS), National Science Foundation (NSF). $6,000. 2026.",
                  "“Crowd-Sourcing and Visualization of Advanced Computational Theory to Facilitate Application of Algorithmic Knowledgebase to Real-World Combinatorial Problems,” Center for Advanced Energy Studies (CAES). 2024.",
                  "“Application of advanced computational theory to facilitate efficient solutions to real-world combinatorial problems”, Center for Advanced Energy Studies (CAES). 2022.",
                  "“Interactive visualization tools for teaching computer science theory”, Idaho State University Office of Research. 2022.",
                ].map((grant, index) => (
                  <Box key={index} sx={innerCard}>
                    <Typography
                      sx={{
                        color: "#374151",
                        fontSize: "0.85rem",
                        lineHeight: 1.7,
                      }}
                    >
                      {grant}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.82rem",
                  lineHeight: 1.8,
                  mt: 2.2,
                  textAlign: "justify",
                }}
              >
                Any opinions, findings, conclusions, or recommendations
                expressed in this material are those of the author(s) and do not
                necessarily reflect the views of the funding agencies who have
                supported this work.
              </Typography>
            </Box>

            <Box sx={{ ...theSectionCard, mb: 1.5 }}>
              <TitleSection>LICENSE</TitleSection>

              <Typography
                sx={{
                  color: "#374151",
                  fontSize: "0.87rem",
                  lineHeight: 1.8,
                }}
              >
                This work is licensed under the{" "}
                <Link
                  href="https://opensource.org/license/bsd-3-clause"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ color: "#F47C20", fontWeight: 600 }}
                >
                  BSD 3-Clause License
                </Link>.
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
