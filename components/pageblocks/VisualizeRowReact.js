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
import { Button, Switch, Radio, RadioGroup, FormControl, IconButton, TextField } from '@mui/material';
import { SkipPrevious, SkipNext, FastRewind, FastForward } from '@mui/icons-material';
import RefreshIcon from '@mui/icons-material/Refresh';

// widgets
import PopoverTooltipClick from '../widgets/PopoverTooltipClick';
import SearchBarExtensible from '../widgets/SearchBarExtensible';

import { requestProblemGenericInstance, requestReducedInstance, requestSolverSteps } from '../redux';
import VisualizationBox from '../widgets/VisualizationBox';
import ProblemSection from '../widgets/ProblemSection';

import { useVisualizationInfo } from '../hooks/ProblemProvider';

const CARD = { cardBodyText: "DEFAULT BODY", problemJson: 'DEFAULT', problemInstance: 'DEFAULT', cardHeaderText: "Visualize", problemText: "DEFAULT" }
const SWITCHES = { switch1: "Highlight solution", switch2: "Highlight gadgets", switch3: "Show reduction" }
const ACCORDION_FORM_ONE = { placeHolder: "Select visualization" }
const TOOLTIP = { header: "Visualization Information", formalDef: "Choose a visualization to see information about it", info: "", credit: "" }

export default function VisualizeRowReact({
  url,
  problemInstance,
  problemName,
  problemNameMap,
  chosenReduceTo,
  chosenReductionType,
  reductionNameMap,
  reducedInstance,
  chosenSolver,
  chosenVisualization,
  VisualizationNameMap,
  setChosenVisualization,
  visualizationOptions,

}) {
  var visualization;
  const visualizationInfo = useVisualizationInfo(url, chosenVisualization);



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


  const [showSolution, setShowSolution] = useState(false);
  const [showGadgets, setShowGadgets] = useState(false);
  const [showReduction, setShowReduction] = useState(false);
  const [disableGadget, setDisableGadget] = useState(false);
  const [disableSolution, setDisableSolution] = useState(true);
  const [disableReduction, setDisableReduction] = useState(chosenReductionType);

  const [problemVisualizationData, setProblemVisualizationData] = useState(defaultSat3VisualizationArr);
  const [reducedVisualizationData, setReducedVisualizationData] = useState(defaultCLIQUEVisualizationArr);
  const [svgIsLoading, setSvgIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [allSteps, setAllSteps] = useState([]);

  const isDisabled = showGadgets || showReduction;

  useEffect(() => {
    if (svgIsLoading) {
      setSvgIsLoading(false);
    }
  }, [svgIsLoading])


  useEffect(() => {
    // Reset allSteps when problemInstance or problemName changes
    setAllSteps([]);
    setCurrentStep(0);
    setShowSolution(false);
  }, [problemInstance, problemName, chosenSolver]);

  useEffect(() => {
    (problemName !== '' && problemName !== null) ? setDisableSolution(false) : setDisableSolution(true);
    (chosenReduceTo !== '' && chosenReduceTo !== null) ? setDisableReduction(false) : setDisableReduction(true);
    (problemName === 'SAT3' && chosenReduceTo === 'CLIQUE') ? setShowReduction(true) : setShowReduction(false);
  }, [problemName, chosenReduceTo]);

  useEffect(() => {

    if (!chosenReductionType) {
      setDisableReduction(true);
      setShowReduction(false);
    }
    else { setDisableReduction(false); }

  }, [chosenReductionType])

  useEffect(() => {
    if (currentStep === allSteps.length + 1) {
      setShowSolution(true);
    } else {
      setShowSolution(false);
    }
  }, [currentStep, allSteps.length]);

  useEffect(() => {
    requestSolverSteps(url, chosenSolver, problemInstance).then(steps => {
      if (steps) setAllSteps(steps);
    });
  }, [problemInstance, chosenSolver]);

  useEffect(() => {
    if (problemName === "SAT3") {
      requestProblemGenericInstance(url, problemName, problemInstance).then(data => {
        if (data) {
          setProblemVisualizationData(data.clauses);
        }
      });
      if (chosenReductionType) {
        requestReducedInstance(url, chosenReductionType, problemInstance).then(data => {
          if (data) {
            setReducedVisualizationData(data.reductionTo.clusterNodes);
          }
        });
      }
    }
  }, [problemInstance]);


  function handleSwitch1Change(e) { // solution switch
    setShowSolution(e.target.checked);
    setShowGadgets(false);
    if (e.target.checked) setCurrentStep(allSteps.length + 1);
    else setCurrentStep(0);
  }

  function handleSwitch2Change(e) { //gadget switch.
    // setShowGadgets(true);
    // setShowGadgets(false);
    setShowGadgets(e.target.checked);
    setShowSolution(false);
    setCurrentStep(0);
  }

  function handleSwitch3Change(e) { //Reduction Switch
    setShowReduction(e.target.checked);
    setCurrentStep(0);

    // if (!e.target.checked) {
    //   setDisableGadget(true);
    // } else {
    //   setDisableGadget(false);
    // }

  }

  function handleRefreshButton(e) {
    setSvgIsLoading(true);
    setShowSolution(false);
    setShowGadgets(false);
    setShowReduction(false);
    setCurrentStep(0);
  }

  const logicProps = {
    solverOn: showSolution,
    reductionOn: showReduction,
    gadgetsOn: showGadgets,
  }

  function handleRadioChange(value) {
    switch (value) {
      case 'start':
        setCurrentStep(0);
        break;
      case 'back':
        setCurrentStep(prev => Math.max(prev - 1, 0));
        break;
      case 'forward':
        setCurrentStep(prev => Math.min(prev + 1, allSteps.length + 1));
        break;
      case 'end':
        setCurrentStep(allSteps.length + 1);
        break;
      default:
        break;
    }
  }

  return (
    <ProblemSection defaultCollapsed={false}>
      <ProblemSection.Header title={CARD.cardHeaderText}>
        <SearchBarExtensible
          placeholder={ACCORDION_FORM_ONE.placeHolder}
          selected={chosenVisualization}
          onSelect={setChosenVisualization}
          options={Array.isArray(visualizationOptions) ? visualizationOptions : []}
          optionsMap={VisualizationNameMap}
          disabled={!problemName}
          disabledMessage={"No visualization available. Please select a problem."}
          extenderButtons={(input) => [
            {
              label: `Add new visualization "${input}"`,
              href: `${url}ProblemTemplate/visualization?problemName=${input}&visualizationName=${input}`,
            },
          ]}
        />

        <PopoverTooltipClick
          toolTip={
            chosenVisualization
              ? {
                  header: visualizationInfo.verifierName ?? "",
                  formalDef: visualizationInfo.verifierDefinition ?? "",
                  info: visualizationInfo.source ?? "",
                }
              : TOOLTIP
          }
        />
      </ProblemSection.Header>



      <ProblemSection.Body>
        {/* Container for everything above the VisualizationBox */}
        <div
          style={{
            border: "2px solid #ccc",    // Outline
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between", // Keep left and right at edges
            alignItems: "center",             // Vertical centering
            backgroundColor: "#f9f9f9",
            flexWrap: "wrap",                 // Wrap on small screens
          }}
        >
          {/* Left side — Refresh button + step controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Button
              style={{ backgroundColor: "#43a047" }}
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshButton}
            >
              Refresh
            </Button>

            <OverlayTrigger
              placement="bottom"
              overlay={
                isDisabled ? (
                  <Popover id="popover-basic">
                    <Popover.Body>
                      {"Radio buttons and text box are disabled when gadgets or reduction is on."}
                    </Popover.Body>
                  </Popover>
                ) : (
                  <></>
                )
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <IconButton onClick={() => handleRadioChange("start")} disabled={isDisabled}>
                  <FastRewind />
                </IconButton>
                <IconButton onClick={() => handleRadioChange("back")} disabled={isDisabled}>
                  <SkipPrevious />
                </IconButton>

                <TextField
                  type="number"
                  variant="filled"
                  value={currentStep}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") setCurrentStep("");
                    else {
                      const numValue = Number(value);
                      if (numValue >= 0 && numValue <= allSteps.length + 1) setCurrentStep(numValue);
                    }
                  }}
                  inputProps={{
                    min: 0,
                    max: allSteps.length + 1,
                    onInput: (e) => {
                      const value = e.target.value;
                      if (value < 0 || value > allSteps.length + 1) e.target.value = currentStep;
                    },
                  }}
                  style={{ width: "70px" }}
                  disabled={isDisabled}
                />

                <IconButton onClick={() => handleRadioChange("forward")} disabled={isDisabled}>
                  <SkipNext />
                </IconButton>
                <IconButton onClick={() => handleRadioChange("end")} disabled={isDisabled}>
                  <FastForward />
                </IconButton>
              </div>
            </OverlayTrigger>
          </div>

          {/* Right side — Switch controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <FormControlLabel
              disabled={disableReduction}
              checked={showReduction}
              control={<Switch />}
              label={SWITCHES.switch3}
              onChange={handleSwitch3Change}
              style={{ margin: 0 }}
            />
            <FormControlLabel
              disabled={disableGadget}
              checked={showGadgets}
              control={<Switch id="highlightGadgets" />}
              label={SWITCHES.switch2}
              onChange={handleSwitch2Change}
              style={{ margin: 0 }}
            />
            <FormControlLabel
              disabled={disableSolution}
              checked={showSolution}
              control={<Switch id="showSolution" />}
              label={SWITCHES.switch1}
              onChange={handleSwitch1Change}
              style={{ margin: 0 }}
            />
          </div>
        </div>

        {/* Visualization Box */}
        <VisualizationBox
          loading={svgIsLoading}
          problemInstance={problemInstance}
          problemVisualizationData={problemVisualizationData}
          reducedVisualizationData={reducedVisualizationData}
          problemSolutionData={defaultSat3SolutionArr}
          visualizationState={logicProps}
          url={url}
          problemName={problemName}
          problemNameMap={problemNameMap}
          chosenReduceTo={chosenReduceTo}
          chosenReductionType={chosenReductionType}
          reductionNameMap={reductionNameMap}
          reducedInstance={reducedInstance}
          chosenSolver={chosenSolver}
          currentStep={currentStep}
          allSteps={allSteps}
          visualizationType={visualizationInfo.visualizationType}
        />
      </ProblemSection.Body>

    </ProblemSection>
  );
}
