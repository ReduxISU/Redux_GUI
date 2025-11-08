/**
 * VisualizeRowReact.js
 * 
 * Handles visualization row UI, step controls, switches, and async loading of visualization data.
 */

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Button, Switch, FormControlLabel, IconButton, TextField } from '@mui/material';
import { SkipPrevious, SkipNext, FastRewind, FastForward } from '@mui/icons-material';
import RefreshIcon from '@mui/icons-material/Refresh';

import PopoverTooltipClick from '../widgets/PopoverTooltipClick';
import SearchBarExtensible from '../widgets/SearchBarExtensible';

import { requestProblemGenericInstance, requestReducedInstance, requestVisualization, requestInfo } from '../redux';
import VisualizationLogic from '../widgets/VisualizationLogic';
import ProblemSection from '../widgets/ProblemSection';
import { useVisualizationInfo } from '../hooks/ProblemProvider';

const CARD = { cardBodyText: "DEFAULT BODY", cardHeaderText: "Visualize" };
const SWITCHES = { switch1: "Highlight solution", switch2: "Highlight gadgets", switch3: "Show reduction" };
const ACCORDION_FORM_ONE = { placeHolder: "Select visualization" };
const TOOLTIP = { header: "Visualization Information", formalDef: "Choose a visualization to see information about it" };

export default function VisualizeRowReact({
  url,
  problemInfo,
  problemInstance,
  problemName,
  problemNameMap,
  chosenReduceTo,
  chosenReductionType,
  reductionNameMap,
  reducedInstance,
  reductionVisualization,
  chosenSolver,
  defaultSolverMap,
  chosenVisualization,
  VisualizationNameMap,
  setChosenVisualization,
  visualizationOptions,
  defaultVisualizationMap,
}) {

  const visualizationInfo = useVisualizationInfo(url, chosenVisualization);

  const defaultSat3VisualizationArr = [
    ["x1", "!x2", "x3"],
    ["!x1", "x3", "x1"],
    ["x2", "!x3", "x1"]
  ];
  const defaultSat3SolutionArr = ["x1"];
  const defaultCLIQUEVisualizationArr = [
    { name: "x1", cluster: "0" },
    { name: "!x2", cluster: "0" },
    { name: "x3", cluster: "0" },
    { name: "!x1", cluster: "1" },
    { name: "x3", cluster: "1" },
    { name: "x1", cluster: "1" },
    { name: "x2", cluster: "2" },
    { name: "!x3", cluster: "2" },
    { name: "x1", cluster: "2" },
  ];

  const [showSolution, setShowSolution] = useState(false);
  const [showGadgets, setShowGadgets] = useState(false);
  const [showReduction, setShowReduction] = useState(false);
  const [disableGadget, setDisableGadget] = useState(false);
  const [disableSolution, setDisableSolution] = useState(true);
  const [disableReduction, setDisableReduction] = useState(!chosenReductionType);

  const [problemVisualizationData, setProblemVisualizationData] = useState(defaultSat3VisualizationArr);
  const [reducedVisualizationData, setReducedVisualizationData] = useState(defaultCLIQUEVisualizationArr);
  const [currentProblemData, setCurrentProblemData] = useState(null);
  const [currentReductionData, setCurrentReductionData] = useState(null);
  const [problemData, setProblemData] = useState([]);
  const [problemReductionData, setProblemReductionData] = useState([]);
  const [svgIsLoading, setSvgIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [instanceReady, setInstanceReady] = useState(false);

  const isDisabled = showGadgets || showReduction;
  const totalSteps = problemData.length;

  // Track when problem instance is ready
  useEffect(() => {
    if (problemInstance && problemName) setInstanceReady(true);
    else setInstanceReady(false);
  }, [problemInstance, problemName]);

  useEffect(() => {
    setProblemData([]);
    setCurrentProblemData(null);
  }, [problemName, problemInstance, chosenVisualization]);


  useEffect(() => {
    if (!chosenReduceTo || !reducedInstance || !showReduction) return;

    const fetchVisualization = async () => {
      try {
        const data = await requestVisualization(url, reductionVisualization || defaultVisualizationMap.get(chosenReduceTo), reducedInstance, defaultSolverMap.get(chosenReduceTo));
        console.log("++++++++++++++++++++++++++++++++++++++");
        console.log("chosenReductionType:", reductionVisualization || defaultVisualizationMap.get(chosenReduceTo));
        console.log("defaultVisualizationMap.get(chosenReduceTo):", defaultVisualizationMap.get(chosenReduceTo));
        console.log("reducedInstance:", reducedInstance);
        console.log("defaultSolverMap.get(chosenReduceTo):", defaultSolverMap.get(chosenReduceTo));
        console.log("++++++++++++++++++++++++++++++++++++++");
        console.log("reduction data:", data);
        setProblemReductionData(data ?? []);
      } catch (err) {
        console.error("Failed to load visualization:", err);
        setProblemReductionData([]);
      }
    };

    fetchVisualization();
  }, [showReduction, problemName, reducedInstance]);

  // Fetch main visualization data asynchronously after instanceReady
  useEffect(() => {
    if (!instanceReady || !chosenVisualization) return;

    let isCurrent = true; // prevents race conditions
    setProblemData([]);
    setProblemReductionData([]);
    setCurrentProblemData(null);
    setCurrentReductionData(null);
    setCurrentStep(0);

    const fetchVisualization = async () => {
      try {
        const data = await requestVisualization(url, chosenVisualization, problemInstance, chosenSolver);
        if (!isCurrent) return;

        let processedData = data ? [...data] : [];

        // If showReduction is true, only keep first and last elements
        if (showReduction && processedData.length > 1) {
          processedData = [processedData[0], processedData[processedData.length - 1]];
        }

        setProblemData(processedData);
        setCurrentProblemData(processedData?.[0] ?? null);
      } catch (err) {
        console.error(err);
        if (isCurrent) {
          setProblemData([]);
          setProblemReductionData([]);
          setCurrentProblemData(null);
          setCurrentReductionData(null);
        }
      }
    };

    fetchVisualization();

    return () => { isCurrent = false }; // cancel outdated fetches
  }, [instanceReady, chosenVisualization, problemInstance, problemName, chosenSolver]);


  // Fetch SAT3 / Reduction data asynchronously
  useEffect(() => {
    if (problemName !== "SAT3") return;

    const fetchProblemData = async () => {
      try {
        const problemClauses = await requestProblemGenericInstance(url, problemName, problemInstance);
        if (problemClauses) setProblemVisualizationData(problemClauses.clauses);

        if (chosenReductionType) {
          const reduced = await requestReducedInstance(url, chosenReductionType, problemInstance);
          if (reduced) setReducedVisualizationData(reduced.reductionTo.clusterNodes);
        }
      } catch (err) {
        console.error("Failed to fetch SAT3/reduction data:", err);
      }
    };

    fetchProblemData();
  }, [problemInstance, problemName, chosenReductionType]);

  // Switch enable/disable logic
  useEffect(() => {
    setDisableSolution(!problemName);
    setDisableReduction(!chosenReduceTo);
    setShowGadgets(false);
    // Temporarily disabled, needs fixing!
    //setShowReduction(problemName === "SAT3" && chosenReduceTo === "CLIQUE");
  }, [problemName, chosenReduceTo]);

  useEffect(() => {
    setDisableReduction(!chosenReductionType);
    if (!chosenReductionType) setShowReduction(false);
  }, [chosenReductionType]);

  // Show solution when at last step
  useEffect(() => {
    setShowSolution(currentStep === (totalSteps - 1) && totalSteps > 1);
  }, [currentStep, totalSteps]);

  useEffect(() => {
    setCurrentProblemData(problemData[currentStep] ?? null);
    if(showReduction && reducedInstance && "Graph D3") setCurrentReductionData(problemReductionData[currentStep] ?? null);
  }, [problemData, currentStep, problemReductionData]);

  // Switch handlers
  function handleSwitch1Change(e) {
    setShowSolution(e.target.checked);
    setShowGadgets(false);
    setCurrentStep(e.target.checked && totalSteps > 0 ? totalSteps - 1 : 0);
  }
  function handleSwitch2Change(e) {
    setShowGadgets(e.target.checked);
    setShowSolution(false);
    setCurrentStep(0);
  }
  function handleSwitch3Change(e) {
    setShowReduction(e.target.checked);
    setCurrentStep(0);
  }
  function handleRefreshButton() {
    setSvgIsLoading(false);
    setShowSolution(false);
    setShowGadgets(false);
    setShowReduction(false);
    setCurrentStep(0);
  }

  function handleRadioChange(value) {
    switch (value) {
      case 'start': setCurrentStep(0); break;
      case 'back': setCurrentStep(prev => Math.max(prev - 1, 0)); break;
      case 'forward': setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1)); break;
      case 'end': setCurrentStep(totalSteps - 1); break;
      default: break;
    }
  }

  const logicProps = { solverOn: showSolution, reductionOn: showReduction, gadgetsOn: showGadgets };

  const tip =
    chosenVisualization
      ? {
        header: visualizationInfo.visualizationName ?? "",
        formalDef: visualizationInfo.visualizationDefinition ?? "",
        info: visualizationInfo.info ?? visualizationInfo.description ?? "",
        source: visualizationInfo.source,
        credit:
          Array.isArray(visualizationInfo.contributors) && visualizationInfo.contributors.length
            ? visualizationInfo.contributors.join(", ")
            : "",
        componentLink: visualizationInfo.visualizationLink || "",
        sourceLink: visualizationInfo.sourceLink || "",
      }
      : TOOLTIP;

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
          disabledMessage="No visualization available. Please select a problem."
          extenderButtons={(input) => [{ label: `Add new visualization "${input}"`, href: `${url}ProblemTemplate/visualization?problemName=${input}&visualizationName=${input}` }]}
        />
        <PopoverTooltipClick toolTip={tip} />
      </ProblemSection.Header>

      <ProblemSection.Body>
        {/* Controls */}
        <div style={{ border: "2px solid #ccc", borderRadius: "8px", padding: "16px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", backgroundColor: "#f9f9f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Button style={{ backgroundColor: "#43a047" }} variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefreshButton}>Refresh</Button>
            <OverlayTrigger placement="bottom" overlay={isDisabled ? <Popover id="popover-basic"><Popover.Body>Radio buttons and text box are disabled when gadgets or reduction is on.</Popover.Body></Popover> : <></>}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <IconButton onClick={() => handleRadioChange("start")} disabled={isDisabled}><FastRewind /></IconButton>
                <IconButton onClick={() => handleRadioChange("back")} disabled={isDisabled}><SkipPrevious /></IconButton>
                <TextField
                  type="number"
                  variant="filled"
                  value={currentStep}
                  onChange={(e) => {
                    const numValue = Number(e.target.value);
                    if (!isNaN(numValue) && numValue >= 0 && numValue < totalSteps) setCurrentStep(numValue);
                  }}
                  inputProps={{ min: 0, max: totalSteps }}
                  style={{ width: "70px" }}
                  disabled={isDisabled}
                />
                <IconButton onClick={() => handleRadioChange("forward")} disabled={isDisabled}><SkipNext /></IconButton>
                <IconButton onClick={() => handleRadioChange("end")} disabled={isDisabled}><FastForward /></IconButton>
              </div>
            </OverlayTrigger>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <FormControlLabel disabled={disableReduction} checked={showReduction} control={<Switch />} label={SWITCHES.switch3} onChange={handleSwitch3Change} />
            <FormControlLabel disabled={disableGadget} checked={showGadgets} control={<Switch id="highlightGadgets" />} label={SWITCHES.switch2} onChange={handleSwitch2Change} />
            <FormControlLabel disabled={disableSolution} checked={showSolution} control={<Switch id="showSolution" />} label={SWITCHES.switch1} onChange={handleSwitch1Change} />
          </div>
        </div>

        <VisualizationLogic
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
          visualizationType={visualizationInfo.visualizationType}
          visualizationName={chosenVisualization}
          problemData={currentProblemData}
          reductionData={currentReductionData}
          showSolutionToggle={showSolution}
          reductionVisualization={"Graph D3"}
        />
      </ProblemSection.Body>
    </ProblemSection>
  );
}
