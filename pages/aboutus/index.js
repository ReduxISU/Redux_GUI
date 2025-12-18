import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
import { createTheme, ThemeProvider, Container, Box } from "@mui/material";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card } from "react-bootstrap";
import isulogo from "../../components/images/ISULogo.png";
import Image from "next/image";

export default function AboutUsPage() {
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: { main: "#424242" },
      secondary: { main: "#f47920" },
    },
  });

  const cardBodyStyle = { padding: "20px" };

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
    "Andreas Kramer",
    "Courtney Bodily",
    "Rakesh Itani"
  ];

  const publications = [
    {
      title:
        "R. Phillips and P. M. Bodily, “Spade: A library for programmatic parsing and verification of discrete data structures,” in 2025 Intermountain Engineering, Technology and Computing (IETC), pp. 1–5, IEEE, 2025.",
      link: "https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=11039449",
    },
    {
      title:
        "K. Marchetti, A. Sevaljevic, A. Diviney, R. Phillips, C. Eardley, R. Khadka, D. Igbokwe, and P. M. Bodily, “Redux: An interactive, dynamic knowledge base for teaching NP-completeness,” in Proceedings of the 29th annual ACM conference on Innovation and Technology in Computer Science Education (ITiCSE), 2024.",
      link: "https://etd.iri.isu.edu/ViewSpecimen.aspx?ID=2206",
    },
    {
      title:
        "A. Sevaljevic and P. M. Bodily, “Comparative empirical analysis of dancing links implementations to solve the exact cover problem,” in Proceedings of the 4th Intermountain Engineering, Technology, and Computing Conference (i-ETC), pp. 255–258, IEEE, 2024.",
      link: "https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=10564396",
    },
    {
      title:
        'K. Marchetti and P. Bodily, "Visualizing the 3SAT to CLIQUE Reduction Process," 2022 Intermountain Engineering, Technology and Computing (IETC), Orem, UT, USA, 2022, pp. 1-5, doi: 10.1109/IETC54973.2022.9796851.',
      link: "https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=9796851",
    },
    {
      title:
        'K. Marchetti and P. Bodily, "KAMI: Leveraging the power of crowd-sourcing to solve complex, real-world problems," 2022 Intermountain Engineering, Technology and Computing (IETC), Orem, UT, USA, 2022, pp. 1-4, doi: 10.1109/IETC54973.2022.9796945.',
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
              &quot;Reducibility Among Combinatorial Problems&quot;
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
              {contributors.map((name, index) => (
                <div key={index}>• {name}</div>
              ))}
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
                                <li><a href="https://cgi.di.uoa.gr/~sgk/teaching/grad/handouts/karp.pdf" target="_blank" rel="noopener noreferrer">Karp&apos;s 21 NP-Complete Problems</a></li>
                                <li><a href="https://github.com/ReduxISU/Redux_GUI/blob/ReduxAPI_GUI/Documentation/index.md" target="_blank" rel="noopener noreferrer">Redux GUI Documentation</a></li>
                                <li><a href="https://github.com/ReduxISU/Redux/blob/CSharpAPI/Documentation/index.md" target="_blank" rel="noopener noreferrer">Redux Backend Documentation</a></li>
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
    </ThemeProvider>
  );
}
