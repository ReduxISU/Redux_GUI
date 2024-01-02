/**
 * AccordionSingleInputNestedButton.js
 * 
 * This component does the real grunt work of the SolveRowReact component. It uses passed in props to style and provide default text for its objects,
 * uses the global state values for the problem name and instance, sets global state values pertaining to reduction, and has a variety of listeners and API calls.
 * 
 * Essentialy, this is the brains of the SolveRowReact.js component and deals with the GUI's Solve "Row"
 * @author Alex Diviney
 */


import React from 'react'
import { useContext, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import PopoverTooltipClick from './PopoverTooltipClick';
import { Button } from '@mui/material'
import { ProblemContext } from '../contexts/ProblemProvider';
import ProblemSection from '../widgets/ProblemSection';
import SearchBarExtensible from './SearchBarExtensible';

function AccordionSingleInputNestedButton(props) {
  const {
    problemName,
    problemInstance,
    chosenSolver,
    setChosenSolver,
    solvedInstance,
    setSolvedInstance,
    solverOptions,
    solverNameMap,
    problemNameMap,
    chosenReduceTo,
  } = useContext(ProblemContext);
  
  const [toolTip, setToolTip] = useState(props.accordion.TOOLTIP); //Keeps track of tooltip state (left)
  const [disableButton, setActive] = useState(false) // keeps track of button

  
  useEffect(() => {
    setSolvedInstance("");
    // NOTE - Caleb - the following is a temporary solution to allow sat3 to be solved using the clique solver
    // remove first if once this functionality is added for all problems, the else code block was the original
    // functionality
    if(chosenSolver == "CliqueBruteForce - via SipserReduceToCliqueStandard"){
      requestSolverData(props.accordion.INPUTURL.url, "CliqueBruteForce").then(data => {
        setToolTip({ header: data.solverName, formalDef: data.solverDefinition, info: data.source }) //updates TOOLTIP
      }).catch((error) => console.log("TOOLTIP SET ERROR API CALL", error))
    }
    else{
      requestSolverData(props.accordion.INPUTURL.url, chosenSolver).then(data => {
        setToolTip({ header: data.solverName, formalDef: data.solverDefinition, info: data.source }) //updates TOOLTIP
      }).catch((error) => console.log("TOOLTIP SET ERROR API CALL", error))
    }

    if(!chosenSolver){
      setActive(true);

    }else{
      setActive(false);
    }
  }, [chosenSolver])

  const handleSolve = () => {
    if (chosenSolver !== null && chosenSolver !== '') {
      
      // NOTE - Caleb - the following is a temporary solution to allow sat3 to be solved using the clique solver
      // remove first if once this functionality is added for all problems, the else code block was the original
      // functionality
      if(chosenSolver == "CliqueBruteForce - via SipserReduceToCliqueStandard"){
        var parsedInstanceSat = problemInstance.replaceAll('&', '%26');
        var tempUrl = props.accordion.INPUTURL.url + `SipserReduceToCliqueStandard/reduce?problemInstance=${parsedInstanceSat}`

        makeRequest(tempUrl).then(reduction => {
          var parsedInstanceClique = reduction.reductionTo.instance.replaceAll('&', '%26')
          requestSolvedInstance(props.accordion.INPUTURL.url,"CliqueBruteForce",reduction.reductionTo.instance).then(solution => {
            tempUrl = props.accordion.INPUTURL.url + `SipserReduceToCliqueStandard/reverseMappedSolution?problemFrom=${parsedInstanceSat}&problemTo=${parsedInstanceClique}&problemToSolution=${solution}`
            makeRequest(tempUrl).then(mappedSolution => {
              setSolvedInstance(mappedSolution);
            }).catch((error) => console.log("TRANSITIVE SOLVE REQUEST FAILED"))
          }).catch((error) => console.log("TRANSITIVE SOLVE REQUEST FAILED"))
        }).catch((error) => console.log("TRANSITIVE SOLVE REQUEST FAILED"))

      }
      else{
        requestSolvedInstance(props.accordion.INPUTURL.url, chosenSolver, problemInstance).then(data => {
          setSolvedInstance(data);
        }).catch((error) => {console.log("SOLVE REQUEST INSTANCE FAILED")})
      }
    }

 
  }

  return (
    <ProblemSection>
      <ProblemSection.Header title={props.accordion.CARD.cardHeaderText} themeColors={props.accordion.THEME.colors}>
        <SearchBarExtensible
          placeholder={props.accordion.ACCORDION_FORM_ONE.placeHolder}
          selected={chosenSolver}
          onSelect={setChosenSolver}
          options={solverOptions}
          optionsMap={solverNameMap}
          disabled={!problemName}
          disabledMessage={"No solvers available. Please select a problem."}
          extenderButtons={(input) => {
            const extender = (problem) => ({
              label: `Add new ${problemNameMap.get(problem)} solution algorithm "${input}"`,
              href: `${props.url}ProblemTemplate/?problemName=${input}`,
            });
            return !chosenReduceTo ? [extender(problemName)] : [extender(problemName), extender(chosenReduceTo)];
          }}
        />{" "}
        <PopoverTooltipClick toolTip={toolTip}></PopoverTooltipClick>
      </ProblemSection.Header>

      <ProblemSection.Body>
        {props.accordion.CARD.cardBodyText + " " + solvedInstance}
        <div className="submitButton">
          <Button
            size="large"
            color="white"
            style={{ backgroundColor: props.accordion.THEME.colors.grey }}
            onClick={handleSolve}
            disabled={disableButton}
          >
            {props.accordion.BUTTON.buttonText}
          </Button>
        </div>
      </ProblemSection.Body>
    </ProblemSection>
  );
}


async function requestSolverData(url, solverName) {

  return await fetch(url + solverName + '/info').then(resp => {
    if (resp.ok) {
      return resp.json();
    }
  });
}

async function requestSolvedInstance(url, sName, instance) {
  var parsedInstance = instance.replaceAll('&', '%26');

  let totalUrl = url + `${sName}/solve?problemInstance=${parsedInstance}`
  return await fetch(totalUrl).then(resp => {
    if (resp.ok) {
      return resp.json();
    }
  })
}


//NOTE - Caleb - temporary fix to allow sat3 to be solved with clique, should be 
//removed once functionality is implemented for all problems.
async function makeRequest(url){
  return await fetch(url).then(resp => {
    if (resp.ok) {
      return resp.json()
    }
  })
}



export default AccordionSingleInputNestedButton