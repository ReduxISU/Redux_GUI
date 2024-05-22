// import NavGraph, { nodesList, edgeList } from '../../components/widgets/SearchBars/testAutoProb';
// import ResponsiveAppBar from "../../components/widgets/ResponsiveAppBar";
// import { useEffect, useState, useRef } from "react";
// import PopoverTooltipClick from '../../components/widgets/PopoverTooltipClick';
// import { Overlay, Popover } from 'react-bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { Container, Box, createTheme, ThemeProvider } from '@mui/material';


// //OverlayViewF

// /**
//  *
//  * @param {*} url the base url of the application
//  * @param {*} name The name of the selected problem
//  * @returns A promise from the passed in url.
//  */
// async function requestProblemData(url, name) {
//     return await fetch(url + name + "Generic").then(resp => {
//         if (resp.ok) {
//             return resp.json()
//         }
//     });

// }


// export default function Test(props) {


//     const [tool, setToolTip] = useState({});
//     const [nodeTarget, setTarget] = useState();
//     const [show, setShow] = useState(false);
//     const ref = useRef(null);
//     // let popoverList = {}
//     const popoverList = new Map();

//     const theme = createTheme({
//         palette: {
//             mode: "light",
//             primary: {
//                 main: "#424242",
//             },
//             secondary: {
//                 main: "#f47920"
//             }
//         }
//     });

//     useEffect(() => {
//         setTarget(null)
//         setShow(false);
//         setToolTip({})

//         setTimeout(() => {
//             for (let elem of nodesList) {
//                 let node = document.getElementById(elem)
//                 const ellipseArray = node.getElementsByTagName('ellipse');
//                 node.addEventListener('mouseover', function () {
//                     ellipseArray[0].setAttribute("fill", "#f69240")
//                 })

//                 node.addEventListener('mouseout', function () {
//                     ellipseArray[0].setAttribute("fill", "none")
//                 })


//             }
//         }, 2000);


//     }, [])



//     const handleClick = event => {
//         // 👇️ refers to the div element
//         const element = event.target;
//         const problemGroup = element.closest('g');
//         if (problemGroup !== null) {
//             const problemName = problemGroup.id

//             if (nodesList.includes(problemName)) {
//                 requestProblemData('http://localhost:27000/', problemName).then(data => {
//                     if (!(typeof data === "undefined")) {
//                         ref.current = problemGroup;
//                         setToolTip({ header: problemName, formalDef: data.formalDefinition, info: data.problemDefinition + data.source })
//                         setTarget(problemGroup);
//                         setShow(true);
//                     }
//                 }).catch(console.log("Problem not defined"));



//             } else {
//                 setTarget(null)
//                 setShow(false);
//                 setToolTip({})
//             }
//         }
//     };



//     return (
//         <>

//             <ThemeProvider theme={theme}>
//                 <ResponsiveAppBar></ResponsiveAppBar>

//                 {/*
//                 <Container
//                     display="flex"

//                 > */}
//                 <Box

//                     display="flex"
//                     justifyContent="center"
//                     alignItems="center"
//                     minHeight="10vh">

//                     <div ref={ref} onClick={handleClick} >

//                         <NavGraph />
//                         {/* <Button onClick={handleClick}>Holy guacamole!</Button> */}

//                         <Overlay
//                             rootClose={true}
//                             show={show}
//                             target={nodeTarget}
//                             placement="bottom"
//                             container={ref}
//                             containerPadding={20}
//                         >
//                             <Popover id="popover-basic" className="tooltip">

//                                 <Popover.Header as="h3">
//                                     {tool.header}
//                                 </Popover.Header>

//                                 <Popover.Body>
//                                     {tool.formalDef}
//                                     <br></br>
//                                     <br></br>
//                                     {tool.info}
//                                     <br></br>
//                                     <br></br>
//                                     {tool.source}
//                                     <br></br><br></br>
//                                     {tool.credit}
//                                 </Popover.Body>

//                             </Popover>
//                         </Overlay>
//                     </div>
//                     {/* </Container> */}
//                 </Box>
//             </ThemeProvider>
//         </>



//     );




// }



function HomePage() {
    return <div>BUILD ISSUE PATCH. TEMPORARY</div>
  }
  
  export default HomePage