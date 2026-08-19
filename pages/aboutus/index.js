import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
import { useEffect, useState } from "react";
import { requestContributorDirectory, requestContributorProfile } from "../../components/redux";


//UI Components
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import isulogo from "../../components/images/ISULogo.png"; //Used for ISU logo at the bottom

const reduxBaseUrl = "/api/redux/";




//Global Styling
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


//List of research papers
const publications = [
  {
    authors: "R. Phillips and P. M. Bodily",
    title:
      "Spade: A library for programmatic parsing and verification of discrete data structures",
    venue:
      "2025 Intermountain Engineering, Technology and Computing (IETC), pp. 1–5, IEEE, 2025",
    pdfUrl:
      "https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=11039449",
  },
  {
    authors:
      "K. Marchetti, A. Sevaljevic, A. Diviney, R. Phillips, C. Eardley, R. Khadka, D. Igbokwe, and P. M. Bodily",
    title:
      "Redux: An interactive, dynamic knowledge base for teaching NP-completeness",
    venue:
      "Proceedings of the 29th annual ACM conference on Innovation and Technology in Computer Science Education (ITiCSE), 2024",
    pdfUrl: "https://etd.iri.isu.edu/ViewSpecimen.aspx?ID=2206",
  },
  {
    authors: "A. Sevaljevic and P. M. Bodily",
    title:
      "Comparative empirical analysis of dancing links implementations to solve the exact cover problem",
    venue:
      "Proceedings of the 4th Intermountain Engineering, Technology, and Computing Conference (i-ETC), pp. 255–258, IEEE, 2024",
    pdfUrl: "https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=10564396",
  },
  {
    authors: "K. Marchetti and P. Bodily",
    title: "Visualizing the 3SAT to CLIQUE Reduction Process",
    venue:
      "2022 Intermountain Engineering, Technology and Computing (IETC), Orem, UT, USA, 2022, pp. 1-5",
    pdfUrl:
      "https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=9796851",
  },
  {
    authors: "K. Marchetti and P. Bodily",
    title:
      "KAMI: Leveraging the power of crowd-sourcing to solve complex, real-world problems",
    venue:
      "2022 Intermountain Engineering, Technology and Computing (IETC), Orem, UT, USA, 2022, pp. 1-4",
    pdfUrl: "https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=9796945",
  },
];




// Contributor GitHub avatar/link, keyed by name. Populated from the backend's
// contributor directory (see AboutUsPage) instead of being hardcoded here, so
// new contributors show up without a frontend change.




//Other links sections at the bottom
const learnMoreHyperlink = [
  { label: "Github", url: "https://github.com/ReduxISU/" },
  {
    label: "Wikipedia: What is NP-Complete?",
    url: "https://en.wikipedia.org/wiki/NP-completeness",
  },
  {
    label: "Karp&apos;s 21 NP-Complete Problems",
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



//It controls all the sections of About, Publications and Contributors
const theSectionCard = {
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




//For the reusable title sections 
function TitleSection({ children }) {
  return (
    <Typography
      sx={{
        color: "#ffffff", //color of the font, plain whiwte in general
        fontSize: "0.85rem", //font size
        fontWeight: 600,
        letterSpacing: "0.22em",
        mb: 2,
      }}
    >
      {children}
    </Typography>
  );
}


function ItemContributor({ name, profile, onSelect }) {
  if (!profile) {
    return (
      <Typography
        onClick={() => onSelect(name)}
        sx={{
          color: "#e5e7eb",
          fontSize: "0.8rem",
          lineHeight: 0.89,
          cursor: "pointer",
          "&:hover": {
            color: "#d8b4fe",
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
            bgcolor: "#111118",
            border: "1px solid rgba(168,85,247,0.35)",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            padding: "10px 12px",
          },
        },
      }}
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
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.92rem",
                }}
              >
                {name}
              </Typography>
              <Typography
                sx={{
                  color: "#cbd5e1",
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
              color: "#e9d5ff",
              fontSize: "0.9rem",
              fontWeight: 500,
              display: "inline-block",
              mt: 0.25,
              "&:hover": {
                color: "#c084fc",
              },
            }}
          >
            View GitHub Profile
          </Link>
        </Box>
      }
    >
      <Box
        component="span"
        onClick={() => onSelect(name)}
        sx={{
          color: "#e5e7eb",
          fontSize: "0.9rem",
          lineHeight: 1.35,
          cursor: "pointer",
          width: "100%",
          "&:hover": {
            color: "#d8b4fe",
          },
        }}
      >
        {name}
      </Box>
    </Tooltip>
  );
}


function ContributionList({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ color: "#e5e7eb", fontSize: "0.87rem" }}>
        <Box component="span" sx={{ fontWeight: 600 }}>{label}:</Box> {items.length}
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 3, color: "#9ca3af", fontSize: "0.82rem" }}>
        {items.map((item) => (
          <Box component="li" key={item}>{item}</Box>
        ))}
      </Box>
    </Box>
  );
}


//Default function
export default function AboutUsPage() {
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


        <Container maxWidth="lg" sx={{ pt: 2 }}>
          <Box sx={{ maxWidth: "900px", mx: "auto" }}>
            <Box id="about" sx={{ ...theSectionCard, mb: 1.5 }}>
              <TitleSection>ABOUT US</TitleSection>
              <Typography
                sx={{
                  color: "#d1d5db",
                  fontSize: "0.87rem",
                  lineHeight: 1.9,
                  textAlign: "justify"
                }}
              >
                Welcome to <Box component="span" sx={{ color: "#fff", fontWeight: 500 }}>Redux</Box>, a
                platform for NP-Complete problems. Input your challenges and gain access to
                reductions, solutions, verifiers, and visualizations. Join our community of
                problem solvers and unravel computational complexities using the application
                library. The project was greatly inspired by Richard Karp&apos;s paper{" "}
                <Link
                  href="https://link.springer.com/chapter/10.1007/978-1-4684-2001-2_9"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ color: "#c084fc" }}
                >
                  &quot;Reducibility Among Combinatorial Problems&quot;
                </Link>{" "}
                (Karp, 1972).
              </Typography>
            </Box>

            <Box sx={{ ...theSectionCard, mb: 1.5 }}>
              <TitleSection>PUBLICATIONS</TitleSection>
              <Typography sx={{ color: "#d1d5db", fontSize: "0.87rem", mb: 3 }}>
                Below are research publications associated with the Redux project and its contributors.
              </Typography>

              <Box sx={{ display: "grid", gap: .5 }}>
                {publications.map((pub, index) => (
                  <Box
                    key={index}
                    sx={{
                      color: "#d1d5db",
                      fontSize: "0.8rem",
                      lineHeight: 1.8,
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.06)",
                      background: "rgba(255,255,255,0.02)",
                      p: 2,
                      "&:hover": {
                        borderColor: "rgba(168,85,247,0.3)",
                        background: "rgba(255,255,255,0.04)",
                      },
                    }}
                  >
                    <Box component="span" sx={{ color: "#9ca3af" }}>{pub.authors}, </Box>
                    <Box component="span" sx={{ color: "#fff" }}>&quot;{pub.title},&quot; </Box>
                    <Box component="span" sx={{ color: "#6b7280", fontStyle: "italic" }}>
                      {pub.venue}.
                    </Box>{" "}
                    <Link
                      href={pub.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      sx={{ color: "#c084fc" }}
                    >
                      [PDF]
                    </Link>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ ...theSectionCard, mb: 1 }}>
  <TitleSection>CONTRIBUTORS</TitleSection>

  <Typography
    sx={{
      color: "#d1d5db",
      fontSize: "0.87rem",
      lineHeight: 1.8,
      mb: 2,
    }}
  >
    This project was started by{" "}
    <Link
      href="https://www2.cose.isu.edu/~bodipaul/index.php"
      target="_blank"
      rel="noopener noreferrer"
      underline="hover"
      sx={{ color: "#a78bfa" }}
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

  {contributorsLoading ? (
    <Typography sx={{ color: "#9ca3af", fontSize: "0.85rem" }}>
      Loading contributors...
    </Typography>
  ) : contributors.length === 0 ? (
    <Typography sx={{ color: "#9ca3af", fontSize: "0.85rem" }}>
      Contributor list unavailable right now.
    </Typography>
  ) : (
    <Grid container spacing={1.5}>
      {contributors.map((name) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={name}>
          <Box
            sx={{
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "10px",
              px: 1.4,
              py: 0.6,
              minHeight: "30px",
              display: "flex",
              alignItems: "center",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "rgba(168,85,247,0.28)",
                background: "rgba(255,255,255,0.04)",
              },
            }}
          >
            <ItemContributor
              name={name}
              profile={contributorProfiles[name]}
              onSelect={handleContributorClick}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  )}
</Box>

            <Box
              sx={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.10)",
                p: 3,
                mb: 4,
              }}
            >
              <TitleSection>LEARN MORE</TitleSection>
              <Typography sx={{ color: "#d1d5db", fontSize: "0.87rem", mb: 2 }}>
                Additional documentation can be found at the following links:
              </Typography>

              <Box sx={{ display: "grid", gap: 1.2 }}>
                {learnMoreHyperlink.map((item) => (
                  <Link
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none"
                    sx={{
                      color: "#c084fc",
                      fontSize: "0.8rem",
                      "&:hover": { color: "#e9d5ff" },
                    }}
                  >
                    • {item.label}
                  </Link>
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
    sx={{
      display: "inline-flex",
      opacity: 60,
    }}
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

      {/* Contributor Profile Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#111118",
              border: "1px solid rgba(168,85,247,0.35)",
              borderRadius: "16px",
            },
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2, color: "#ffffff" }}>
          {contributorProfiles[selectedContributor] && (
            <Avatar
              src={contributorProfiles[selectedContributor].image}
              alt={selectedContributor}
              sx={{ width: 48, height: 48, border: "2px solid #a855f7" }}
            />
          )}
          {selectedContributor}
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{ position: "absolute", right: 8, top: 8, color: "#9ca3af" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.1)" }}>
          {profileLoading ? (
            <Typography sx={{ color: "#9ca3af" }}>Loading...</Typography>
          ) : profileData ? (
            <Box sx={{ color: "#d1d5db", fontSize: "0.87rem" }}>
              <Typography sx={{ color: "#ffffff", fontWeight: 600, mb: 1 }}>
                Personal Information
              </Typography>
              <Typography sx={{ mb: 0.5 }}>
                <Box component="span" sx={{ fontWeight: 600 }}>Email:</Box>{" "}
                {profileData.email ?? profileData.Email ?? "Not specified"}
              </Typography>
              <Typography sx={{ mb: 0.5 }}>
                <Box component="span" sx={{ fontWeight: 600 }}>Education:</Box>{" "}
                {profileData.education ?? profileData.Education ?? "Not specified"}
              </Typography>
              <Typography sx={{ mb: 0.5 }}>
                <Box component="span" sx={{ fontWeight: 600 }}>Major:</Box>{" "}
                {profileData.major ?? profileData.Major ?? "Not specified"}
              </Typography>
              <Typography sx={{ mb: 2 }}>
                <Box component="span" sx={{ fontWeight: 600 }}>Bio:</Box>{" "}
                {profileData.bio ?? profileData.Bio ?? "Not specified"}
              </Typography>

              {contributorProfiles[selectedContributor] && (
                <Typography sx={{ mb: 2 }}>
                  <Box component="span" sx={{ fontWeight: 600 }}>GitHub:</Box>{" "}
                  <Link
                    href={contributorProfiles[selectedContributor].github}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{ color: "#c084fc" }}
                  >
                    {contributorProfiles[selectedContributor].github.replace("https://", "")}
                  </Link>
                </Typography>
              )}

              <Typography sx={{ color: "#ffffff", fontWeight: 600, mb: 1 }}>
                Contributions
              </Typography>
              <Typography sx={{ mb: 1.5 }}>
                <Box component="span" sx={{ fontWeight: 600 }}>Total:</Box>{" "}
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
            <Typography sx={{ color: "#9ca3af" }}>No profile data found.</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal} sx={{ color: "#c084fc" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </ThemeProvider>
  );
}
