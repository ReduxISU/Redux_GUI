
/**
 * VerifyRowReact.js
 * This component passes down some styling information for popups and default text, and then passes it down to the
 * AccordionVerifier component which deals with most of the actual logic of the Redux Verification Row. 
 * 
 * Note that the name "AccordionVerifier" is a description of a component that shows the tightly coupled nature of the component to its actual usage in the application. 
 * ie. the lack of generality of it. This is not yet reflected in the names of the other accordion components, but they will likely change to match this naming convention.
 * @author Alex Diviney
 */

import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import AccordionVerifier  from '../widgets/AccordionVerifier'


function VerifyRowReact(props) { 

    const ACCORDION_FORM_ONE = { placeHolder: "Select verifier" }
    const ACCORDION_FORM_TWO = { placeHolder: "PlaceHolder Text Two" }
    const BUTTON = { buttonText: "Verify" }
    const CARD = { cardBodyText: "Enter a certificate:", cardHeaderText: "Verify" }
    const INPUTURL = { url: props.reduxBaseUrl }
    const TOOLTIP = { header: "Problem Verifier", formalDef: "Choose a verifier to see information about it", info: "", credit: "" }
    const THEME = {colors:{grey:"#424242",orange:"#d4441c"}}


    const ACCORDION = {ACCORDION_FORM_ONE,ACCORDION_FORM_TWO,CARD,BUTTON,TOOLTIP,INPUTURL,THEME}
    return (
        <AccordionVerifier accordion={ACCORDION}></AccordionVerifier>
    )


}

export default VerifyRowReact