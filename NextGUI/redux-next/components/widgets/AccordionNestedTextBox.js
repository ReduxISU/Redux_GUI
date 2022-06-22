/**
 * AccordionNestedTextBox.js
 * 
 * This component does the real grunt work of the ProblemRow component. It uses passed in props to style and provide default text for its objects,
 * uses and updates the global state for the problem and problem instance, and has a variety of listeners and API calls.
 * 
 * Essentialy, this is the brains of the ProblemRowReact.js component and deals with the GUI's Problem "Row"
 * @author Alex Diviney
 */

import React, { useEffect, useState } from 'react'
import { useContext, useMemo } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css'
import { Accordion, Card, AccordionContext, FormControl, Row, Col } from 'react-bootstrap'
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import PopoverTooltipClick from './PopoverTooltipClick';
import SearchBarProblemType from './SearchBars/SearchBarProblemType';
import { ProblemContext } from '../contexts/ProblemProvider'
import { Stack, Button, Box } from '@mui/material'

/**
 * This represents the button that triggers the accordion component opening or closing
 * 
 * @param {*} param0 parameters change handler
 * @returns A Dropdown toggle component. 
 */
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
/**
 *  Creates an accordion that has a nested autocomplete search bar, as well as an editable problem instance textbox
 * 
 * @param {*} props passed down props from ProblemRowReact. Note that Technically, these props could be passed down from anywhere
 * @returns 
 */
function AccordionNestedTextBox(props) {

  //console.log(props)
  const {
    problemName,
    problemType,
    problemInstance,
    setProblemName,
    setProblemInstance,
    makeApiCall,
    setProblemJson
  } = useContext(ProblemContext) //We are giving this row access to basically all global state. This will allow us to reset a page on problem change.

  const [testName, setTestName] = useState('DEFAULT ACCORDION NAME') //This may only actually cause a re-render event. But removing it means no rerender.
  const [toolTip, setToolTip] = useState(props.accordion.TOOLTIP);


  const [problemLocalInstance, setProblemLocalInstance] = useState("DEFAULT Instance")
  const [seconds, setSeconds] = useState(1);
  const [timerIsActive, setTimerActive] = useState(false);


  //Updates state on problemName changing.
  useEffect(() => {
    let timer = null;
    if (timerIsActive) {
      timer = setInterval(() => {
        setSeconds(seconds + 1);
        console.log("TIMER")
        console.log(seconds);
        if (seconds % 2 === 0) {
          console.log("Two HIT, Instance updating globally"
          )
          console.log(problemLocalInstance);
          const cleanedInstance = problemLocalInstance.replaceAll(' ', '')
          console.log(cleanedInstance);
          setProblemInstance(cleanedInstance);
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

  //Updates the problem instance on problem name change to be the default instance of the new problem. also updates tooltips with that information.
  useEffect(() => {
    try {
      //console.log(props.accordion.INPUTURL.url)
      requestProblemData(props.accordion.INPUTURL.url, problemName, problemType).then(data => {
        if (!(typeof data === "undefined")) {
          //console.log(data);
          //console.log(data.defaultInstance)
          setProblemLocalInstance(data.defaultInstance);
          setProblemInstance(data.defaultInstance);
          setToolTip({ header: problemName, formalDef: data.formalDefinition, info: data.problemDefinition + data.source })
        }

      }).catch(console.log("Problem not defined"));
    }
    catch {
      console.log("problem name is empty")
    }
  }, [problemName])

  //Local state that handles problem instance change without triggering mass refreshing.
  const handleChangeInstance = (event) => {
    try {
    }
    catch (error) {
      console.log("Couldn't clean problem instance: ", error);
    }
    setProblemLocalInstance(event.target.value)
    if (!timerIsActive) {
      setTimerActive(true);
    }
  }

  // useEffect(() => {
  //   window.location.reload(false);
  // },[testName])


  return (
    <div>
      <Accordion className="accordion" defaultActiveKey="1">
        <Card>
          <Card.Header>

            <Stack direction="horizontal" justifyContent="right" gap={2}>
              <Box
              sx={{width:'10%'}}
              >
                {props.accordion.CARD.cardHeaderText}
                </Box>
              {/**FORM CONTROL 1 */}
              <SearchBarProblemType setTestName={setTestName} placeholder={props.accordion.ACCORDION_FORM_ONE.placeHolder} url={props.accordion.INPUTURL.url}></SearchBarProblemType>

              <PopoverTooltipClick toolTip={toolTip}></PopoverTooltipClick>
              <ContextAwareToggle eventKey="0" colors={props.accordion.THEME.colors}>▼</ContextAwareToggle>

            </Stack>

          </Card.Header>

          <Accordion.Collapse eventKey="0">
            <Card.Body>
              <Stack direction="horizontal" gap={1}>
                {props.accordion.CARD.cardBodyText}
                <FormControl as="textarea" value={problemLocalInstance} onChange={handleChangeInstance} ></FormControl> {/**FORM CONTROL 2 (dropdown) */}
              </Stack>
            </Card.Body>
          </Accordion.Collapse>
        </Card>

      </Accordion>

    </div>
  );
}


/**
 * 
 * @param {*} url the base url of the application 
 * @param {*} name The name of the selected problem
 * @returns A promise from the passed in url. 
 */
async function requestProblemData(url, name) {
  console.log(name)
  return await fetch(url + name + "Generic").then(resp => {
    if (resp.ok) {
      return resp.json()
    }
  });

}



export default AccordionNestedTextBox