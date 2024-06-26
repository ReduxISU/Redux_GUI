/**
 * ProblemRowReact.js
 * 
 * This component does the real grunt work of the ProblemRow component. It uses passed in props to style and provide default text for its objects,
 * uses and updates the global state for the problem and problem instance, and has a variety of listeners and API calls.
 * 
 * Essentialy, this is the brains of the ProblemRowReact.js component and deals with the GUI's Problem "Row"
 * @author Alex Diviney
 */

import React, { useEffect, useState } from 'react'
import { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import { Stack } from '@mui/material'
import TextField from '@mui/material/TextField';

import PopoverTooltipClick from '../widgets/PopoverTooltipClick';
import { useProblemInfo } from '../hooks/ProblemProvider'
import ProblemInstanceParser from '../../Tools/ProblemInstanceParser';
import ProblemSection from '../widgets/ProblemSection';
import SearchBarExtensible from '../widgets/SearchBarExtensible';

const ACCORDION_FORM_ONE = { placeHolder: "Select problem" }
const ACCORDION_FORM_TWO = { placeHolder: "default instance" }
var CARD = { cardBodyText: "Instance", cardHeaderText: "Problem",problemInstance:"" }
const TOOLTIP = { header: "Problem Information", formalDef: "Choose a problem to see information about it", info: "", credit: "" }

/**
 *  Creates an accordion that has a nested autocomplete search bar, as well as an editable problem instance textbox
 */
export default function ProblemRowReact({ url, problemName, setProblemName, problemNameMap, setProblemInstance }) {
  const problemInfo = useProblemInfo(url, problemName);
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
    const problem = problemName ? problemInfo : {};
    setProblemLocalInstance(problem.defaultInstance ?? "");
    setProblemInstance(problem.defaultInstance ?? "");
  }, [problemName, problemInfo])

  //Local state that handles problem instance change without triggering mass refreshing.
  const handleChangeInstance = (event) => {
    try {
    }
    catch (error) {console.log("Couldn't clean problem instance: ", error);}
    setProblemLocalInstance(event.target.value)
    if (!instanceParsed.test){
      defaultInstanceParsed.exampleStr = "";
    }
    if (!timerIsActive) {
      setTimerActive(true);
    }
  }

  return (
    <ProblemSection defaultCollapsed={false}>
      <ProblemSection.Header title={CARD.cardHeaderText}>
        <SearchBarExtensible
          placeholder={ACCORDION_FORM_ONE.placeHolder}
          selected={problemName}
          onSelect={setProblemName}
          options={[...problemNameMap.keys()]}
          optionsMap={problemNameMap}
          extenderButtons={(input) => [
            {
              label: `Add new problem "${input}"`,
              href: `${url}ProblemTemplate/?problemName=${input}`,
            },
          ]}
        />{" "}
        <PopoverTooltipClick
          toolTip={
            problemName
              ? {
                  header: problemInfo.problemName ?? "",
                  formalDef: problemInfo.formalDefinition ?? "",
                  info: (problemInfo.problemDefinition ?? "") + (problemInfo.source ?? ""),
                }
              : TOOLTIP
          }
        ></PopoverTooltipClick>
      </ProblemSection.Header>

      <ProblemSection.Body>
        <Stack direction="row" gap={1}>
          {CARD.cardBodyText}
          {/* <FormControl as="textarea" value={problemLocalInstance} onChange={handleChangeInstance} ></FormControl> *FORM CONTROL 2 (dropdown) */}
          <TextField
            error={!instanceParsed.test}
            id="outlined-error"
            label={!instanceParsed.test ? "Incorrect Format" : "Problem Instance"}
            sx={{ width: "100%" }}
            value={problemLocalInstance}
            onChange={handleChangeInstance}
            helperText={!instanceParsed.test ? "Problem failed? Try: " + instanceParsed.exampleStr : ""} // Only displays the "Incorrect format" stuff when the input is activly wrong
          ></TextField>
        </Stack>
      </ProblemSection.Body>
    </ProblemSection>
  );
}
