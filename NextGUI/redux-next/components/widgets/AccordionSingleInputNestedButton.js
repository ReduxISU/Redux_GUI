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
import { Accordion, Card, AccordionContext, FormControl } from 'react-bootstrap'
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import PopoverTooltipClick from './PopoverTooltipClick';
import { Stack, Button, Box } from '@mui/material'
import { ProblemContext } from '../contexts/ProblemProvider';
import SearchBarSelectSolverV2 from './SearchBars/SearchBarSelectSolverV2';


// import FormControl from '../components/FormControl'


function ContextAwareToggle({ children, eventKey, callback, colors }) {
  const { activeEventKey } = useContext(AccordionContext);


  const decoratedOnClick = useAccordionButton(
    eventKey,
    () => callback && callback(eventKey),
  );

  const isCurrentEventKey = activeEventKey === eventKey;
  return (
    <Button
      sx={{ height: 54, width: 64 }}
      color='white'
      className="float-end"
      type="button"
      style={{ backgroundColor: isCurrentEventKey ? colors.orange : colors.grey }}
      onClick={decoratedOnClick}
    >
      {children}
    </Button>
  );
}

function AccordionSingleInputNestedButton(props) {
  const { problemName, problemInstance, problemType, chosenSolver, setChosenSolver, solvedInstance, setSolvedInstance } = useContext(ProblemContext)
  const [toolTip, setToolTip] = useState(props.accordion.TOOLTIP); //Keeps track of tooltip state (left)
  const [disableButton, setActive] = useState(false) // keeps track of button

  
  var SOLVEROPTIONSURL = props.accordion.INPUTURL.url + 'Navigation/Problem_SolversRefactor/' + '?chosenProblem=' + problemName + '&problemType=' + problemType
  useEffect(() => {
    setSolvedInstance("");
    SOLVEROPTIONSURL = props.accordion.INPUTURL.url + 'Navigation/Problem_SolversRefactor/' + '?chosenProblem=' + problemName + '&problemType=' + problemType
    // NOTE - Caleb - the following is a temporary solution to allow sat3 to be solved using the clique solver
    // remove first if once this functionality is added for all problems, the else code block was the original
    // functionality
    if(chosenSolver == "CliqueBruteForce - via SipserReduceToCliqueStandard"){
      requestSolverData(props.accordion.INPUTURL.url, "CliqueBruteForce").then(data => {
        setToolTip({ header: data.solverName, formalDef: data.solverDefinition, info: data.source, credit: "This was contributed by: " + data.contributors.join(", ") }) //updates TOOLTIP
      }).catch((error) => console.log("TOOLTIP SET ERROR API CALL", error))
    }
    else{
      requestSolverData(props.accordion.INPUTURL.url, chosenSolver).then(data => {
        setToolTip({ header: data.solverName, formalDef: data.solverDefinition, info: data.source, credit: "This was contributed by: " + data.contributors.join(", ") }) //updates TOOLTIP
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
    <div>
      <Accordion className="accordion" defaultActiveKey="1">

        <Card>
          <Card.Header>
            <Stack direction="horizontal" gap={2}>
              <Box sx={{ width: '10%' }}>
                {props.accordion.CARD.cardHeaderText}
              </Box>

              <SearchBarSelectSolverV2
                placeholder={props.accordion.ACCORDION_FORM_ONE.placeHolder}
                url={SOLVEROPTIONSURL}
                setData={setChosenSolver}
                data={problemName}
              /> {/**Search bar left (form control 1) */}

              <PopoverTooltipClick toolTip={toolTip}></PopoverTooltipClick>

              <ContextAwareToggle eventKey="0" colors={props.accordion.THEME.colors}>▼</ContextAwareToggle>
            </Stack>
          </Card.Header>
          <Accordion.Collapse eventKey="0">
            <Card.Body>

              {props.accordion.CARD.cardBodyText + " " + solvedInstance}
              <div className="submitButton">
                <Button
                  size='large'
                  color='white'
                  style={{ backgroundColor: props.accordion.THEME.colors.grey }}
                  onClick={handleSolve}
                  disabled= {disableButton}
                >{props.accordion.BUTTON.buttonText}</Button>
              </div>
            </Card.Body>

          </Accordion.Collapse>

        </Card>

      </Accordion>

    </div>
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