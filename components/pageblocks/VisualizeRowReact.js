/**
 * VisualizeRowReact.js
 *
 * Handles visualization row UI, step controls, switches,
 * and async loading of visualization data.
 */

import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { OverlayTrigger, Popover } from "react-bootstrap";
import {
  Button,
  Switch,
  FormControlLabel,
  IconButton,
  TextField,
} from "@mui/material";
import {
  SkipPrevious,
  SkipNext,
  FastRewind,
  FastForward,
} from "@mui/icons-material";
import RefreshIcon from "@mui/icons-material/Refresh.js";
import Link from "next/link"; // <-- IMPORTANT for Quantum button

import PopoverTooltipClick from "../widgets/PopoverTooltipClick";
import SearchBarExtensible from "../widgets/SearchBarExtensible";

import {
  requestProblemGenericInstance,
  requestReducedInstance,
  requestVisualization,
  requestReductionVisualization,
  requestSolvedInstance,
} from "../redux";

import VisualizationLogic from "../widgets/VisualizationLogic";
import ProblemSection from "../widgets/ProblemSection";
import { useVisualizationInfo } from "../hooks/ProblemProvider";

const CARD = { cardBodyText: "DEFAULT BODY", cardHeaderText: "Visualize" };
const SWITCHES = {
  switch1: "Highlight solution",
  switch2: "Highlight gadgets",
  switch3: "Show reduction",
};
const ACCORDION_FORM_ONE = { placeHolder: "Select visualization" };
const TOOLTIP = {
  header: "Visualization Information",
  formalDef: "Choose a visualization to see info about it",
};

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
  VisualizationOptions,
  defaultVisualizationMap,
}) {
  const visualizationInfo = useVisualizationInfo(url, chosenVisualization);

  const defaultSat3VisualizationArr = [
    ["x1", "!x2", "x3"],
    ["!x1", "x3", "x1"],
    ["x2", "!x3", "x1"],
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

  const [problemVisualizationData, setProblemVisualizationData] = useState(
    defaultSat3VisualizationArr
  );
  const [reducedVisualizationData, setReducedVisualizationData] = useState(
    defaultCLIQUEVisualizationArr
  );
  const [currentProblemData, setCurrentProblemData] = useState(null);
  const [currentReductionData, setCurrentReductionData] = useState(null);
  const [problemData, setProblemData] = useState([]);
  const [problemReductionData, setProblemReductionData] = useState([]);
  const [svgIsLoading, setSvgIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [instanceReady, setInstanceReady] = useState(false);

  const isDisabled = showGadgets || showReduction;
  const totalSteps = problemData.length;

  // Track when instance is ready
  useEffect(() => {
    setInstanceReady(!!(problemInstance && problemName));
  }, [problemInstance, problemName]);

  useEffect(() => {
    setProblemData([]);
    setCurrentProblemData(null);
  }, [problemName, problemInstance, chosenVisualization]);

  // fetch solution when instance or solver changes, since it's needed for some visualizations and reductions
  const [solution, setSolution] = useState(undefined);

  useEffect(() => {
    if (!problemInstance || !chosenSolver) return;

    const fetchSolvedInstance = async () => {
      try {
        const solved = await requestSolvedInstance(url, chosenSolver, problemInstance);
        setSolution(solved);
      } catch (err) {
        console.error("Failed to solve instance:", err);
      }
    };

    fetchSolvedInstance();
  }, [problemInstance, chosenSolver]);

  // Fetch reduction visualization
  useEffect(() => {
    if (
      !chosenReduceTo ||
      !problemInstance ||
      !showReduction ||
      !solution
    )
      return;

    const fetch = async () => {
      try {
        const data = await requestReductionVisualization(
          url,
          chosenReductionType,
          solution,
          problemInstance
        );
        setProblemReductionData(data ?? []);
      } catch (err) {
        console.error("Failed to load reduction visualization:", err);
      }
    };

    fetch();
  }, [showReduction, chosenReduceTo, problemInstance, solution]);


  // Fetch main visualization data
  useEffect(() => {
    if (!instanceReady || !chosenVisualization) return;

    let alive = true;

    const fetch = async () => {
      try {
        const data = await requestVisualization(
          url,
          chosenVisualization,
          problemInstance,
        );

        if (!alive) return;

        let processedData = data ? [...data] : [];

        // In reduction mode, only show the first and last frames to highlight the delta
        if (showReduction && processedData.length > 1) {
          processedData = [
            processedData[0],
            processedData[processedData.length - 1],
          ];
        }

        setProblemData(processedData);
        setCurrentProblemData(processedData?.[0] ?? null);
      } catch (err) {
        console.error(err);
      }
    };

    fetch();

    return () => {
      alive = false;
    };
  }, [
    instanceReady,
    chosenVisualization,
    problemInstance,
    showReduction,
  ]);

  // Fetch SAT3
  useEffect(() => {
    if (problemName !== "SAT3") return;

    const fetchSAT3 = async () => {
      try {
        const clauses = await requestProblemGenericInstance(
          url,
          problemName,
          problemInstance
        );
        if (clauses) setProblemVisualizationData(clauses.clauses);

        if (chosenReductionType) {
          const reduced = await requestReducedInstance(
            url,
            chosenReductionType,
            problemInstance
          );
          if (reduced)
            setReducedVisualizationData(reduced.reductionTo.clusterNodes);
        }
      } catch (err) {
        console.error("SAT3 fetch failed:", err);
      }
    };

    fetchSAT3();
  }, [problemInstance, problemName, chosenReductionType]);

  useEffect(() => {
    setDisableSolution(!problemName);
    setDisableReduction(!chosenReduceTo);
    setShowGadgets(false);
  }, [problemName, chosenReduceTo]);

  useEffect(() => {
    setDisableReduction(!chosenReductionType);
    if (!chosenReductionType) setShowReduction(false);
  }, [chosenReductionType]);

  useEffect(() => {
    setShowSolution(currentStep === totalSteps - 1 && totalSteps > 1);
  }, [currentStep, totalSteps]);

  useEffect(() => {
    setCurrentProblemData(problemData[currentStep] ?? null);
    setCurrentReductionData(problemReductionData[currentStep] ?? null);
  }, [problemData, currentStep, problemReductionData]);

  // Switch Handlers
  function handleSwitch1Change(e) {
    setShowSolution(e.target.checked);
    setShowGadgets(false);
    setCurrentStep(e.target.checked ? totalSteps - 1 : 0);
  }

  function handleSwitch2Change(e) {
    setShowGadgets(e.target.checked);
    setShowSolution(false);
    setCurrentStep(0);
  }

  function handleSwitch3Change(e) {
    setShowReduction(e.target.checked);
  }
  function handleRefreshButton() {
    setSvgIsLoading(false);
    setShowSolution(false);
    setShowGadgets(false);
    setShowReduction(false);
    setCurrentStep(0);
  }

  function handleRadioChange(type) {
    if (type === "start") setCurrentStep(0);
    else if (type === "back") setCurrentStep((p) => Math.max(0, p - 1));
    else if (type === "forward")
      setCurrentStep((p) => Math.min(totalSteps - 1, p + 1));
    else if (type === "end") setCurrentStep(totalSteps - 1);
  }

  const logicProps = {
    solverOn: showSolution,
    reductionOn: showReduction,
    gadgetsOn: showGadgets,
  };

  const tip = chosenVisualization
    ? {
      header: visualizationInfo.visualizationName ?? "",
      formalDef: visualizationInfo.visualizationDefinition ?? "",
      info: visualizationInfo.info ?? visualizationInfo.description ?? "",
      source: visualizationInfo.source,
      credit:
        Array.isArray(visualizationInfo.contributors) &&
          visualizationInfo.contributors.length
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
          options={VisualizationOptions || []}
          optionsMap={VisualizationNameMap}
          disabled={!problemName}
          disabledMessage="No visualization available. Please select a problem."
          extenderButtons={(input) => [
            {
              label: `Add new visualization "${input}"`,
              href: `${url}ProblemTemplate/visualization?problemName=${problemName}&visualizationName=${input}`,
            },
          ]}
        />

        <PopoverTooltipClick toolTip={tip} />
      </ProblemSection.Header>

      <ProblemSection.Body>
        {/* Controls */}
        <div
          style={{
            border: "2px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "#f9f9f9",
            flexWrap: "wrap",
          }}
        >
          {/* Refresh + Step navigation */}
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
                  <Popover>
                    <Popover.Body>
                      Navigation disabled during reduction or gadget mode.
                    </Popover.Body>
                  </Popover>
                ) : (
                  <></>
                )
              }
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <IconButton
                  disabled={isDisabled}
                  onClick={() => handleRadioChange("start")}
                >
                  <FastRewind />
                </IconButton>
                <IconButton
                  disabled={isDisabled}
                  onClick={() => handleRadioChange("back")}
                >
                  <SkipPrevious />
                </IconButton>

                <TextField
                  type="number"
                  variant="filled"
                  value={currentStep}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (!isNaN(n) && n >= 0 && n < totalSteps)
                      setCurrentStep(n);
                  }}
                  style={{ width: "70px" }}
                  disabled={isDisabled}
                />

                <IconButton
                  disabled={isDisabled}
                  onClick={() => handleRadioChange("forward")}
                >
                  <SkipNext />
                </IconButton>
                <IconButton
                  disabled={isDisabled}
                  onClick={() => handleRadioChange("end")}
                >
                  <FastForward />
                </IconButton>
              </div>
            </OverlayTrigger>
          </div>

          {/* Switches */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <FormControlLabel disabled={disableReduction} checked={showReduction} control={<Switch />} label={SWITCHES.switch3} onChange={handleSwitch3Change} />
            <FormControlLabel disabled={disableGadget} checked={showGadgets} control={<Switch id="highlightGadgets" />} label={SWITCHES.switch2} onChange={handleSwitch2Change} />
            <FormControlLabel disabled={disableSolution} checked={showSolution} control={<Switch id="showSolution" />} label={SWITCHES.switch1} onChange={handleSwitch1Change} />
          </div>
        </div>

        {/* Main visualization */}
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
          reductionVisualization={reductionVisualization}
        />
      </ProblemSection.Body>
    </ProblemSection>
  );
}
