/**
 * AccordionDualInputNestedButton.js
 * 
 * This component does the real grunt work of the VerifyRow component. It uses passed in props to style and provide default text for its objects,
 * uses the global state values for the problem name and instance, sets global state values pertaining to reduction, and has a variety of listeners and API calls.
 * 
 * Essentialy, this is the brains of the VerifyRowReact.js component and deals with the GUI's Reduce "Row"
 * @author Alex Diviney
 */

import React from 'react'
import { useContext, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import { FormControl } from 'react-bootstrap'
import PopoverTooltipClick from './PopoverTooltipClick';
import { Button } from '@mui/material'
import { ProblemContext, useVerifierInfo } from '../contexts/ProblemProvider';
import SearchBarSelectVerifierV2 from './SearchBars/SearchBarSelectVerifierV2';
import ProblemSection from '../widgets/ProblemSection';

function AccordionVerifier(props) {

  const [verifiedInstance, setVerifiedInstance] = useState("");
  const [verifyResult, setVerifyResult] = useState("");

  const { problemName, problemInstance, problemType, chosenVerifier, setChosenVerifier, solvedInstance } = useContext(ProblemContext)

  const verifierInfo = useVerifierInfo(props.accordion.INPUTURL.url, chosenVerifier);

  useEffect(() => {
    setVerifiedInstance("");
    setVerifyResult("");
  }, [chosenVerifier]);

  useEffect(() => {
    if (verifierInfo && verifierInfo.certificate) {
      setVerifiedInstance(verifierInfo.certificate)
    }
  }, [verifierInfo]);



  // useEffect(() => { //This updated the cerificate text with a solution value when a user hits the solution button in SolvedRow
  //   setVerifiedInstance(solvedInstance)
  // }, [solvedInstance])


  const handleVerify = () => {
    const bool = parseUserInput(verifiedInstance)
    if (chosenVerifier !== null && chosenVerifier !== '' && bool == true) {
      requestVerifiedInstance(props.accordion.INPUTURL.url, chosenVerifier, problemInstance, verifiedInstance).then(data => {
        setVerifyResult(data);
      })
    }
    else{
      setVerifyResult('invalid input')
    }

  }

  //Local state that handles problem instance change without triggering mass refreshing.
  const handleChangeCertificate = (event) => {
    setVerifiedInstance(event.target.value)
  }

// Input validation
function parseUserInput(userInput){
  var validUserInput = true;
  var cleanInput = userInput.replace(new RegExp(/[( )]/g), '')// Strips spaces and ()
  cleanInput = cleanInput.replaceAll(':', '=');
  var regexFormat = /[^,=:!{}\w]/ // Checks for special characters not including ,=:!{}
  if (regexFormat.test(cleanInput) == true){ // Invalid characters found, warn user.
    return false
  }

  else{
    if(problemName == "SAT" || problemName == "SAT3"){
    var clauses = cleanInput.split(',')
    const regex = /[^!\w]/ // Only allow alphanumber and !
    const notBooleanRegex = /[^true$|^True$|^t$|^T$|^false$|^False$|^F$|^f$]/
    clauses.forEach(clause => {
      const singleClause = clause.split('=')
      
      if(singleClause.length !== 2 || regex.test(singleClause[0] == true)){ // No boolean assigned to variable.
        validUserInput = false
        return false
      }

      if(notBooleanRegex.test(singleClause[1] == true)){ // boolean is not in the form True/true/T/F...
        validUserInput = false
        return false
      }
      else{ // Replace True/true/t with T and False/false/f with F
        singleClause[1] = singleClause[1].replace(new RegExp(/^false$|^False$|^f$/g), 'F')
        singleClause[1] = singleClause[1].replace(new RegExp(/^True$|^true$|^t$/g), 'T')
        validUserInput = true // valid input
      }
    });
  }
    
     return validUserInput
  }

}

  return (
    <ProblemSection>
      <ProblemSection.Header title={props.accordion.CARD.cardHeaderText} themeColors={props.accordion.THEME.colors}>
        <SearchBarSelectVerifierV2 placeholder={props.accordion.ACCORDION_FORM_ONE.placeHolder} />{" "}
        <PopoverTooltipClick
          toolTip={
            chosenVerifier
              ? {
                  header: verifierInfo.verifierName ?? "",
                  formalDef: verifierInfo.verifierDefinition ?? "",
                  info: verifierInfo.source ?? "",
                }
              : props.accordion.TOOLTIP
          }
        ></PopoverTooltipClick>
      </ProblemSection.Header>

      <ProblemSection.Body>
        {props.accordion.CARD.cardBodyText + " "}
        <FormControl as="textarea" value={verifiedInstance} onChange={handleChangeCertificate}></FormControl>{" "}
        {/**FORM CONTROL 2 (dropdown) */}
        {"Verifier output: " + verifyResult + ""}
        <div className="submitButton">
          <Button
            size="large"
            color="white"
            style={{ backgroundColor: props.accordion.THEME.colors.grey }}
            onClick={handleVerify}
            disabled={!chosenVerifier}
          >
            {props.accordion.BUTTON.buttonText}
          </Button>
        </div>
      </ProblemSection.Body>
    </ProblemSection>
  );

}

async function requestVerifiedInstance(url, vName, instance, cert) {
  var parsedInstance = instance.replaceAll('&', '%26');

  const fetchUrl = url + vName + `/verify?problemInstance=${parsedInstance}&certificate=${cert}`
  return await fetch(fetchUrl).then(resp => {
    if (resp.ok) {
      return resp.json();
    }
  });
}

export default AccordionVerifier