/**
 * ProblemRowReact.js
 * 
 * This component passes down some styling information for popups and default text, and then passes it down to the
 * AccordionNestedTextbox component which deals with most of the actual logic of the Redux Problem Row. 
 * Note that the generic name of "AccordionNestedTextbox" does not actually reflect in the structure of AccordionNestedTextBox.js, and 
 * it might be renamed in the future to reflect the tightly coupled nature of the component to the actual application. (Further information Available in that file.)
 * 
 * @author Alex Diviney
 */


import React, { useContext } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import AccordionNestedTextBox from '../widgets/AccordionNestedTextBox'
import ProblemProvider, { ProblemContext } from '../contexts/ProblemProvider';
import { Component,useEffect } from 'react';


const ACCORDION_FORM_ONE = { placeHolder: "Select problem" }
const ACCORDION_FORM_TWO = { placeHolder: "default instance" }
var CARD = { cardBodyText: "Instance", cardHeaderText: "Problem",problemInstance:"" }
const TOOLTIP = { header: "Problem Information", formalDef: "Choose a problem to see information about it", info: "", credit: "" }

function ProblemRowReact(props) {
    const INPUTURL = { url: props.reduxBaseUrl }
    const THEME = {colors:{grey:"#424242",orange:"#d4441c"}}
    const ACCORDION = { ACCORDION_FORM_ONE, ACCORDION_FORM_TWO, CARD, TOOLTIP, INPUTURL,THEME }



    return (
        <>
        <AccordionNestedTextBox accordion={ACCORDION}></AccordionNestedTextBox>
        </>
    )
}


    
    
export default ProblemRowReact