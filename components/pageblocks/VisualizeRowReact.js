/**
 * VisualizeRowReact.js
 *
 * Handles visualization row UI, step controls, switches,
 * and async loading of visualization data.
 */

import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Button,
  Switch,
  FormControlLabel,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  SkipPrevious,
  SkipNext,
  FastRewind,
  FastForward,
} from "@mui/icons-material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
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
import { isRenderable } from "../Visualization/svgs/renderability";

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
  visualizationTypeMap,
  dragHandleProps,
}) {
  const visualizationInfo = useVisualizationInfo(url, chosenVisualization);

  const unrenderableOptions = (VisualizationOptions || []).filter(
    (option) => !isRenderable(visualizationTypeMap?.get(option))
  );
  const hasRenderableOption = (VisualizationOptions || []).some(
    (option) => !unrenderableOptions.includes(option)
  );
  const noRenderableOptions = (VisualizationOptions || []).length > 0 && !hasRenderableOption;

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
    setCurrentStep(0);
  }, [problemName, problemInstance, chosenVisualization]);

  // Visualization selection (stored choice / renderable default / first renderable option /
  // explicit empty state) is fully resolved inside useChosenVisualization -- see
  // components/hooks/ProblemProvider/Visualization.js. Do not add a fallback-pick effect here:
  // calling setChosenVisualization from this component marks the pick as "user selected" and
  // permanently blocks the hook's own default resolution for that problem.

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
  }, [problemInstance, chosenSolver, url]);

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
  }, [showReduction, chosenReduceTo, problemInstance, solution, chosenReductionType, url]);


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

        // The DFA table trace is most useful read from its finished state
        // (full row history, final accept/reject), so default its slider to
        // the last step instead of the first.
        const defaultStep =
          visualizationInfo?.visualizationType === "DFA Table" && processedData.length > 0
            ? processedData.length - 1
            : 0;

        setProblemData(processedData);
        setCurrentStep(defaultStep);
        setCurrentProblemData(processedData?.[defaultStep] ?? null);
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
    url,
    problemName,
    visualizationInfo?.visualizationType,
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
  }, [problemInstance, problemName, chosenReductionType, url]);

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
      classification: [
        { label: "Visualization type", value: visualizationInfo.visualizationType || "Unclassified" },
      ],
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
          optionsDisabled={unrenderableOptions}
          disabledOptionHint="no renderer available"
          disabled={!problemName || noRenderableOptions}
          disabledMessage={
            noRenderableOptions
              ? "No renderable visualization for this problem"
              : "No visualization available. Please select a problem."
          }
          extenderButtons={(input) => [
            {
              label: `Add new visualization "${input}"`,
              href: `${url}ProblemTemplate/visualization?problemName=${problemName}&visualizationName=${input}`,
            },
          ]}
        />

        <PopoverTooltipClick toolTip={tip} />
        {dragHandleProps && (
                          <IconButton
                            {...dragHandleProps.attributes}
                            {...dragHandleProps.listeners}
                            size="small"
                            title="Drag to reorder"
                            sx={{
                              cursor: 'grab',
                              color: '#424242',
                              backgroundColor: '#f5f5f5',
                              '&:hover': { backgroundColor: '#e0e0e0' },
                              mr: 1,
                            }}
                          >
                            <DragIndicatorIcon />
                          </IconButton>
                        )}
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

            <Tooltip
              placement="bottom"
              title={isDisabled ? "Navigation disabled during reduction or gadget mode." : ""}
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
            </Tooltip>
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
