/**
 * SolveRowReact.js
 * 
 * This component does the real grunt work of the SolveRowReact component. It uses passed in props to style and provide default text for its objects,
 * uses the global state values for the problem name and instance, sets global state values pertaining to reduction, and has a variety of listeners and API calls.
 * 
 * Essentialy, this is the brains of the SolveRowReact.js component and deals with the GUI's Solve "Row"
 * @author Alex Diviney
 */


import React from 'react'
import { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import { Button } from '@mui/material'

import PopoverTooltipClick from '../widgets/PopoverTooltipClick';
import { ProblemContext } from '../contexts/ProblemProvider';
import { useSolverInfo } from '../hooks/ProblemProvider';
import ProblemSection from '../widgets/ProblemSection';
import SearchBarExtensible from '../widgets/SearchBarExtensible';

const ACCORDION_FORM_ONE = { placeHolder: "Select Solver" }
const BUTTON = { buttonText: "Solve" }
const CARD = { cardBodyText: "Solution:", cardHeaderText: "Solve" }
const TOOLTIP = { header: "Solver Information", formalDef: "Choose a type of solver to see information about it", info: "" }
const THEME = {colors:{grey:"#424242",orange:"#d4441c"}}

export default function SolveRowReact(props) {
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
  
  const solverInfo = useSolverInfo(props.url, chosenSolver);

  const handleSolve = () => {
    if (chosenSolver !== null && chosenSolver !== '') {
      
      // NOTE - Caleb - the following is a temporary solution to allow sat3 to be solved using the clique solver
      // remove first if once this functionality is added for all problems, the else code block was the original
      // functionality
      if(chosenSolver == "CliqueBruteForce - via SipserReduceToCliqueStandard"){
        var parsedInstanceSat = problemInstance.replaceAll('&', '%26');
        var tempUrl = props.url + `SipserReduceToCliqueStandard/reduce?problemInstance=${parsedInstanceSat}`

        makeRequest(tempUrl).then(reduction => {
          var parsedInstanceClique = reduction.reductionTo.instance.replaceAll('&', '%26')
          requestSolvedInstance(props.url,"CliqueBruteForce",reduction.reductionTo.instance).then(solution => {
            tempUrl = props.url + `SipserReduceToCliqueStandard/reverseMappedSolution?problemFrom=${parsedInstanceSat}&problemTo=${parsedInstanceClique}&problemToSolution=${solution}`
            makeRequest(tempUrl).then(mappedSolution => {
              setSolvedInstance(mappedSolution);
            }).catch((error) => console.log("TRANSITIVE SOLVE REQUEST FAILED"))
          }).catch((error) => console.log("TRANSITIVE SOLVE REQUEST FAILED"))
        }).catch((error) => console.log("TRANSITIVE SOLVE REQUEST FAILED"))

      }
      else{
        requestSolvedInstance(props.url, chosenSolver, problemInstance).then(data => {
          setSolvedInstance(data);
        }).catch((error) => {console.log("SOLVE REQUEST INSTANCE FAILED")})
      }
    }

 
  }

  return (
    <ProblemSection>
      <ProblemSection.Header title={CARD.cardHeaderText}>
        <SearchBarExtensible
          placeholder={ACCORDION_FORM_ONE.placeHolder}
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
        <PopoverTooltipClick
          toolTip={
            chosenSolver
              ? {
                  header: solverInfo.solverName ?? "",
                  formalDef: solverInfo.solverDefinition ?? "",
                  info: solverInfo.source ?? "",
                }
              : TOOLTIP
          }
        ></PopoverTooltipClick>
      </ProblemSection.Header>

      <ProblemSection.Body>
        {CARD.cardBodyText + " " + solvedInstance}
        <div className="submitButton">
          <Button
            size="large"
            color="white"
            style={{ backgroundColor: THEME.colors.grey }}
            onClick={handleSolve}
            disabled={!chosenSolver}
          >
            {BUTTON.buttonText}
          </Button>
        </div>
      </ProblemSection.Body>
    </ProblemSection>
  );
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
