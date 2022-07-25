/**
 * AccordionTogglesSvg.js
 * 
 * This component does the real grunt work of the VerifyRowReact component. It uses passed in props to style and provide default text for its objects,
 * uses many of the global state values and has a variety of listeners and API calls.
 * 
 * The actual visualization logic is handled by imported Visualization components.
 * 
 * Essentialy, this is the brains of the VisualizeRowReact.js component and deals with the GUI's Visualize "Row"
 * 
 * @author Alex Diviney, Daniel Igbokwe
 */


import React from 'react'
import { useContext, useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import { Accordion, Card, AccordionContext, Stack } from 'react-bootstrap'
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import PopoverTooltipClick from './PopoverTooltipClick';
// import FormControl from '../components/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel';
import { Button, Switch, Container, Grid, getNativeSelectUtilityClasses} from '@mui/material'
// import FormControl from '../components/FormControl'
// import Page from "../components/widgets/graph";
//import Graphvisualization from "../Visualization/Graphvisualization";
//import ReducedVisualizations from "../Visualization/ReducedVisualization";
import { ProblemContext } from '../contexts/ProblemProvider';
// import { getClique } from '../Visualization/svgs/Sat3ToCliqueReduction';
// import { getSat3 } from '../Visualization/svgs/Sat3ToCliqueInstance'
import SAT3_SVG_React from '../Visualization/svgs/SAT3_SVG_React';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisualizationBox from './VisualizationBox';
import { svg } from 'd3';
import TEST_SVG_REACT from '../Visualization/svgs/TEST_SVG_REACT';
import VisualizationLogic from './VisualizationLogic';



function ContextAwareToggle({ accordionState,setAccordionState, children, eventKey, callback, colors }) {
  
  
  const { activeEventKey } = useContext(AccordionContext);

  const decoratedOnClick = useAccordionButton(
    eventKey,
    () => {
      testFunc();
      callback && callback(eventKey)
    
    },
  );
  function testFunc() {
    setAccordionState(!accordionState)
  }
  var isCurrentEventKey = activeEventKey === eventKey;

  return (
    <Button
      color = 'white'
      className = "float-end"
      type="button"
      sx={{ height:54, width: 64 }}
      style={{ backgroundColor: isCurrentEventKey ? colors.orange : colors.grey }}
      onClick={decoratedOnClick}
    >
      {children}
    </Button>
  );
}



function AccordionTogglesSvg(props) {
  //console.log(props)
  var visualization;



  const graphDotTest = `graph GRAPHCOLORING {  
    node [style="filled"];  
    a--b; 
    b--c; 
    c--a; 
    d--a; 
    d--e; 
    e--a; 
    f--a; 
    f--g; 
    a--g; 
    h--a; 
    h--i; 
    a--i; 
    a[fillcolor = Green] 
    b[fillcolor = White] 
    c[fillcolor = White] 
    d[fillcolor = White] 
    e[fillcolor = White] 
    f[fillcolor = White] 
    g[fillcolor = White] 
    h[fillcolor = White] 
    i[fillcolor = White] 
     }`;

  const graphDotTest2 = `graph GRAPHCOLORING {  
    node [style="filled"];  
    a--b; 
    b--c; 
    c--a; 
    d--a; 
    d--e; 
    e--a; 
    f--a; 
    f--g; 
    a--g; 
    h--a; 
    h--i; 
    a--i; 
    a[fillcolor = White] 
    b[fillcolor = White] 
    c[fillcolor = White] 
    d[fillcolor = White] 
    e[fillcolor = White] 
    f[fillcolor = White] 
    g[fillcolor = White] 
    h[fillcolor = White] 
    i[fillcolor = White] 
     }`;


  const defaultSat3VisualizationArr = [
    [
        "x1",
        "!x2",
        "x3"
    ],
    [
        "!x1",
        "x3",
        "x1"
    ],
    [
        "x2",
        "!x3",
        "x1"
    ],
  ]

  const defaultSat3SolutionArr = [
    ["x1"]
  ]
  
  var defaultCLIQUEVisualizationArr =  [
    {
        "name": "x1",
        "cluster": "0"
    },
    {
        "name": "!x2",
        "cluster": "0"
    },
    {
        "name": "x3",
        "cluster": "0"
    },
    {
        "name": "!x1",
        "cluster": "1"
    },
    {
        "name": "x3",
        "cluster": "1"
    },
    {
        "name": "x1",
        "cluster": "1"
    },
    {
        "name": "x2",
        "cluster": "2"
    },
    {
        "name": "!x3",
        "cluster": "2"
    },
    {
        "name": "x1",
        "cluster": "2"
    },

  ];
  
  const refreshButtonStyle = {
    position: 'absolute',
    left: '10%',
    backgroundColor: '#43a047'
  }
  const { problemName, problemInstance, chosenReductionType, reduceToInstance } = useContext(ProblemContext);
  // const [reduction, setReductionInstance] = useState(graphDotTest2);
  const [showSolution, setShowSolution] = useState(false);
  const [showGadgets, setShowGadgets] = useState(false);
  const [showReduction, setShowReduction] = useState(false);
  //defaultSat3VisualizationArr
  const [problemVisualizationData, setProblemVisualizationData] = useState(defaultSat3VisualizationArr);
  const [reducedVisualizationData, setReducedVisualizationData] = useState(defaultCLIQUEVisualizationArr);
  const [problemSolutionData, setProblemSolutionData] = useState(null);
  const [rerender, setRerender] = useState(false); //This is an escape hatch to refresh svgs.
  const [accordionOpened, setAccordionOpened] = useState(false);
  const [svgIsLoading, setSvgIsLoading] = useState(false);



  

  useEffect(() => {
    if (svgIsLoading) {
      setSvgIsLoading(false);
    }
  }, [svgIsLoading])


  useEffect(() => {
    var apiCompatibleInstance = problemInstance.replaceAll('&', "%26");
    if (problemName === "SAT3") {
      getProblemVisualizationData(props.accordion.INPUTURL.url, problemName, apiCompatibleInstance).then(data => {
        //console.log(data);
        setProblemVisualizationData(data.clauses);
      }).catch((error)=>{console.log(error)});
      getReducedVisualizationData(props.accordion.INPUTURL.url, chosenReductionType, apiCompatibleInstance).then(data => {
        setReducedVisualizationData(data.reductionTo.clusterNodes)
        console.log(data.reductionTo.clusterNodes)
      }).catch((error)=>{console.log(error)})
      
    }
    

  },[problemInstance])

 
  function handleSwitch1Change(e) { // solution switch
  //  console.log("Switch 1   " + e.target.checked);
    setShowSolution(e.target.checked);
    setProblemSolutionData(defaultSat3SolutionArr);
   // console.log("Switch 1   " + e.target.checked);
  }

  function handleSwitch2Change(e) { //gadget switch.
    setShowGadgets(true);
    setShowGadgets(false);
    setShowGadgets(e.target.checked);
    console.log("Switch 2 Gadgets  " + e.target.checked);
  }

  function handleSwitch3Change(e) { //Reduction Switch
    setShowReduction(e.target.checked);
    if (!e.target.checked) {
      //triggerRerender();
    }
    console.log("Switch 3 Reduction  " + e.target.checked);
  
  }

  function handleRefreshButton(e) {
    setSvgIsLoading(true)
    setShowSolution(false);
    setShowGadgets(false);
    setShowReduction(false);
  }
   function getProblemVisualizationData(url, name, instance) {
    var fullUrl = `${url}${name}Generic/instance?problemInstance=${instance}`;
    return fetch(fullUrl).then(resp => {
      if (resp.ok) {
        return resp.json()
      }
    });
  }
  function getReducedVisualizationData(url, reduction, instance) {

    if(reduction !== null || reduction !== ''){
      var fullUrl = `${url}${reduction}/reduce?problemInstance=${instance}`;
    console.log(fullUrl);
    return fetch(fullUrl).then(resp => {
      if (resp.ok) {
        return resp.json()
      }
    });

    }
    
  }

  
  const logicProps = {
    solverOn: false,
    reductionOn: false,
    gadgetsOn: false,
    problemName: "VERTEXCOVER",
    problemInstance: problemInstance
  }
  return (
   

    <div>
      <Accordion className="accordion" defaultActiveKey="1">
        <Card>
          <Card.Header>
            {props.accordion.CARD.cardHeaderText}
            <Stack className="float-end" direction="horizontal" gap={3} 
            >
              
              <Button style={refreshButtonStyle}
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefreshButton}
              >
               Refresh
              </Button>
              <FormControlLabel checked={showSolution} control={<Switch id={"showSolution"}/>} label={props.accordion.SWITCHES.switch1} onChange={handleSwitch1Change} />
              <FormControlLabel checked={showGadgets} control={<Switch id={"highlightGadgets"} />} label={props.accordion.SWITCHES.switch2} onChange={handleSwitch2Change} />
              <FormControlLabel checked={showReduction} control={<Switch />} label={props.accordion.SWITCHES.switch3} onChange={handleSwitch3Change} />

              <ContextAwareToggle accordionState={accordionOpened} setAccordionState={setAccordionOpened} className="float-end" eventKey="0" colors={props.accordion.THEME.colors} style={{height:'60px'} }>▼</ContextAwareToggle>

            </Stack>

          </Card.Header>

          <Accordion.Collapse eventKey="0">
            <Card.Body>

              <VisualizationBox 
                loading={svgIsLoading}
                reduceToggled={showReduction}
                problemVisualizationData={problemVisualizationData}
                reducedVisualizationData={reducedVisualizationData}
                problemSolutionData={showSolution}
              ></VisualizationBox>
              {/* <VisualizationLogic
               props={logicProps}>
              </VisualizationLogic> */}
            </Card.Body>
          </Accordion.Collapse>
        </Card>

      </Accordion>
    </div>
  );
}



export default AccordionTogglesSvg