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
import { Button } from '@mui/material'

import { requestReducedInstanceFromPath } from '../redux'
import { useProblemInfo, useReducerInfo } from '../hooks/ProblemProvider'
import PopoverTooltipClick from '../widgets/PopoverTooltipClick';
import ProblemSection from '../widgets/ProblemSection';
import SearchBarExtensible from '../widgets/SearchBarExtensible';

const ACCORDION_FORM_ONE = { placeHolder: "Select Problem To Reduce To", problemName: "ACCORDION FORM ONE PROBLEM NAME" }
const ACCORDION_FORM_TWO = { placeHolder: "Select Reduction" }

const BUTTON = { buttonText: "Reduce" }
const CARD = { cardBodyText: "Reduce To:", cardHeaderText: "Reduce" }
const TOOLTIP1 = { header: "Reduce To Problem", formalDef: "Choose a problem to reduce your original problem to to see information about it", info: "" }
const TOOLTIP2 = { header: "Reduction Type", formalDef: "Choose a type of reduction to see information about it", info: "" }
const THEME = { colors: { grey: "#424242", orange: "#d4441c", white: "#ffffff" } }

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
}) {
  const reduceToInfo = useProblemInfo(url, chosenReduceTo);
  const reducerInfo = useReducerInfo(url, chosenReductionType);

  async function reduceRequest() {
    setReducedInstance(
      chosenReductionType && problemInstance
        ? (await requestReducedInstanceFromPath(url, chosenReductionType, problemInstance)) ?? ""
        : ""
    );
  }

  return (
    <ProblemSection defaultCollapsed={false}>
      <ProblemSection.Header title={CARD.cardHeaderText} titleWidth={"22%"}>
      <SearchBarExtensible
          placeholder={ACCORDION_FORM_ONE.placeHolder}
          selected={chosenReduceTo}
          onSelect={setChosenReduceTo}
          options={reduceToOptions}
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
                  formalDef: reduceToInfo.formalDefinition ?? "",
                  info: (reduceToInfo.problemDefinition ?? "") + (reduceToInfo.source ?? ""),
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
              href: `${url}ProblemTemplate/?problemName=${input}`,
            },
          ]}
        />
        <PopoverTooltipClick
          toolTip={
            chosenReductionType
              ? {
                  header: reducerInfo.reductionName ?? "",
                  formalDef: reducerInfo.reductionDefinition ?? "",
                  info: reducerInfo.source ?? "",
                }
              : TOOLTIP2
          }
        ></PopoverTooltipClick>
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
            onClick={reduceRequest}
            disabled={!chosenReductionType}
          >
            {BUTTON.buttonText}
          </Button>
        </div>
      </ProblemSection.Body>
    </ProblemSection>
  );
}

function ReduceInfo({ instance, chosenReduceTo, problemName }) {
  const prettyInstance = checkProblemType(instance, chosenReduceTo);

  // Checks if this is actually a node / edge format. If not, show the original form.
  if (!prettyInstance) {
    return <Card.Text>{instance}</Card.Text>;
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

  return <Card.Text>{instance}</Card.Text>;
}

function ReduceInfoBool({ instance, literals, clauses }) {
  return (
    <>
      <p>
        <b>Literals:</b>
      </p>
      <p>{literals}</p>
      <p>
        <b>Clauses:</b>
      </p>
      <p>{clauses}</p>
      <p>
        <b>Original form:</b>
      </p>
      <p>{instance}</p>
    </>
  );
}

function ReduceInfoGraph({ instance, nodes, edges, k_value, problemName }) {
  return (
    <>
      <p style={{ fontSize: 20 }}>
        <b>Reduced {problemName} Instance:</b>
      </p>

      <p>{instance}</p>

      <p>
        <b>Nodes:</b>
      </p>
      <p>{nodes}</p>

      <p>
        <b>Edges:</b>
      </p>
      <p /*style={{wordBreak: 'breakWord', color: 'red'}}> */>{edges}</p>
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
function checkProblemType(stringInstance, chosenReduceTo){
  const spacedInstance = stringInstance.replace(/,/g, ', ');
  const kValue = stringInstance.match('(\\d+)(?!.*\\d)'); // Gets the K value from the string.

  // Regex for undirected graph
  const prettyUndirectedNodes = spacedInstance.match('((?<=\\(\\({)[ -~]+)(?=}, {{)');
  const prettyUndirectedEdges = getEdges(spacedInstance);
  if (prettyUndirectedNodes != null){
    return ["GRAPH", prettyUndirectedNodes[0], prettyUndirectedEdges[0], kValue[0]];
  }

  // Regex for directed graph. Consequently the edge regex is the same for both directed and undirected. Shouldn't be a problem, but good to note.
  const prettyDirectedNodes = spacedInstance.match('((?<=\\(\\({)[ -~]+)(?=}, {\\()');
  const prettyDirectedEdges = getEdges(spacedInstance);
  if(prettyDirectedNodes != null && (chosenReduceTo == "ARCSET" || chosenReduceTo == "TSP")){
    return ["GRAPH", prettyDirectedNodes[0], prettyDirectedEdges[0], kValue[0]];
  }

  // Regex for Boolean problems.Getting rid of all the characters we don't need and spliting to get all the literals.
  const literalArray = stringInstance.replaceAll("(", "")
                                      .replaceAll(")", "|") // Replace with a | for splitting
                                      .replaceAll("&", "")
                                      .split("|");
  const uniqueLiterals = new Set (literalArray); // Getting rid of duplicate literals
  var literalString = ""
  uniqueLiterals.forEach((literal)=>{
    literalString += literal + ", "
  })
  literalString = literalString.match('(?:.)+(?=, , )'); // Getting rid of trailing commas.

  const clauses = stringInstance.replaceAll("|", " | ").replaceAll("&", ", ")

  // Literals and clauses.
  if(clauses != "" && literalString != "" && (chosenReduceTo == "SAT" || chosenReduceTo == "3SAT")){
    return ["BOOLEAN", literalString, clauses];
  }

  // Nothing matches return nothing.
  return null;
}

// Parses the edges from the graph
function getEdges(stringInstance){
  return stringInstance.match('((?<=}, {)[ -~]+)(?=}\\), )');
}
