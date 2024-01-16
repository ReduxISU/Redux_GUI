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

import { ProblemContext } from '../contexts/ProblemProvider'
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

export default function ReduceToRowReact(props) {

  const {
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
  } = useContext(ProblemContext);

  const [reducedInstanceLocal, setReducedInstanceLocal] = useState();

  const reduceToInfo = useProblemInfo(props.url, chosenReduceTo);
  const reducerInfo = useReducerInfo(props.url, chosenReductionType);

  const reduceRequest = async () => {

    if(chosenReductionType !== '' && chosenReductionType !== null){
      let reductionPath = chosenReductionType.split("-")
      let i = 0
      let data = problemInstance
      for(i; i<reductionPath.length-1; i++){
        await requestReducedInstance(props.url, reductionPath[i], data).then(d=>{
          data = d.reductionTo.instance
        })
      }
      await requestReducedInstance(props.url, reductionPath[i], data).then(data => {

        setReducedInstance(data.reductionTo.instance);
        setReducedInstanceLocal(data.reductionTo.instance);
        setReducedInstanceLocal(problemInstance);
        
        //var reducedInstance = data.reductionTo.instance;
        // Gets the list of nodes in the raw expression
        //const prettyFormat = createPrettyFormat(reducedInstance);

      }).catch((error) => console.log("REDUCTION FAILED, one or more properties was invalid"))
    }

  }

  // Automatically reduces the instance one the reduction type is chosen. 
  // This makes it so it's less input from the user but also makes the "Reduce" button effectly useless. 
  useEffect(() => {
    reduceRequest();
  }, [chosenReductionType, problemInstance]);
  
  useEffect(() => {
    setReducedInstance('');
  }, [chosenReductionType, chosenReduceTo])



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
          disabledMessage={"No reductions available. Please select a problem."}
          extenderButtons={(input) => [
            {
              label: `Add new problem "${input}"`,
              href: `${props.url}ProblemTemplate/?problemName=${input}`,
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
              href: `${props.url}ProblemTemplate/?problemName=${input}`,
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
        <Card.Text>{createPrettyFormat(reducedInstance, chosenReduceTo)}</Card.Text>

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

// Returns a "pretty" version of the reduction string if possible.
function createPrettyFormat(rawInstance, chosenReduceTo){
  if (rawInstance === undefined){
    return null;
  }

    const prettyInstace = checkProblemType(rawInstance, chosenReduceTo);
    // Just turning the uppercase name the the chosen reduction to lowercase with a captial first letter(CLIQUE --> Clique)
    var reductionToName = chosenReduceTo.toLowerCase();
    var lowercaseName = reductionToName.charAt(0).toUpperCase() + reductionToName.slice(1);


  // Checks if this is actually a node / edge format. If not, show the original form.
  if (prettyInstace === null){
    return (
      <>{rawInstance}</>
    );
  }
  if (prettyInstace[0] === "GRAPH"){
    return (
      <>
        <p style={{fontSize: 20}}>
          <b>Reduced {lowercaseName} Instance:</b>
        </p>
        
        <p>{rawInstance}</p>

        <p><b>Nodes:</b></p>
        <p>{prettyInstace[1]}</p>
        
        <p><b>Edges:</b></p>
        <p /*style={{wordBreak: 'breakWord', color: 'red'}}> */>
          {prettyInstace[2]}</p>
        <p><b>K value:</b> {prettyInstace[3]}</p>
      </>
    );}
    

    if(prettyInstace[0] === "BOOLEAN"){
      return (
        <>
          <p><b>Literals:</b></p>
          <p>{prettyInstace[1]}</p>
          <p><b>Clauses:</b></p>
          <p>{prettyInstace[2]}</p>  
          <p><b>Original form:</b></p>
          <p>{rawInstance}</p>
        </>
      );}  

      else{
        return (
          <>{rawInstance}</>
        );}
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

export async function requestReducedInstance(url, reductionName, reduceFrom) {
  var parsedInstance = reduceFrom.replaceAll('&', '%26');

  return await fetch(url + reductionName + '/reduce?' + "problemInstance=" + parsedInstance).then(resp => {
    if (resp.ok) {

      return resp.json();
    }
  })
}
