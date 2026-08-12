/**
 * ProblemRowReact.js
 * 
 * This component does the real grunt work of the ProblemRow component. It uses passed in props to style and provide default text for its objects,
 * uses and updates the global state for the problem and problem instance, and has a variety of listeners and API calls.
 * 
 * Essentialy, this is the brains of the ProblemRowReact.js component and deals with the GUI's Problem "Row"
 * @author Alex Diviney
 */

import React, { useEffect, useState, useRef } from 'react'
import { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import { TextField } from '@mui/material';
import { Button, Stack, Box } from "@mui/material";
import { Folder as FolderIcon } from '@mui/icons-material';
import { Download as DownloadIcon } from '@mui/icons-material';

import PopoverTooltipClick from '../widgets/PopoverTooltipClick';
import ProblemFilterMenu from '../widgets/ProblemFilterMenu';
import { useProblemInfo } from '../hooks/ProblemProvider'
import { useProblemIndex } from '../hooks/ProblemFilters/useProblemIndex';
import { useProblemFilters } from '../hooks/ProblemFilters/useProblemFilters';
import ProblemInstanceParser from '../../Tools/ProblemInstanceParser';
import ProblemSection from '../widgets/ProblemSection';
import SearchBarExtensible from '../widgets/SearchBarExtensible';

const ACCORDION_FORM_ONE = { placeHolder: "Select problem" }
const ACCORDION_FORM_TWO = { placeHolder: "default instance" }
var CARD = { cardBodyText: "Instance", cardHeaderText: "Problem", problemInstance: "" }
const TOOLTIP = { header: "Problem Information", formalDef: "Choose a problem to see information about it", info: "", credit: "" }
const THEME = { colors: { grey: "#424242", orange: "#d4441c" } };

// Display order for the dropdown's complexity-class sections. Unclassified
// last -- it's the "not yet tagged" bucket, not a real complexity class.
const COMPLEXITY_CLASS_ORDER = ["P", "NPComplete", "NPHard", "NPIntermediate", "QuantumOracle", "Unclassified"];

/**
 *  Creates an accordion that has a nested autocomplete search bar, as well as an editable problem instance textbox
 */
export default function ProblemRowReact({ url, problemName, setProblemName, problemNameMap, setProblemInstance }) {
  const problemInfo = useProblemInfo(url, problemName);
  const { problemIndex, reductionGraph } = useProblemIndex(url);
  const {
    selectedComplexityClasses,
    setSelectedComplexityClasses,
    selectedSolverComplexityBuckets,
    setSelectedSolverComplexityBuckets,
    selectedVisualizationTypes,
    setSelectedVisualizationTypes,
    filteredProblems,
    clearFilters,
  } = useProblemFilters(problemIndex, reductionGraph);
  // problemIndex is fetched independently of problemNameMap (a separate hook
  // chain); intersect so a momentary population lag between the two can't put
  // an unlabeled option in the dropdown.
  const filteredProblemOptions = filteredProblems.filter((name) => problemNameMap.has(name));
  const [problemLocalInstance, setProblemLocalInstance] = useState("")
  const defaultInstanceParsed = {
    test: true,
    input: "No Input, Default String",
    regex: "There is no regex string for this problem, parsing is likely not enabled",
    type: "No input, default string",
    exampleStr: "" // No input, default string

  }


  const [instanceParsed, setInstanceParsed] = useState(defaultInstanceParsed);
  const [seconds, setSeconds] = useState(1);
  const [timerIsActive, setTimerActive] = useState(false);
  const isFirstRender = useRef(true);

  function openFileDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';

    input.onchange = function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const content = e.target.result;
          setProblemLocalInstance(content);
          handleChangeInstance({ target: { value: content } }); // Trigger handleChangeInstance
        };
        reader.readAsText(file);
      }
    };

    input.click();
  }
  async function handleDownload() {
    const blob = new Blob([problemLocalInstance], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = "query";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  //Updates state on problemName changing.
  useEffect(() => {
    let timer = null;
    if (timerIsActive) {
      timer = setInterval(() => {
        setSeconds(seconds + 1);
        if (seconds % 2 === 0) {
          const cleanedInstance = problemLocalInstance.replaceAll(' ', '')
          if (!cleanedInstance == '') { //Dont try to parse an empty string because it will fail and we dont want textbox to be red on empty input
            const parser = new ProblemInstanceParser();
            const parsedOutput = parser.parse(problemName, cleanedInstance)
            setInstanceParsed(parsedOutput)
            if (parsedOutput.test === true) {
              setProblemInstance(cleanedInstance);
            }
          }
          setTimerActive(false);
          setSeconds(1);
        }
      }, 1000);
    }
    else {
      clearInterval(timer)
    }
    // clearing interval
    return () => clearInterval(timer);
  });

  //Updates the problem instance on problem name change to be the default instance of the new problem.
  useEffect(() => {
    const problem = problemInfo ? problemInfo : false;
    if (!problem.problemName) return;

    let problemVal = problem.defaultInstance ?? "";
    const storedData = null;

    if (isFirstRender.current) {
      // First render: read from localStorage
      if (storedData) {
        const allData = JSON.parse(storedData);
        problemVal = allData.instance;
      }
      isFirstRender.current = false;
    }

    setProblemLocalInstance(problemVal);
    setProblemInstance(problemVal);

  }, [problemInfo, setProblemInstance])

  //Local state that handles problem instance change without triggering mass refreshing.
  const handleChangeInstance = (event) => {
    setProblemLocalInstance(event.target.value)
    if (!instanceParsed.test) {
      defaultInstanceParsed.exampleStr = "";
    }
    if (!timerIsActive) {
      setTimerActive(true);
    }
  }

  const tip =
    problemName
      ? {
          header: problemInfo.problemName ?? "",
          formalDef: problemInfo.formalDefinition ?? "",
          // It makes description clean
          info: problemInfo.problemDefinition ?? "",
          classification: [
            { label: "Complexity class", value: problemInfo.complexityClass || "Unclassified" },
          ],
          // Source shown on its own line here
          source:
            problemInfo.source ||
            (Array.isArray(problemInfo.citations) ? problemInfo.citations.join("; ") : "") ||
            "",
          // Contributors
          credit:
            Array.isArray(problemInfo.contributors) && problemInfo.contributors.length
              ? problemInfo.contributors.join(", ")
              : "",
          //  Popover builds Wikipedia URL
          componentLink: problemInfo.problemLink || "",
          sourceLink: problemInfo.sourceLink || "",
          isMathDef: true, // only this file adds the flag
        }
      : TOOLTIP;

  return (
    <ProblemSection defaultCollapsed={false}>
      <ProblemSection.Header title={CARD.cardHeaderText}>
        <SearchBarExtensible
          placeholder={ACCORDION_FORM_ONE.placeHolder}
          selected={problemName}
          onSelect={setProblemName}
          options={filteredProblemOptions}
          optionsMap={problemNameMap}
          groupBy={(key) => problemIndex.get(key)?.complexityClass || "Unclassified"}
          groupOrder={COMPLEXITY_CLASS_ORDER}
          extenderButtons={(input) => [
            {
              label: `Add new problem "${input}"`,
              href: `${url}ProblemTemplate/?problemName=${input}`,
            },
          ]}
        />{" "}
        <ProblemFilterMenu
          problemIndex={problemIndex}
          selectedComplexityClasses={selectedComplexityClasses}
          setSelectedComplexityClasses={setSelectedComplexityClasses}
          selectedSolverComplexityBuckets={selectedSolverComplexityBuckets}
          setSelectedSolverComplexityBuckets={setSelectedSolverComplexityBuckets}
          selectedVisualizationTypes={selectedVisualizationTypes}
          setSelectedVisualizationTypes={setSelectedVisualizationTypes}
          clearFilters={clearFilters}
        />{" "}
         <PopoverTooltipClick toolTip={tip} />
      </ProblemSection.Header>

      <ProblemSection.Body>
        <Stack direction="row" gap={1}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
            {CARD.cardBodyText}
          </Box>
          {/* <FormControl as="textarea" value={problemLocalInstance} onChange={handleChangeInstance} ></FormControl> *FORM CONTROL 2 (dropdown) */}
          <TextField
            error={!instanceParsed.test}
            id="outlined-error"
            label={!instanceParsed.test ? "Incorrect Format" : "Problem Instance"}
            sx={{ width: "100%" }}
            value={problemLocalInstance}
            onChange={handleChangeInstance}
            helperText={!instanceParsed.test ? "Problem failed? Try: " + instanceParsed.exampleStr : ""} // Only displays the "Incorrect format" stuff when the input is activly wrong
            className="hide-scrollbar"
            multiline
            maxRows={5}
          ></TextField>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
            <Button
              size="large"
              color="white"
              style={{ backgroundColor: THEME.colors.grey }}
              onClick={openFileDialog}
              className="fixed-button"
            >
              <FolderIcon />
            </Button>
            <Button
              size="large"
              color="white"
              style={{ backgroundColor: THEME.colors.grey }}
              onClick={handleDownload}
              className="fixed-button"
            >
              <DownloadIcon />
            </Button>
          </div>
        </Stack>
      </ProblemSection.Body>
    </ProblemSection>
  );
}
