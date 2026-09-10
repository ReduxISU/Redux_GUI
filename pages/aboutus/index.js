import CloseIcon from "@mui/icons-material/Close";
import GitHubIcon from "@mui/icons-material/GitHub";
import {
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import isulogo from "../../components/images/ISULogo.png";
import { requestContributorDirectory, requestContributorProfile } from "../../components/redux";
import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
import ProblemSection from "../../components/widgets/ProblemSection";
import { pageBackground, innerCardSx, textColors, surfaceColors } from "../../components/theme";
import { useThemeMode } from "../../components/ThemeModeContext";

const reduxBaseUrl = "/api/redux/";

// Expanded section bodies scroll instead of growing the page without bound --
// matters most for Contributors (long multi-column list) and
// Publications/Awards (growing lists over time).
const SCROLLABLE_BODY_SX = { maxHeight: "60vh", overflowY: "auto", pr: 1 };

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

// Section title used inside each accordion header (ProblemSection.Header).
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

function getLastName(name) {
  return name.split(" ").slice(-1)[0].toLowerCase();
}

function ItemContributor({ name, profile, onSelect }) {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  const surface = surfaceColors(mode);
  if (!profile) {
    return (
      <Typography
        onClick={() => onSelect(name)}
        sx={{
          color: text.body,
          fontSize: "0.9rem",
          lineHeight: 1.35,
          cursor: "pointer",
          "&:hover": {
            color: "#F47C20",
          },
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
            <Avatar src={profile.image} alt={name} sx={{ width: 50, height: 50 }} />
            <Box>
              <Typography
                sx={{
                  color: text.heading,
                  fontWeight: 600,
                  fontSize: "0.92rem",
                }}
              >
                {name}
              </Typography>
              <Typography
                sx={{
                  color: text.caption,
                  fontSize: "0.78rem",
                }}
              >
                Contributor
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
            <Link
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name}'s GitHub profile`}
              sx={{
                color: "#F47C20",
                display: "inline-flex",
                alignItems: "center",
                "&:hover": {
                  color: "#d9670f",
                },
              }}
            >
              <GitHubIcon fontSize="small" />
            </Link>
            <Typography
              sx={{
                color: text.caption,
                fontSize: "0.82rem",
                fontStyle: "italic",
              }}
            >
              Click name for more details
            </Typography>
          </Box>
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
            bgcolor: surface.surface,
            border: `1px solid ${surface.border}`,
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: "10px 12px",
          },
        },
      }}
    >
      <Box
        component="span"
        onClick={() => onSelect(name)}
        sx={{
          color: text.body,
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

// Only renders when there's an actual value -- avoids "Not specified" clutter for
// fields (bio, education, ...) a contributor hasn't filled in.
function ProfileField({ label, value }) {
  if (!value) return null;
  return (
    <Typography sx={{ mb: 0.5 }}>
      <Box component="span" sx={{ fontWeight: 600 }}>
        {label}:
      </Box>{" "}
      {value}
    </Typography>
  );
}

function ContributionList({ label, items }) {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  if (!items || items.length === 0) return null;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ color: text.heading, fontSize: "0.87rem" }}>
        <Box component="span" sx={{ fontWeight: 600 }}>
          {label}:
        </Box>{" "}
        {items.length}
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 3, color: text.caption, fontSize: "0.82rem" }}>
        {items.map((item) => (
          <Box component="li" key={item}>
            {item}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function AboutUsPage() {
  const { mode } = useThemeMode();
  const text = textColors(mode);
  const surface = surfaceColors(mode);
  const innerCard = innerCardSx(mode);

  const [contributors, setContributors] = useState([]);
  const [contributorProfiles, setContributorProfiles] = useState({});
  const [contributorsLoading, setContributorsLoading] = useState(true);

  const [selectedContributor, setSelectedContributor] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    requestContributorDirectory(reduxBaseUrl).then((entries) => {
      if (cancelled) return;
      setContributorsLoading(false);
      if (!entries) return;

      const names = [];
      const profiles = {};
      for (const entry of entries) {
        const name = entry.name ?? entry.Name;
        const githubUsername = entry.githubUsername ?? entry.GithubUsername;
        if (!name) continue;

        names.push(name);
        if (githubUsername) {
          profiles[name] = {
            image: `https://github.com/${githubUsername}.png`,
            github: `https://github.com/${githubUsername}`,
          };
        }
      }
      setContributors(names);
      setContributorProfiles(profiles);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleContributorClick = (name) => {
    setSelectedContributor(name);
    setProfileData(null);
    setProfileLoading(true);
    setModalOpen(true);

    requestContributorProfile(reduxBaseUrl, name).then((data) => {
      setProfileData(data ?? null);
      setProfileLoading(false);
    });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedContributor(null);
    setProfileData(null);
    setProfileLoading(false);
  };

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
          <Box id="about" sx={{ mb: 1.5 }}>
            <ProblemSection defaultCollapsed={false}>
              <ProblemSection.Header title={<SectionTitle>ABOUT US</SectionTitle>} titleWidth="auto">
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
                    }}
                  >
                    Welcome to{" "}
                    <Box component="span" sx={{ color: text.heading, fontWeight: 700 }}>
                      Redux
                    </Box>
                    , a dynamic, interactive computer science knowledgebase
                    consisting of canonical computer science problems,
                    solutions, and reduction algorithms. Join our community of
                    problem solvers and unravel computational complexities
                    using the application library. The project was greatly
                    inspired by Richard Karp&apos;s paper{" "}
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
                      color: text.body,
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
                        color: text.body,
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
              </ProblemSection.Body>
            </ProblemSection>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <ProblemSection defaultCollapsed={true}>
              <ProblemSection.Header title={<SectionTitle>CONTRIBUTORS</SectionTitle>} titleWidth="auto">
                <Box sx={{ flexGrow: 1 }} />
              </ProblemSection.Header>
              <ProblemSection.Body>
                <Box sx={SCROLLABLE_BODY_SX}>
                  <Typography
                    sx={{
                      color: text.body,
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
                      color: text.faint,
                      fontSize: "0.87rem",
                      mb: 2,
                    }}
                  >
                    Project contributors
                  </Typography>

                  {contributorsLoading ? (
                    <Typography sx={{ color: text.caption, fontSize: "0.85rem" }}>
                      Loading contributors...
                    </Typography>
                  ) : contributors.length === 0 ? (
                    <Typography sx={{ color: text.caption, fontSize: "0.85rem" }}>
                      Contributor list unavailable right now.
                    </Typography>
                  ) : (
                    // CSS multi-column layout (not a Grid) so the alphabetical order reads
                    // top-to-bottom within a column, then wraps to the next column -- a
                    // Grid/flex wrap would instead fill left-to-right row by row, breaking
                    // the alphabetical reading order across the row.
                    <Box sx={{ columns: { xs: 1, sm: 2, md: 3 }, columnGap: "12px" }}>
                      {[...contributors]
                        .sort((a, b) => getLastName(a).localeCompare(getLastName(b)))
                        .map((name) => (
                          <Box
                            key={name}
                            sx={{
                              breakInside: "avoid",
                              border: `1px solid ${surface.border}`,
                              background: surface.surfaceAlt,
                              borderRadius: "10px",
                              px: 1.4,
                              py: 0.8,
                              mb: 1.5,
                              minHeight: "34px",
                              display: "flex",
                              alignItems: "center",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                borderColor: "#F47C20",
                                background: surface.surfaceAltHover,
                              },
                            }}
                          >
                            <ItemContributor
                              name={name}
                              profile={contributorProfiles[name]}
                              onSelect={handleContributorClick}
                            />
                          </Box>
                        ))}
                    </Box>
                  )}
                </Box>
              </ProblemSection.Body>
            </ProblemSection>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <ProblemSection defaultCollapsed={true}>
              <ProblemSection.Header title={<SectionTitle>PUBLICATIONS</SectionTitle>} titleWidth="auto">
                <Box sx={{ flexGrow: 1 }} />
              </ProblemSection.Header>
              <ProblemSection.Body>
                <Box sx={SCROLLABLE_BODY_SX}>
                  <Typography
                    sx={{
                      color: text.body,
                      fontSize: "0.87rem",
                      mb: 3,
                    }}
                  >
                    Below are research publications associated with the Redux project and its
                    contributors.
                  </Typography>

                  <Box sx={{ display: "grid", gap: 0.8 }}>
                    {publications.map((item, index) => (
                      <Box key={index} sx={innerCard}>
                        <Typography
                          sx={{
                            color: text.body,
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
              </ProblemSection.Body>
            </ProblemSection>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <ProblemSection defaultCollapsed={true}>
              <ProblemSection.Header title={<SectionTitle>AWARDS</SectionTitle>} titleWidth="auto">
                <Box sx={{ flexGrow: 1 }} />
              </ProblemSection.Header>
              <ProblemSection.Body>
                <Box sx={SCROLLABLE_BODY_SX}>
                  <Typography
                    sx={{
                      color: text.body,
                      fontSize: "0.87rem",
                      mb: 3,
                    }}
                  >
                    Below are awards associated with the Redux project and its contributors.
                  </Typography>

                  <Box sx={{ display: "grid", gap: 0.8 }}>
                    {awards.map((item, index) => (
                      <Box key={index} sx={innerCard}>
                        <Typography
                          sx={{
                            color: text.body,
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
              </ProblemSection.Body>
            </ProblemSection>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <ProblemSection defaultCollapsed={true}>
              <ProblemSection.Header
                title={<SectionTitle>THESES AND DISSERTATIONS</SectionTitle>}
                titleWidth="auto"
              >
                <Box sx={{ flexGrow: 1 }} />
              </ProblemSection.Header>
              <ProblemSection.Body>
                <Box sx={SCROLLABLE_BODY_SX}>
                  <Typography
                    sx={{
                      color: text.body,
                      fontSize: "0.87rem",
                      mb: 3,
                    }}
                  >
                    Below are theses and dissertations associated with the Redux project.
                  </Typography>

                  <Box sx={{ display: "grid", gap: 0.8 }}>
                    {thesisAndDissertations.map((item, index) => (
                      <Box key={index} sx={innerCard}>
                        <Typography
                          sx={{
                            color: text.body,
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
              </ProblemSection.Body>
            </ProblemSection>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <ProblemSection defaultCollapsed={true}>
              <ProblemSection.Header title={<SectionTitle>SUPPORT</SectionTitle>} titleWidth="auto">
                <Box sx={{ flexGrow: 1 }} />
              </ProblemSection.Header>
              <ProblemSection.Body>
                <Box sx={SCROLLABLE_BODY_SX}>
                  <Typography
                    sx={{
                      color: text.body,
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
                            color: text.body,
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
                      color: text.body,
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
              </ProblemSection.Body>
            </ProblemSection>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <ProblemSection defaultCollapsed={true}>
              <ProblemSection.Header title={<SectionTitle>LICENSE</SectionTitle>} titleWidth="auto">
                <Box sx={{ flexGrow: 1 }} />
              </ProblemSection.Header>
              <ProblemSection.Body>
                <Box sx={SCROLLABLE_BODY_SX}>
                  <Typography
                    sx={{
                      color: text.body,
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
                    </Link>
                    .
                  </Typography>
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

      {/* Contributor Profile Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: surface.surface,
              border: `1px solid ${surface.border}`,
              borderRadius: "16px",
            },
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2, color: text.heading }}>
          {contributorProfiles[selectedContributor] && (
            <Avatar
              src={contributorProfiles[selectedContributor].image}
              alt={selectedContributor}
              sx={{ width: 48, height: 48, border: "2px solid #F47C20" }}
            />
          )}
          {selectedContributor}
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{ position: "absolute", right: 8, top: 8, color: text.caption }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: surface.border }}>
          {profileLoading ? (
            <Typography sx={{ color: text.caption }}>Loading...</Typography>
          ) : profileData ? (
            <Box sx={{ color: text.body, fontSize: "0.87rem" }}>
              <Typography sx={{ color: text.heading, fontWeight: 600, mb: 1 }}>
                Personal Information
              </Typography>
              <ProfileField label="Email" value={profileData.email ?? profileData.Email} />
              <ProfileField
                label="Education"
                value={profileData.education ?? profileData.Education}
              />
              <ProfileField label="Major" value={profileData.major ?? profileData.Major} />
              <ProfileField label="Bio" value={profileData.bio ?? profileData.Bio} />

              {contributorProfiles[selectedContributor] && (
                <Typography sx={{ mb: 2 }}>
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    GitHub:
                  </Box>{" "}
                  <Link
                    href={contributorProfiles[selectedContributor].github}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{ color: "#F47C20", fontWeight: 600 }}
                  >
                    {contributorProfiles[selectedContributor].github.replace("https://", "")}
                  </Link>
                </Typography>
              )}

              <Typography sx={{ color: text.heading, fontWeight: 600, mb: 1 }}>
                Contributions
              </Typography>
              <Typography sx={{ mb: 1.5 }}>
                <Box component="span" sx={{ fontWeight: 600 }}>
                  Total:
                </Box>{" "}
                {profileData.totalContributions ?? profileData.TotalContributions ?? 0}
              </Typography>

              <ContributionList
                label="Problems"
                items={profileData.problemsContributed ?? profileData.ProblemsContributed}
              />
              <ContributionList
                label="Solvers"
                items={profileData.solversCreated ?? profileData.SolversCreated}
              />
              <ContributionList
                label="Reductions"
                items={profileData.reductionsCreated ?? profileData.ReductionsCreated}
              />
            </Box>
          ) : (
            <Typography sx={{ color: text.caption }}>No profile data found.</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal} sx={{ color: "#F47C20" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
