/**
 * VerifyRowReact.js
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
import { Button } from '@mui/material'

import { requestVerifiedInstance, requestIsCertificateValid } from '../redux';
import PopoverTooltipClick from '../widgets/PopoverTooltipClick';
import { useVerifierInfo } from '../hooks/ProblemProvider';
import ProblemSection from '../widgets/ProblemSection';
import SearchBarExtensible from '../widgets/SearchBarExtensible';

const ACCORDION_FORM_ONE = { placeHolder: "Select verifier" }
const BUTTON = { buttonText: "Verify" }
const CARD = { cardBodyText: "Enter a certificate:", cardHeaderText: "Verify" }
const TOOLTIP = { header: "Problem Verifier", formalDef: "Choose a verifier to see information about it", info: "" }
const THEME = {colors:{grey:"#424242",orange:"#d4441c"}}

export default function VerifyRowReact({
  url,
  problemName,
  problemInstance,
  chosenVerifier,
  setChosenVerifier,
  verifierOptions,
  verifierNameMap,
}) {
  const [certificate, setCertificate] = useState("");
  const [verifyResult, setVerifyResult] = useState("");
  const verifierInfo = useVerifierInfo(url, chosenVerifier);

  useEffect(() => {
    setCertificate("");
    setVerifyResult("");
  }, [chosenVerifier, problemInstance]);

  useEffect(() => {
    if (verifierInfo && verifierInfo.certificate) {
      setCertificate(verifierInfo.certificate);
    }
  }, [verifierInfo]);

  async function handleVerify() {
    setVerifyResult(
      chosenVerifier
        ? await requestVerifiedInstance(url, problemName, chosenVerifier, problemInstance, certificate)
        : "Please select a verifier."
    );
  }

  return (
    <ProblemSection>
      <ProblemSection.Header title={CARD.cardHeaderText}>
        <SearchBarExtensible
          placeholder={ACCORDION_FORM_ONE.placeHolder}
          selected={chosenVerifier}
          onSelect={setChosenVerifier}
          options={verifierOptions}
          optionsMap={verifierNameMap}
          disabled={!problemName}
          disabledMessage={"No verifier available. Please select a problem."}
          extenderButtons={(input) => [
            {
              label: `Add new verifier "${input}"`,
              href: `${url}ProblemTemplate/?problemName=${input}`,
            },
          ]}
        />{" "}
        <PopoverTooltipClick
          toolTip={
            chosenVerifier
              ? {
                  header: verifierInfo.verifierName ?? "",
                  formalDef: verifierInfo.verifierDefinition ?? "",
                  info: verifierInfo.source ?? "",
                }
              : TOOLTIP
          }
        ></PopoverTooltipClick>
      </ProblemSection.Header>

      <ProblemSection.Body>
        {CARD.cardBodyText + " "}
        <FormControl
          as="textarea"
          value={certificate}
          onChange={(event) => setCertificate(event.target.value)}
        ></FormControl>{" "}
        {/**FORM CONTROL 2 (dropdown) */}
        {"Verifier output: " + verifyResult + ""}
        <div className="submitButton">
          <Button
            size="large"
            color="white"
            style={{ backgroundColor: THEME.colors.grey }}
            onClick={handleVerify}
            disabled={!chosenVerifier}
          >
            {BUTTON.buttonText}
          </Button>
        </div>
      </ProblemSection.Body>
    </ProblemSection>
  );
}
