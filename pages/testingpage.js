//redux.aws.cose.isu.edu (this page will be replaced by testpage )
import TextBox from '../components/widgets/TextBox'
import TextBoxInstance from '../components/widgets/TextBoxInstance';
import 'bootstrap/dist/css/bootstrap.min.css'
import PopoverTooltipHover from '../components/widgets/PopoverTooltipClick';
// import SearchBar from '../components/widgets/SearchBar';
import BookData from "./Data.json";
// import AutoComplete from '../components/widgets/SearchBar';

import ResponsiveAppBar from '../components/widgets/ResponsiveAppBar'
import { Box, Button, createTheme, FormControlLabel, Input, Switch, ThemeProvider, Typograph } from "@mui/material"
import { orange } from "@mui/material/colors"
import { useState, useEffect } from 'react';
import TEST_SVG_REACT from '../components/Visualization/svgs/TEST_SVG_REACT';
import VertexCoverSvgReact from '../components/Visualization/svgs/VertexCover_SVG_React';
import VisualizationLogic from '../components/widgets/VisualizationLogic';
import CLIQUE_SVG_REACT from '../components/Visualization/svgs/CLIQUE_SVG_REACT';
import CliqueSvgReactV2 from '../components/Visualization/svgs/Clique_SVG_REACT_V2';
import Container from '@mui/material';
import Split from 'react-split';
import Constants from '../Tools/Constants';
import ProblemInstanceParser from '../Tools/ProblemInstanceParser';

import No_Viz_Svg from '../components/Visualization/svgs/No_Viz_SVG';

//const baseUrl = 'http://redux.aws.cose.isu.edu:27000/';
const reduxBaseUrl = 'http://localhost:27000/'; //redux url. Note the trailing slash
const searchbarPlaceHolder = "Enter a Problem Name..."

const DEFAULTTEXTBOX = { name: "Get Instance (ie. ARCSETGeneric, VERTEXCOVERGeneric)", submitMsg: "Get Instance" ,reqUrl: reduxBaseUrl}
const ALTTEXTBOX = { name: "Instance", submitMsg: "Validate",reqUrl: reduxBaseUrl}
const FINDREDUCTIONS = { name: "Choose What You want to reduce to", submitMsg: "Reduce", reqUrl: reduxBaseUrl }
const NESTEDACCORDION = { header: "TestHeader", text1: "Text1" }
const NESTEDFORMCONTROL = { placeHolder: "PlaceholderText" }
const ACCORDION_FORM_ONE = { placeHolder: "PlaceHolder Text One" }
const ACCORDION_FORM_TWO = { placeHolder: "PlaceHolder Text Two" }
const CARD = { cardBodyText: "CARD BODY", cardHeaderText: "Card Header" }
const TOOLTIP = {tooltipText: "HELLO I AM INFORMATION MAIN"}

const ACCORDION = {ACCORDION_FORM_ONE,ACCORDION_FORM_TWO,CARD,TOOLTIP}

function HomePage() {

  const theme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#424242",
      },
      secondary: {
        main:"#f47920"
      }
    }
  });
  
  const [text, setText] = useState("");
  const [solutionSwitch, setSolutionSwitch] = useState(false);
  const [leftSize, setLeftSize]= useState(50);
  const [rightSize, setRightSize] = useState(50);
  const handleTextBox = (event) => {
    setText(event.target.value)
  }

  const handleSolveSwitch = (event) => {
    setSolutionSwitch(event.target.checked);
  }

  const handleBar = (sizes) => {
    setLeftSize(sizes[0])
    setRightSize(sizes[1])
}
  const logicProps = {
    solverOn: false,
    reductionOn: false,
    gadgetsOn: false,
    problemName: "VERTEXCOVER",
    problemInstance: "{{a,b,c,d,e,f,g},{{a,b},{a,c},{c,d},{c,e},{d,f},{e,f},{e,g}},3}",
    problemSolution: "{e,f,c,d,a,b}"
  }
  const apiCallDef = `http://localhost:27000/VERTEXCOVERGeneric/visualize?problemInstance=${logicProps.problemInstance}`;
  const apiCallSolved = `http://localhost:27000/VCSolver/visualize?problemInstance=${logicProps.problemInstance}&solutionString=${logicProps.problemSolution}`

  const visData = undefined;
  let visualization;
  let reducedVisualization
  let apiCall;

              let apiCall1 = "http://localhost:27000/CLIQUEGeneric/visualize"
                visualization =
                        <CliqueSvgReactV2 apiCall={apiCall1} instance={logicProps.problemInstance}> </CliqueSvgReactV2>                    
                apiCall = "http://localhost:27000/VERTEXCOVERGeneric/visualize?problemInstance=" + logicProps.problemInstance;
                reducedVisualization =
                    
    <VertexCoverSvgReact size={rightSize} apiCall={apiCall} instance={logicProps.problemInstance}></VertexCoverSvgReact>
  const testG = "{{1,2,3,4},{{4,1},{1,2},{4,3},{3,2},{2,4}},3}"
  const type = "CLIQUE"
  let parser = new ProblemInstanceParser()
  parser.parse(type, testG)

  return (
    
    <>
    {/* <ThemeProvider theme = {theme}>
        <ResponsiveAppBar></ResponsiveAppBar>
        <>
          
        <Box>
            <No_Viz_Svg></No_Viz_Svg>
            
          </Box> */}


              {/* <Split
            className="wrap"      
            direction="horizontal"
            style={{ height: 'inherit' }}
            onDragEnd={handleBar}
                    
          >
            <Box>
              {"hellow"}
              {visualization}

            </Box>
            <Box>
              {"hellow2"}
              {reducedVisualization}
            </Box>
            
                </Split>  */}
        {/* </> */}
        
    {/* </ThemeProvider> */}
    </>
  )
}



export default HomePage;