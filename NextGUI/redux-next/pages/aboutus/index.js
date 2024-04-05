import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
import { createTheme, List, ListItem, ListItemButton, ListItemText, ThemeProvider, Typograph } from "@mui/material"
import { margin, padding } from "@mui/system";
import { Container, Box } from '@mui/material'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Card } from "react-bootstrap";
import isulogo from "../../components/images/ISULogo.png"
import Image from "next/image";

export default function AboutUsPage() {

    const theme = createTheme({
        palette: {
            mode: "light",
            primary: {
                main: "#424242",
            },
            secondary: {
                main: "#f47920"
            }
        }
    });

    const cardBodyStyle = {
        padding: '20px', // Adjust the padding value as desired
    };


    return (
        <>
            <ThemeProvider theme={theme}>
                <ResponsiveAppBar></ResponsiveAppBar>
                <Container>
                    <br></br>
                    <Card>
                        <Card.Header>
                            <b>{"ABOUT US"}</b>
                        </Card.Header>
                        <Card.Body style={cardBodyStyle}>
                            {"Welcome to Redux, a platform for NP-Complete problems. Input your challenges and gain access to reductions, solutions, verifiers, and visualizations. Join our community of problem solvers and unravel computational complexities using the application's library. The project was greatly inspired by Richard Karp's paper \"Reducibility Among Combinatorial Problems\"."}
                        </Card.Body>
                    </Card>
                    <br></br>
                    <Card>
                        <Card.Header>
                            <b>{"Contributors"}</b>
                        </Card.Header>
                        <Card.Body style={cardBodyStyle}>
                            <p>This project was started by Dr.<a href="https://www2.cose.isu.edu/~bodipaul/index.php" target="_blank" rel="noopener noreferrer">Paul Bodily</a>, who is also the ISU Faculty Sponsor of the project. The students who have contributed to the creation of the application are:</p>
                            <ul style={{ listStyle: "none", textAlign: "left", paddingLeft: "20px" }}>
                                <li>Kaden Marchetti</li>
                                <li>Caleb Eardley</li>
                                <li>Daniel Igbokwe</li>
                                <li>Alex Diviney</li>
                                <li>Janita Aamir</li>
                                <li>Andrija Sevaljevic</li>
                                <li>Garret Stouffer</li>
                                <li>Porter Glines</li>
                                <li>Show Pratoomratana</li>
                                <li>Russell Phillips</li>
                                {/* Add more student names here */}
                            </ul>
                        </Card.Body>
                    </Card>
                    <br></br>
                    <Card>
                        <Card.Header>
                            <b>{"Learn More"}</b>
                        </Card.Header>
                        <Card.Body style={cardBodyStyle}>
                            {"Additional documentation can be found at the following links:"}
                        </Card.Body>
                        <List style={{ margin: '-20px 0 0 0' }}>

                            <ListItemButton href="https://github.com/marckade/Redux_GUI">
                                <ListItemText primary="Github">
                                </ListItemText>
                            </ListItemButton>
                            <ListItemButton href="https://en.wikipedia.org/wiki/NP-completeness">
                                <ListItemText primary="Wikipedia: What is NP-Complete?">
                                </ListItemText>
                            </ListItemButton>
                            <ListItemButton href="https://cgi.di.uoa.gr/~sgk/teaching/grad/handouts/karp.pdf">
                                <ListItemText primary="Karp's 21 NP-Complete Problems">
                                </ListItemText>
                            </ListItemButton>
                            <ListItemButton href="https://docs.google.com/document/d/18IKOGImh5O7Z2elgc4WzhiYUV-VwdjNb7WJFEHIFL-E/edit?usp=sharing">
                                <ListItemText primary="Redux GUI Documentation">
                                </ListItemText>
                            </ListItemButton>
                        </List>
                        <Card.Body>


                        </Card.Body>
                    </Card>
                </Container>
            </ThemeProvider>
            <Box

                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="10vh"
            // marginTop={'25%'}
            //Tried to push the logo down with the margin
            >
                <a href="https://www.isu.edu/cs/" target="_blank" rel="noopener noreferrer">
                    <Image src={isulogo} alt="ISU Logo" height={125} width={500} />
                </a>
            </Box>
        </>
    )
}