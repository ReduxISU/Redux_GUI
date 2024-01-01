/**
 * AccordionDualInputNestedButton.js
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
import { Accordion, Card, AccordionContext, FormControl, Col, Row, Container } from 'react-bootstrap'
import { Stack, Button, Box } from '@mui/material'
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import PopoverTooltipClick from './PopoverTooltipClick';

import { ProblemContext, useProblemInfo, useReducerInfo } from '../contexts/ProblemProvider'
import ProblemSection from '../widgets/ProblemSection';
import SearchBarSelectReduceToV2 from './SearchBars/SearchBarSelectReduceToV2';
import SearchBarSelectReductionTypeV2 from './SearchBars/SearchBarSelectReductionTypeV2';

function AccordionDualInputNestedButton(props) {

  const { problemName, problemInstance, problemType, chosenReduceTo, setChosenReduceTo, chosenReductionType, setChosenReductionType, reducedInstance, setReducedInstance } = useContext(ProblemContext)

  const [reducedInstanceLocal, setReducedInstanceLocal] = useState();

  const reduceToInfo = useProblemInfo(props.accordion.INPUTURL.url, chosenReduceTo);
  const reducerInfo = useReducerInfo(props.accordion.INPUTURL.url, chosenReductionType);
  const [testData, setTestData] = useState("TEST DATA REDUCE") //keeps track of reduce to text

  const reduceRequest = async () => {

    if(chosenReductionType !== '' && chosenReductionType !== null){
      let reductionPath = chosenReductionType.split("-")
      let i = 0
      let data = problemInstance
      for(i; i<reductionPath.length-1; i++){
        await requestReducedInstance(props.accordion.INPUTURL.url, reductionPath[i], data).then(d=>{
          data = d.reductionTo.instance
        })
      }
      await requestReducedInstance(props.accordion.INPUTURL.url, reductionPath[i], data).then(data => {

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
      <ProblemSection.Header title={props.accordion.CARD.cardHeaderText} titleWidth={"22%"} themeColors={props.accordion.THEME.colors}>
        <SearchBarSelectReduceToV2 placeholder={props.accordion.ACCORDION_FORM_ONE.placeHolder} />{" "}
        <PopoverTooltipClick
          toolTip={
            chosenReduceTo
              ? {
                  header: reduceToInfo.problemName ?? "",
                  formalDef: reduceToInfo.formalDefinition ?? "",
                  info: (reduceToInfo.problemDefinition ?? "") + (reduceToInfo.source ?? ""),
                }
              : props.accordion.TOOLTIP1
          }
        ></PopoverTooltipClick>

        <SearchBarSelectReductionTypeV2 placeholder={props.accordion.ACCORDION_FORM_TWO.placeHolder} />
        <PopoverTooltipClick
          toolTip={
            chosenReductionType
              ? {
                  header: reducerInfo.reductionName ?? "",
                  formalDef: reducerInfo.reductionDefinition ?? "",
                  info: reducerInfo.source ?? "",
                }
              : props.accordion.TOOLTIP2
          }
        ></PopoverTooltipClick>
      </ProblemSection.Header>
      
      <ProblemSection.Body>
        <Card.Text>{createPrettyFormat(reducedInstance, chosenReduceTo)}</Card.Text>

        <div className="submitButton">
          <Button
            size="large"
            color="white"
            style={{ backgroundColor: props.accordion.THEME.colors.grey }}
            onClick={reduceRequest}
            disabled={!chosenReductionType}
          >
            {props.accordion.BUTTON.buttonText}
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



export default AccordionDualInputNestedButton