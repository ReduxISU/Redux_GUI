/**
 * ReduceToRowReact.js
 * 
 * This component does the real grunt work of the ReduceToRow component. It uses passed in props to style and provide default text for its objects,
 * uses the global state values for the problem name and instance, sets global state values pertaining to reduction, and has a variety of listeners and API calls.
 * 
 * Essentialy, this is the brains of the ReduceToRowReact.js component and deals with the GUI's Reduce "Row"
 * @author Alex Diviney
 */


import React from 'react'
import { useContext, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import { Card } from 'react-bootstrap'
import { Box, Button } from '@mui/material'
import { Download as DownloadIcon } from '@mui/icons-material';
import { DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';

import { requestReducedInstanceFromPath } from '../redux'
import { useProblemInfo, useReducerInfo } from '../hooks/ProblemProvider'
import PopoverTooltipClick from '../widgets/PopoverTooltipClick';
import ProblemSection from '../widgets/ProblemSection';
import SearchBarExtensible from '../widgets/SearchBarExtensible';
import { surfaceColors, textColors, thinScrollbarSx } from '../theme';
import { useThemeMode } from '../ThemeModeContext';
import { complexityClassLabel } from '../hooks/ProblemFilters/complexityClassOrder';
import { reductionTypeLabel } from '../hooks/ProblemFilters/tagLabels';

const ACCORDION_FORM_ONE = { placeHolder: "Select Problem To Reduce To", problemName: "ACCORDION FORM ONE PROBLEM NAME" }
const ACCORDION_FORM_TWO = { placeHolder: "Select Reduction" }

const REDUCE_BUTTON = { buttonText: "Reduce" }
const CARD = { cardBodyText: "Reduce To:", cardHeaderText: "Reduce" }
const TOOLTIP1 = { header: "Reduce To Problem", info: "Choose a problem to reduce your original problem to to see information about it" }
const TOOLTIP2 = {
  header: "Reduction Type",
  info: "Choose a type of reduction to see information about it",
  reductionType: "",
  complexity: "",
  complexityBucket: "",
}
const THEME = { colors: { grey: "#424242", orange: "#d4441c", white: "#ffffff" } }

// Reduced instances/nodes/edges are unbounded-length strings from the API --
// this caps their displayed height and scrolls instead of pushing the rest
// of the page down, while wordBreak keeps a single very long token (e.g. an
// edge list with no spaces) from forcing the pane wider than its container.
function scrollableTextSx(mode) {
  return {
    maxHeight: 220,
    overflowY: "auto",
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
    ...thinScrollbarSx(mode),
  };
}

// ReductionCost describes output-size blowup relative to input size, a
// separate axis from ReductionComplexityBucket (runtime, shown below as
// "Complexity bucket") and the free-text `complexity` Big-O string (issue
// #376) -- a reduction declares all three independently, see
// Interfaces/ReductionCost.cs / ReductionComplexityBucket.cs in the API repo.
const REDUCTION_COST_LABELS = {
  Linear: "Linear (O(n))",
  Quadratic: "Quadratic (O(n²))",
  Cubic: "Cubic (O(n³))",
  HigherPolynomial: "Higher polynomial (O(n^k), k > 3)",
  Unclassified: "Unclassified",
}

export default function ReduceToRowReact({
  url,
  problemName,
  problemNameMap,
  problemInstance,
  reductionNameMap,
  reduceToOptions,
  chosenReduceTo,
  setChosenReduceTo,
  reductionTypeOptions,
  chosenReductionType,
  setChosenReductionType,
  reducedInstance,
  setReducedInstance,
  dragHandleProps,
}) {
  const { mode } = useThemeMode();
  const surface = surfaceColors(mode);
  const text = textColors(mode);

  const reduceToInfo = useProblemInfo(url, chosenReduceTo);
  const reducerInfo = useReducerInfo(url, chosenReductionType);

  async function reduceRequest() {
    setReducedInstance(
      chosenReductionType && problemInstance
        ? (await requestReducedInstanceFromPath(url, chosenReductionType, problemInstance)) ?? ""
        : ""
    );
  }

  async function handleDownload() {
    const blob = new Blob([reducedInstance], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = "query";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <ProblemSection defaultCollapsed={false}>
      <ProblemSection.Header title={CARD.cardHeaderText} titleWidth={"22%"}>
        <SearchBarExtensible
          placeholder={ACCORDION_FORM_ONE.placeHolder}
          selected={chosenReduceTo}
          onSelect={setChosenReduceTo}
          optionsHighlight={reduceToOptions}
          options={[...problemNameMap.keys()].filter(x => x !== problemName)} // Cannot reduce to current problem
          optionsMap={problemNameMap}
          disabled={!problemName}
          disabledMessage={"No reduction method available. Please choose a reduce-to."}
          extenderButtons={(input) => [
            {
              label: `Add new problem "${input}"`,
              href: `${url}ProblemTemplate/?problemName=${input}`,
            },
          ]}
        />{" "}
        <PopoverTooltipClick
          toolTip={
            chosenReduceTo
              ? {
                header: reduceToInfo.problemName ?? "",
                // description only
                info: reduceToInfo.problemDefinition ?? "",
                input: reduceToInfo.inputDescription ?? "",
                output: reduceToInfo.outputDescription ?? "",
                classification: [
                  { label: "Complexity class", value: complexityClassLabel(reduceToInfo.complexityClass || "Unclassified") },
                ],
                // show source
                source: reduceToInfo.source,
                credit:
                  Array.isArray(reduceToInfo.contributors) &&
                    reduceToInfo.contributors.length
                    ? reduceToInfo.contributors.join(", ")
                    : "",
                // hyperlink
                componentLink: reduceToInfo.problemLink || "",
                sourceLink: reduceToInfo.sourceLink || "",
              }
              : TOOLTIP1
          }
        ></PopoverTooltipClick>
        <SearchBarExtensible
          placeholder={ACCORDION_FORM_TWO.placeHolder}
          selected={chosenReductionType}
          onSelect={setChosenReductionType}
          options={reductionTypeOptions}
          optionsMap={
            new Map(
              reductionTypeOptions.map((option) => {
                const reductions = option.split("-").map((r) => reductionNameMap.get(r) ?? r);
                const reductionName = reductions.reduce((name, r) => (name += r + " - "), "");
                return [option, reductionName.slice(0, reductionName.lastIndexOf(" - "))];
              })
            )
          }
          disabled={!problemName || !chosenReduceTo}
          disabledMessage={"No reduction method available. Please select a reduction problem."}
          extenderButtons={(input) => [
            {
              label: `Add new reduction "${input}"`,
              href: `${url}ProblemTemplate/reduction?problemFrom=${problemName}&problemTo=${chosenReduceTo}&reductionName=${input}`,
            },
          ]}
        />
        <PopoverTooltipClick
          toolTip={
            chosenReductionType
              ? {
                header: reducerInfo.reductionName ?? "",
                // plain description for the reduction
                info: reducerInfo.info ?? reducerInfo.description ?? "",
                input: reducerInfo.inputDescription ?? "",
                output: reducerInfo.outputDescription ?? "",
                classification: [
                  {
                    label: "Reduction cost",
                    value: REDUCTION_COST_LABELS[reducerInfo.cost] || reducerInfo.cost || "Unclassified",
                  },
                  { label: "Reduction type", value: reductionTypeLabel(reducerInfo.reductionType || "Unclassified") },
                  { label: "Complexity bucket", value: reducerInfo.complexityBucket || "Unclassified" },
                  { label: "Big-O", value: reducerInfo.complexity || "Not yet determined" },
                ],
                // separate Source line
                source: reducerInfo.source,
                // contributors if present
                credit:
                  Array.isArray(reducerInfo.contributors) &&
                    reducerInfo.contributors.length
                    ? reducerInfo.contributors.join(", ")
                    : "",
                componentLink: reducerInfo.problemLink || "",
                sourceLink: reducerInfo.sourceLink || "",
              }
              : TOOLTIP2
          }
        ></PopoverTooltipClick>
        {dragHandleProps && (
                  <IconButton
                    {...dragHandleProps.attributes}
                    {...dragHandleProps.listeners}
                    size="small"
                    title="Drag to reorder"
                    sx={{
                      cursor: 'grab',
                      color: text.body,
                      backgroundColor: surface.surfaceAlt,
                      '&:hover': { backgroundColor: surface.surfaceAltHover },
                      mr: 1,
                    }}
                  >
                    <DragIndicatorIcon />
                  </IconButton>
                )}
      </ProblemSection.Header>

      <ProblemSection.Body>
        {reducedInstance ? (
          <ReduceInfo
            instance={reducedInstance}
            chosenReduceTo={chosenReduceTo}
            problemName={problemNameMap.get(chosenReduceTo)}
          />
        ) : null}

        <div className="submitButton">
          <Button
            size="large"
            color="white"
            style={{ backgroundColor: THEME.colors.grey }}
            onClick={handleDownload}
            disabled={!chosenReductionType}
          >
            <DownloadIcon />
          </Button>
          <Button
            data-tour-id="reduce-button"
            size="large"
            color="white"
            style={{ backgroundColor: THEME.colors.grey }}
            onClick={reduceRequest}
            disabled={!chosenReductionType}
          >
            {REDUCE_BUTTON.buttonText}
          </Button>
        </div>
      </ProblemSection.Body>
    </ProblemSection>
  );
}

function ReduceInfo({ instance, chosenReduceTo, problemName }) {
  const { mode } = useThemeMode();
  const prettyInstance = checkProblemType(instance, chosenReduceTo);

  // Checks if this is actually a node / edge format. If not, show the original form.
  if (!prettyInstance) {
    return (
      <Box sx={scrollableTextSx(mode)}>
        <Card.Text>{instance}</Card.Text>
      </Box>
    );
  }
  if (prettyInstance[0] === "GRAPH") {
    return (
      <ReduceInfoGraph
        instance={instance}
        nodes={prettyInstance[1]}
        edges={prettyInstance[2]}
        k_value={prettyInstance[3]}
        problemName={problemName}
      />
    );
  }
  if (prettyInstance[0] === "BOOLEAN") {
    return <ReduceInfoBool instance={instance} literals={prettyInstance[1]} clauses={prettyInstance[2]} />;
  }

  return (
    <Box sx={scrollableTextSx(mode)}>
      <Card.Text>{instance}</Card.Text>
    </Box>
  );
}

function ReduceInfoBool({ instance, literals, clauses }) {
  const { mode } = useThemeMode();

  return (
    <>
      <p>
        <b>Literals:</b>
      </p>
      <Box sx={scrollableTextSx(mode)}>{literals}</Box>
      <p>
        <b>Clauses:</b>
      </p>
      <Box sx={scrollableTextSx(mode)}>{clauses}</Box>
      <p>
        <b>Original form:</b>
      </p>
      <Box sx={scrollableTextSx(mode)}>{instance}</Box>
    </>
  );
}

function ReduceInfoGraph({ instance, nodes, edges, k_value, problemName }) {
  const { mode } = useThemeMode();

  return (
    <>
      <p style={{ fontSize: 20 }}>
        <b>Reduced {problemName} Instance:</b>
      </p>

      <Box sx={scrollableTextSx(mode)}>{instance}</Box>

      <p>
        <b>Nodes:</b>
      </p>
      <Box sx={scrollableTextSx(mode)}>{nodes}</Box>

      <p>
        <b>Edges:</b>
      </p>
      <Box sx={scrollableTextSx(mode)}>{edges}</Box>
      <p>
        <b>K value:</b> {k_value}
      </p>
    </>
  );
}

/*Takes a raw instance and tried to parse it diffrent ways with regex. 
If any of them match it return both a "pretty" version of the instance in a array [0] defines the type(Boolean, graph etc.).
In the case of a graph nodes and edges are returned in [1] and [2] respectively.
SAT or boolean form is only the "pretty" form in [1] and [2] is an empty string.*/
function checkProblemType(stringInstance, chosenReduceTo) {
  const spacedInstance = stringInstance.replace(/,/g, ', ');
  const kValue = stringInstance.match('(\\d+)(?!.*\\d)'); // Gets the K value from the string.

  // Regex for undirected graph
  const prettyUndirectedNodes = spacedInstance.match('((?<=\\(\\({)[ -~]+)(?=}, {{)');
  const prettyUndirectedEdges = getEdges(spacedInstance);
  if (prettyUndirectedNodes != null) {
    return ["GRAPH", prettyUndirectedNodes[0], prettyUndirectedEdges[0], kValue[0]];
  }

  // Regex for directed graph. Consequently the edge regex is the same for both directed and undirected. Shouldn't be a problem, but good to note.
  const prettyDirectedNodes = spacedInstance.match('((?<=\\(\\({)[ -~]+)(?=}, {\\()');
  const prettyDirectedEdges = getEdges(spacedInstance);
  if (prettyDirectedNodes != null && (chosenReduceTo == "ARCSET" || chosenReduceTo == "TSP")) {
    return ["GRAPH", prettyDirectedNodes[0], prettyDirectedEdges[0], kValue[0]];
  }

  // Regex for Boolean problems.Getting rid of all the characters we don't need and spliting to get all the literals.
  const literalArray = stringInstance.replaceAll("(", "")
    .replaceAll(")", "|") // Replace with a | for splitting
    .replaceAll("&", "")
    .split("|");
  const uniqueLiterals = new Set(literalArray); // Getting rid of duplicate literals
  var literalString = ""
  uniqueLiterals.forEach((literal) => {
    literalString += literal + ", "
  })
  literalString = literalString.match('(?:.)+(?=, , )'); // Getting rid of trailing commas.

  const clauses = stringInstance.replaceAll("|", " | ").replaceAll("&", ", ")

  // Literals and clauses.
  if (clauses != "" && literalString != "" && (chosenReduceTo == "SAT" || chosenReduceTo == "3SAT")) {
    return ["BOOLEAN", literalString, clauses];
  }

  // Nothing matches return nothing.
  return null;
}

// Parses the edges from the graph
function getEdges(stringInstance) {
  return stringInstance.match('((?<=}, {)[ -~]+)(?=}\\), )');
}
