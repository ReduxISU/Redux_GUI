/**
 * VisualizeRowReact.js
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
import { Stack, OverlayTrigger, Popover } from 'react-bootstrap'
import FormControlLabel from '@mui/material/FormControlLabel';
import { Button, Switch } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh';

import { requestProblemGenericInstance, requestReducedInstance } from '../redux';
import { ProblemContext } from '../contexts/ProblemProvider';
import VisualizationBox from '../widgets/VisualizationBox';
import ProblemSection from '../widgets/ProblemSection';

const CARD = { cardBodyText:"DEFAULT BODY", problemJson: 'DEFAULT' ,  problemInstance:'DEFAULT', cardHeaderText: "Visualize",problemText:"DEFAULT" }
const SWITCHES = { switch1: "Highlight solution", switch2: "Highlight gadgets", switch3: "Show reduction" }

export default function VisualizeRowReact(props) {
  var visualization;




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

  const defaultSat3SolutionArr = ["x1"]


  var defaultCLIQUEVisualizationArr = [
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


  const { problemName, problemInstance, chosenReduceTo, chosenReductionType, reduceToInstance } = useContext(ProblemContext);
  const [showSolution, setShowSolution] = useState(false);
  const [showGadgets, setShowGadgets] = useState(false);
  const [showReduction, setShowReduction] = useState(false);
  const [disableGadget, setDisableGadget] = useState(false);
  const [disableSolution, setDisableSolution] = useState(true);
  const [disableReduction, setDisableReduction] = useState(chosenReductionType);

  const [problemVisualizationData, setProblemVisualizationData] = useState(defaultSat3VisualizationArr);
  const [reducedVisualizationData, setReducedVisualizationData] = useState(defaultCLIQUEVisualizationArr);
  const [svgIsLoading, setSvgIsLoading] = useState(false);

  let apiCompatibleInstance = problemInstance.replaceAll('&', "%26").replaceAll(' ', '');




  useEffect(() => {
    if (svgIsLoading) {
      setSvgIsLoading(false);
    }
  }, [svgIsLoading])




  useEffect(() => {
    (problemName !== '' && problemName !== null) ? setDisableSolution(false) : setDisableSolution(true);
    (chosenReduceTo !== '' && chosenReduceTo !== null) ? setDisableReduction(false) : setDisableReduction(true);
    (problemName === 'SAT3' && chosenReduceTo === 'CLIQUE') ? setShowReduction(true) : setShowReduction(false);
  }, [problemName, chosenReduceTo]);

  useEffect(() => {

    if(!chosenReductionType){
      setDisableReduction(true);
      setShowReduction(false);
    }
    else{setDisableReduction(false);}
    
  }, [chosenReductionType])

  useEffect(() => {
    // (showReduction === true) ? setDisableGadget(false) : setDisableGadget(true);
   
  }, [showReduction])

  useEffect(() => {
    if (problemName === "SAT3") {
      requestProblemGenericInstance(props.url, problemName, problemInstance).then(data => {
        setProblemVisualizationData(data.clauses);
      });
      if (chosenReductionType) {
        requestReducedInstance(props.url, chosenReductionType, problemInstance).then(data => {
          setReducedVisualizationData(data.reductionTo.clusterNodes)
        });
      }
    }
  }, [problemInstance]);


  function handleSwitch1Change(e) { // solution switch
    setShowSolution(e.target.checked);
    setShowGadgets(false);
  }

  function handleSwitch2Change(e) { //gadget switch.
    // setShowGadgets(true);
    // setShowGadgets(false);
    setShowGadgets(e.target.checked);
    setShowSolution(false);
  }

  function handleSwitch3Change(e) { //Reduction Switch
    setShowReduction(e.target.checked);


    // if (!e.target.checked) {
    //   setDisableGadget(true);
    // } else {
    //   setDisableGadget(false);
    // }

  }

  function handleRefreshButton(e) {
    setSvgIsLoading(true)
    setShowSolution(false);
    setShowGadgets(false);
    setShowReduction(false);
  }

  const logicProps = {
    solverOn: showSolution,
    reductionOn: showReduction,
    gadgetsOn: showGadgets,
  }

  return (
    <ProblemSection defaultCollapsed={false}>
      <ProblemSection.Header title={CARD.cardHeaderText}>
        <div>
          <Button
            style={{ backgroundColor: "#43a047" }}
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshButton}
          >
            Refresh
          </Button>
        </div>

        <Stack
          style={{ width: "100%", flexDirection: "row-reverse" }}
          className="float-end"
          direction="horizontal"
          gap={3}
        >
          {disableReduction ? (
            <OverlayTrigger
              placement="bottom"
              triggers={["hover"]}
              overlay={
                <Popover id="popover-basic" className="tooltip">
                  <Popover.Body>{"Please select a reduction"}</Popover.Body>
                </Popover>
              }
            >
              <FormControlLabel
                disabled={disableReduction ? true : false}
                checked={showReduction}
                control={<Switch />}
                label={SWITCHES.switch3}
                onChange={handleSwitch3Change}
              />
            </OverlayTrigger>
          ) : (
            <FormControlLabel
              disabled={disableReduction ? true : false}
              checked={showReduction}
              control={<Switch />}
              label={SWITCHES.switch3}
              onChange={handleSwitch3Change}
            />
          )}
          <FormControlLabel
            disabled={disableGadget ? true : false}
            checked={showGadgets}
            control={<Switch id={"highlightGadgets"} />}
            label={SWITCHES.switch2}
            onChange={handleSwitch2Change}
          />
          <FormControlLabel
            disabled={disableSolution ? true : false}
            checked={showSolution}
            control={<Switch id={"showSolution"} />}
            label={SWITCHES.switch1}
            onChange={handleSwitch1Change}
          />
        </Stack>
      </ProblemSection.Header>

      <ProblemSection.Body>
        <VisualizationBox
          loading={svgIsLoading}
          // reduceToggled={showReduction}
          //We are using the logicProps(visualizationState to handle this)
          // solveToggled={showSolution}
          apiInstance={apiCompatibleInstance}
          problemVisualizationData={problemVisualizationData}
          reducedVisualizationData={reducedVisualizationData}
          problemSolutionData={defaultSat3SolutionArr}
          visualizationState={logicProps}
          url={props.url}
        ></VisualizationBox>
        {/* <VisualizationLogic
               props={logicProps}>
              </VisualizationLogic> */}

        {/* <VisualizationLogic
                problemName={problemName}
                problemInstance={problemInstance}
                reductionName={chosenReductionType}
                loading={svgIsLoading}
                problemSolutionData={problemSolutionData}
                reducedVisualizationData={reducedVisualizationData}
                problemVisualizationData={problemVisualizationData}
                visualizationState={logicProps}
            // solverOn={true}
            // reductionOn={reduceToggled}
            // gadgetsOn={false}
            /> */}
      </ProblemSection.Body>
    </ProblemSection>
  );
}
