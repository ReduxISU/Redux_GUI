import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
import { createTheme, ThemeProvider, Container, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card } from "react-bootstrap";
import isulogo from "../../components/images/ISULogo.png";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function AboutUsPage() {
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: { main: "#424242" },
      secondary: { main: "#f47920" },
    },
  });

  const cardBodyStyle = { padding: "20px" };
  
  // State management
  const [contributorData, setContributorData] = useState({});
  const [selectedContributor, setSelectedContributor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Contributors array defined FIRST
  const contributors = [
    "Kaden Marchetti",
    "Caleb Eardley",
    "Daniel Igbokwe",
    "Alex Diviney",
    "Janita Aamir",
    "Andrija Sevaljevic",
    "Garret Stouffer",
    "Porter Glines",
    "Show Pratoomratana",
    "Russell Phillips",
    "Michael Crapse",
    "Ian Gonzalez",
    "Sabal Subedi",
    "Himanshu Jha",
    "Sansar Kharal",
    "Pratham Khanal",
    "George Lake",
    "Grant Gardner",
    "Jason Wright",
    "Alex Svancara",
    "Eric Hill",
    "Max Grünwoldt",
    "Paul Gilbreath",
    "Andreas Kramer",
    "Courtney Bodily",
    "Rakesh Itani"
  ];

  // Fetch all contributor data on mount
  useEffect(() => {
    const fetchAllContributorData = async () => {
      const dataMap = {};
      
      for (const name of contributors) {
        try {
          const encodedName = encodeURIComponent(name);
          const response = await fetch(`http://localhost:27000/Navigation/ContributorProfile/${encodedName}`);
          if (response.ok) {
            const data = await response.json();
            dataMap[name] = data;
          }
        } catch (error) {
          console.warn(`Failed to fetch data for ${name}:`, error);
        }
      }
      
      setContributorData(dataMap);
    };
    
    fetchAllContributorData();
  }, []);

  // Handle contributor click - open modal
  const handleContributorClick = (name) => {
    setLoading(true);
    setSelectedContributor(name);
    
    // Simulate loading if data already cached
    setTimeout(() => {
      setLoading(false);
      setModalOpen(true);
    }, 300);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedContributor(null);
    setLoading(false);
  };

  const publications = [
    {
      title: "R. Phillips and P. M. Bodily, Spade: A library for programmatic parsing and verification of discrete data structures, in 2025 Intermountain Engineering, Technology and Computing (IETC), pp. 1–5, IEEE, 2025.",
      link: "https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=11039449",
    },
    {
      title: "K. Marchetti, A. Sevaljevic, A. Diviney, R. Phillips, C. Eardley, R. Khadka, D. Igbokwe, and P. M. Bodily, Redux: An interactive, dynamic knowledge base for teaching NP-completeness, in Proceedings of the 29th annual ACM conference on Innovation and Technology in Computer Science Education (ITiCSE), 2024.",
      link: "https://etd.iri.isu.edu/ViewSpecimen.aspx?ID=2206",
    },
    {
      title: "A. Sevaljevic and P. M. Bodily, Comparative empirical analysis of dancing links implementations to solve the exact cover problem, in Proceedings of the 4th Intermountain Engineering, Technology, and Computing Conference (i-ETC), pp. 255–258, IEEE, 2024.",
      link: "https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=10564396",
    },
    {
      title: "K. Marchetti and P. Bodily, Visualizing the 3SAT to CLIQUE Reduction Process, 2022 Intermountain Engineering, Technology and Computing (IETC), Orem, UT, USA, 2022, pp. 1-5, doi: 10.1109/IETC54973.2022.9796851.",
      link: "https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=9796851",
    },
    {
      title: "K. Marchetti and P. Bodily, KAMI: Leveraging the power of crowd-sourcing to solve complex, real-world problems, 2022 Intermountain Engineering, Technology and Computing (IETC), Orem, UT, USA, 2022, pp. 1-4, doi: 10.1109/IETC54973.2022.9796945.",
      link: "https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=9796945",
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <ResponsiveAppBar />
      <Container>
        <br />

        {/* ABOUT US Card */}
        <Card>
          <Card.Header>
            <b>About Us</b>
          </Card.Header>
          <Card.Body style={cardBodyStyle}>
            {"Welcome to Redux, a platform for NP-Complete problems. Input your challenges and gain access to reductions, solutions, verifiers, and visualizations. Join our community of problem solvers and unravel computational complexities using the application's library. The project was greatly inspired by Richard Karp's paper "}
            <a
              href="https://doi.org/10.1007/978-1-4684-2001-2_9"
              target="_blank"
              rel="noopener noreferrer"
            >
              {"Reducibility Among Combinatorial Problems"}
            </a>{" "}
            {"(Karp, 1972)."}
          </Card.Body>
        </Card>

        <br />

        {/* PUBLICATIONS Card */}
        <Card>
          <Card.Header>
            <b>Publications</b>
          </Card.Header>
          <Card.Body style={cardBodyStyle}>
            <p>
              Below are research publications associated with the Redux project
              and its contributors:
            </p>
            <ul>
              {publications.map((pub, index) => (
                <li key={index} style={{ marginBottom: "10px" }}>
                  {pub.title}{" "}
                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    [PDF]
                  </a>
                </li>
              ))}
            </ul>
          </Card.Body>
        </Card>

        <br />

        {/* CONTRIBUTORS Card */}
        <Card>
          <Card.Header>
            <b>Contributors</b>
          </Card.Header>
          <Card.Body style={cardBodyStyle}>
            <p>
              This project was started by Dr.{" "}
              <a
                href="https://www2.cose.isu.edu/~bodipaul/index.php"
                target="_blank"
                rel="noopener noreferrer"
              >
                Paul Bodily
              </a>
              , who is also the ISU Faculty Sponsor of the project.
            </p>
            <p>
              The students who contributed to the creation of the application
              are:
            </p>

            {/* Column-ordered 3-column layout */}
            <div
              style={{
                columnCount: 3,
                columnGap: "40px",
                paddingLeft: "20px",
                lineHeight: "1.6",
              }}
            >
              {contributors.map((name, index) => {
                return (
                  <div key={index}>
                    • <span
                      onClick={() => handleContributorClick(name)}
                      style={{ 
                        color: "#f47920", 
                        textDecoration: "underline", 
                        cursor: "pointer",
                        fontWeight: "500"
                      }}
                    >
                      {name}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card.Body>
        </Card>

        {/* LEARN MORE Card */}
        <Card>
          <Card.Header><b>Learn More</b></Card.Header>
          <Card.Body style={cardBodyStyle}>
            {`Additional documentation can be found at the following links:`}
            <ul>
              <li><a href="https://github.com/ReduxISU/" target="_blank" rel="noopener noreferrer">Github</a></li>
              <li><a href="https://en.wikipedia.org/wiki/NP-completeness" target="_blank" rel="noopener noreferrer">Wikipedia: What is NP-Complete?</a></li>
              <li><a href="https://cgi.di.uoa.gr/~sgk/teaching/grad/handouts/karp.pdf" target="_blank" rel="noopener noreferrer">Karp's 21 NP-Complete Problems</a></li>
              <li><a href="https://github.com/ReduxISU/Redux_GUI/blob/ReduxAPI_GUI/Documentation/index.md" target="_blank" rel="noopener noreferrer">Redux GUI Documentation</a></li>
              <li><a href="https://github.com/ReduxISU/Redux/blob/CSharpAPI/Documentation/index.md" target="_blank" rel="noopener noreferrer">Redux Backend Documentation</a></li>
              <li><a href="http://localhost:27000/swagger/index.html" target="_blank" rel="noopener noreferrer">API Swagger Documentation (Local)</a></li>
            </ul>
          </Card.Body>
        </Card>
      </Container>

      {/* ISU Logo */}
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="10vh">
        <a
          href="https://www.isu.edu/cs/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src={isulogo} alt="ISU Logo" height={125} width={500} />
        </a>
      </Box>

      {/* Contributor Profile Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedContributor && `${selectedContributor}'s Profile`}
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <p>Loading...</p>
          ) : selectedContributor && contributorData[selectedContributor] ? (
            <div>
              <h5 style={{ marginBottom: '15px' }}>Personal Information</h5>
              <p><strong>Email:</strong> {contributorData[selectedContributor].email || "Not specified"}</p>
              <p><strong>Education:</strong> {contributorData[selectedContributor].education || "Not specified"}</p>
              <p><strong>Major:</strong> {contributorData[selectedContributor].major || "Not specified"}</p>
              <p><strong>Bio:</strong> {contributorData[selectedContributor].bio || "Not specified"}</p>
              
              <h5 style={{ marginTop: '20px', marginBottom: '15px' }}>Contributions</h5>
              <p><strong>Total Contributions:</strong> {contributorData[selectedContributor].totalContributions || 0}</p>
              
              {contributorData[selectedContributor].problemsContributed && contributorData[selectedContributor].problemsContributed.length > 0 && (
                <div>
                  <strong>Problems:</strong> {contributorData[selectedContributor].problemsContributed.length}
                  <ul>
                    {contributorData[selectedContributor].problemsContributed.map((problem, idx) => (
                      <li key={idx}>{problem}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {contributorData[selectedContributor].solversCreated && contributorData[selectedContributor].solversCreated.length > 0 && (
                <div>
                  <strong>Solvers:</strong> {contributorData[selectedContributor].solversCreated.length}
                  <ul>
                    {contributorData[selectedContributor].solversCreated.map((solver, idx) => (
                      <li key={idx}>{solver}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {contributorData[selectedContributor].reductionsCreated && contributorData[selectedContributor].reductionsCreated.length > 0 && (
                <div>
                  <strong>Reductions:</strong> {contributorData[selectedContributor].reductionsCreated.length}
                  <ul>
                    {contributorData[selectedContributor].reductionsCreated.map((reduction, idx) => (
                      <li key={idx}>{reduction}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p>No data found</p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
