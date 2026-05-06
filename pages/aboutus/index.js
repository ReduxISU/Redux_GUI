import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";


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
} from "@mui/material";
import isulogo from "../../components/images/ISULogo.png"; //Used for ISU logo at the bottom

// New Data Array awards for Awards Sections
const awards = [
  {
    text: "Best Graduate Poster Presentation in Education, Learning & Training (Andrija Sevaljevic), 2026 ISU Research and Creative Works Symposium",
    url: "https://myemail.constantcontact.com/What-s-Happening-in-CoSE.html?soid=1138359982044&aid=HHJEZevfPfU",
  },
  {
    text: "Best Graduate Oral Presentation in Education, Learning & Training (Andrija Sevaljevic), 2026 ISU Research and Creative Works Symposium",
    url: "https://myemail.constantcontact.com/What-s-Happening-in-CoSE.html?soid=1138359982044&aid=HHJEZevfPfU",
  },
  {
    text: "Best Student Paper Award, K. Marchetti and P. M. Bodily, “KAMI: Leveraging the power of crowd-sourcing to solve complex, real-world problems,” in Proceedings of the 2nd Intermountain Engineering, Technology, and Computing Conference (i-ETC), 2022",
    url: "https://myemail.constantcontact.com/ISU-STEM-Connections.html?soid=1138359982044&aid=J1PvVbF7PHo#:~:text=At%20the%20Intermountain%20Conference%20on,forward%20to%20continuing%20my%20research.%E2%80%9D",
  },
];


//New data array funding for Fundings section
const funding = [
  "Bodily, P.M. (PI), Trosper, M. (Student), “Applied Computational Models and Algorithmic Solutions to Common Optimization Problems In Energy-Water Systems,” NSF (I-CREWS), $6,500, 2026",
  "Bodily, P.M. (PI), Khadka, R. (Co-PI), “Crowd-Sourcing and Visualization of Advanced Computational Theory,” CAES, $15,000, 2024",
  "Bodily, P.M. (PI), Khadka, R. (Co-PI), “Application of advanced computational theory to real-world combinatorial problems,” CAES, $22,570, 2022",
  "Bodily, P.M. (PI), “Interactive visualization tools for teaching computer science theory,” ISU Office of Research, $4,954, 2022",
  "Career Path Internship, Idaho State University, 2022 – Present",
];



//Changing this to light theme.
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#8b5cf6" },
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


//List of research papers
const publications = [
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
      "K. Marchetti and P. Bodily. 2022. KAMI: Leveraging the power of crowd-sourcing to solve complex, real-world problems. In 2022 Intermountain Engineering, Technology and Computing Conference (IETC), Orem, UT, USA, pp. 1–4.",
    doi: "https://ieeexplore.ieee.org/document/9796945",
    pdf: "https://portneuf.cose.isu.edu/research/publications/KAMI_Leveraging_Open_Source_to_Solve_Complex_Problems.pdf",
  },

  {
    citation:
      "R. Phillips and P. M. Bodily. 2025. SPADE: A library for programmatic parsing and verification of discrete data structures. In 2025 Intermountain Engineering, Technology and Computing Conference (IETC), Orem, UT, USA, pp. 1–5.",
    doi: "https://ieeexplore.ieee.org/document/11039449",
    pdf: "https://portneuf.cose.isu.edu/research/publications/SPADE.pdf",
  },

  {
    citation:
      "K. Marchetti and P. Bodily. 2022. Visualizing the 3SAT to CLIQUE Reduction Process. In 2022 Intermountain Engineering, Technology and Computing Conference (IETC), Orem, UT, USA, pp. 1–5.",
    doi: "https://ieeexplore.ieee.org/document/9796851",
    pdf: "https://portneuf.cose.isu.edu/research/publications/Visualizing_the_3SAT_to_CLIQUE_Reduction.pdf",
  },
];




//The only contributors whose github profiles are found along with its avatar and link
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
    "Michael Crapse": {
    image: "https://github.com/mdcrapse.png",
    github: "https://github.com/mdcrapse",
  },
      "Eric Hill": {
    image: "https://github.com/starman2995.png",
    github: "https://github.com/starman2995",
  },
};



//It controls all the sections of About, Publications and Contributors
//About Us section card styling
const theSectionCard = {
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
  px: 1.1,
  py: 0.9,
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#8b5cf6",
    background: "#FFFFFF",
  },
};




//For the reusable title sections 
function TitleSection({ children }) {
  return (
    <Typography
      sx={{
        color: "#111827", 
        fontSize: "0.85rem", //font size
        fontWeight: 700,
        letterSpacing: "0.22em",
        mb: 2,
      }}
    >
      {children}
    </Typography>
  );
}


function ItemContributor({ name }) {
  const profile = contributorProfiles[name];
  if (!profile) {
    return (
      <Typography
        sx={{
          color: "#374151",
          fontSize: "0.8rem",
          lineHeight: 0.89,
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
      componentsProps={{
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
            color: "#8b5cf6",
          },
        }}
      >
        {name}
      </Box>
    </Tooltip>
  );
}


//Default function
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
                  textAlign: "justify"
                }}
              >
                Welcome to <Box component="span" sx={{ color: "#111827", fontWeight: 700 }}>Redux</Box>, a
                platform for NP-Complete problems. Input your challenges and gain access to
                reductions, solutions, verifiers, and visualizations. Join our community of
                problem solvers and unravel computational complexities using the application
                library. The project was greatly inspired by Richard Karp&apos;s paper{" "}
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
            </Box>

            <Box sx={{ ...theSectionCard, mb: 1.5 }}>
              <TitleSection>PUBLICATIONS</TitleSection>
              <Typography sx={{ color: "#374151", fontSize: "0.87rem", mb: 3 }}>
                Below are research publications associated with the Redux project and its contributors.
              </Typography>

              <Box sx={{ display: "grid", gap: 0.8 }}>
                  {publications.map((pub, index) => (
  <Box key={index} sx={innerCard}>
    <Typography
      sx={{
        color: "#374151",
        fontSize: "0.82rem",
        lineHeight: 1.7,
      }}
    >
      {pub.citation}
    </Typography>

    <Box sx={{ mt: 1 }}>
      <Link
        href={pub.doi}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        sx={{
          color: "#F47C20",
          fontWeight: 600,
          fontSize: "0.8rem",
          mr: 1.5,
        }}
      >
        [DOI]
      </Link>

      <Link
        href={pub.pdf}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        sx={{
          color: "#F47C20",
          fontWeight: 600,
          fontSize: "0.8rem",
        }}
      >
        [PDF]
      </Link>
    </Box>
  </Box>
))}
              </Box>
            </Box>


{/* For awards, it starts here */}
<Box sx={{ ...theSectionCard, mb: 1.5 }}>
  <TitleSection>AWARDS</TitleSection>

  <Typography sx={{ color: "#374151", fontSize: "0.87rem", mb: 2 }}>
    The following awards have been received by contributors to the Redux project.
  </Typography>

  <Box sx={{ display: "grid", gap: 1.2 }}>
  {awards.map((award, index) => (
    <Box key={index} sx={innerCard}>
      
        <Typography
          sx={{
            color: "#374151",
            fontSize: "0.82rem",
            lineHeight: 1.6,
          }}
        >
          {award.text}{" "}
          <Link
            href={award.url}
            target="_blank"
            rel="noopener noreferrer"
            underline="none"
            sx={{
              color: "#F47C20",
              fontWeight: 600,
              fontSize: "0.8rem",
              ml: 0.5,
              "&:hover": {
                color: "#e9d5ff",
              },
            }}
          >
            [LINK HERE]
          </Link>
        </Typography>
      </Box>
    ))}
  </Box>
</Box>

{/* For funding, it starts here */}
        <Box sx={{ ...theSectionCard, mb: 4 }}>
  <TitleSection>FUNDING</TitleSection>

  <Typography sx={{ color: "#374151", fontSize: "0.87rem", mb: 0.9 }}>
    The Redux project has been supported through the following funding sources.
  </Typography>

  <Box sx={{ display: "grid", gap: 0.8 }}>
    {funding.map((item, index) => (
      <Box key={index} sx={innerCard}>
        <Typography sx={{ color: "#374151", fontSize: "0.85rem" }}>
          {item}
        </Typography>
      </Box>
    ))}
  </Box>
</Box>

      
            <Box sx={{ ...theSectionCard, mb: 1 }}>
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
    {[
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
    ].sort((a, b) => a.localeCompare(b))
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
                              borderColor: "#8b5cf6",
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
      </Box>
    </ThemeProvider>
  );
}
