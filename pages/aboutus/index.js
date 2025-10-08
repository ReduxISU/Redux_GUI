import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
import { createTheme, ThemeProvider, Container, Box, Button, Collapse } from "@mui/material";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card } from "react-bootstrap";
import isulogo from "../../components/images/ISULogo.png";
import Image from "next/image";
import { useState } from "react";

export default function AboutUsPage() {

    const theme = createTheme({
        palette: {
            mode: "light",
            primary: { main: "#424242" },
            secondary: { main: "#f47920" }
        }
    });

    const cardBodyStyle = { padding: '20px' };

    // State to toggle contributors list
    const [showAll, setShowAll] = useState(false);

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
        "Quinton Smith"
        //Add new contributer
    ];

    return (
        <>
            <ThemeProvider theme={theme}>
                <ResponsiveAppBar />
                <Container>
                    <br />

                    {/* ABOUT US Card */}
                    <Card>
                        <Card.Header><b>ABOUT US</b></Card.Header>
                        <Card.Body style={cardBodyStyle}>
                            {"Welcome to Redux, a platform for NP-Complete problems. Input your challenges and gain access to reductions, solutions, verifiers, and visualizations. Join our community of problem solvers and unravel computational complexities using the application's library. The project was greatly inspired by Richard Karp's paper "}
                            <a href="https://doi.org/10.1007/978-1-4684-2001-2_9" target="_blank" rel="noopener noreferrer">
                                "Reducibility Among Combinatorial Problems"
                            </a> {"(Karp, 1972)."}
                        </Card.Body>
                    </Card>

                    <br />

                    {/* CONTRIBUTORS Card */}
                    <Card>
                        <Card.Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <b>Contributors</b>
                            <Button 
                                size="small" 
                                variant="contained" 
                                onClick={() => setShowAll(!showAll)}
                            >
                                {showAll ? "Hide" : "Show All"}
                            </Button>
                        </Card.Header>
                        <Card.Body style={cardBodyStyle}>
                            <p>This project was started by Dr. <a href="https://www2.cose.isu.edu/~bodipaul/index.php" target="_blank" rel="noopener noreferrer">Paul Bodily</a>, who is also the ISU Faculty Sponsor of the project.</p>
                            <p>The students who contributed to the creation of the application are:</p>
                            
                            {/* Show first 3 contributors always */}
                            <ul>
                                {contributors.slice(0, 3).map((name, index) => (
                                    <li key={index}>{name}</li>
                                ))}
                            </ul>

                            {/* Collapsible rest of the contributors */}
                            <Collapse in={showAll}>
                                <ul>
                                    {contributors.slice(4).map((name, index) => (
                                        <li key={index}>{name}</li>
                                    ))}
                                </ul>
                            </Collapse>
                        </Card.Body>
                    </Card>

                    <br />

                    {/* LEARN MORE Card */}
                    <Card>
                        <Card.Header><b>Learn More</b></Card.Header>
                        <Card.Body style={cardBodyStyle}>
                            {"Additional documentation can be found at the following links:"}
                            <ul>
                                <li><a href="https://github.com/marckade/Redux_GUI" target="_blank" rel="noopener noreferrer">Github</a></li>
                                <li><a href="https://en.wikipedia.org/wiki/NP-completeness" target="_blank" rel="noopener noreferrer">Wikipedia: What is NP-Complete?</a></li>
                                <li><a href="https://cgi.di.uoa.gr/~sgk/teaching/grad/handouts/karp.pdf" target="_blank" rel="noopener noreferrer">Karp's 21 NP-Complete Problems</a></li>
                                <li><a href="https://docs.google.com/document/d/18IKOGImh5O7Z2elgc4WzhiYUV-VwdjNb7WJFEHIFL-E/edit?usp=sharing" target="_blank" rel="noopener noreferrer">Redux GUI Documentation</a></li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Container>
            </ThemeProvider>

            {/* ISU Logo */}
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="10vh">
                <a href="https://www.isu.edu/cs/" target="_blank" rel="noopener noreferrer">
                    <Image src={isulogo} alt="ISU Logo" height={125} width={500} />
                </a>
            </Box>
        </>
    );
}
