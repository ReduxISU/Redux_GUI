
/**
 * SolveRowReact.js
 * This component passes down some styling information for popups and default text, and then passes it down to the
 * AccordionSingleInputNestedButton component which deals with most of the actual logic of the Redux Solution Row. 
 * @author Alex Diviney
 */
import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import AccordionSingleInputNestedButton from '../widgets/AccordionSingleInputNestedButton'


function SolveRowReact(props) { 
    const ACCORDION_FORM_ONE = { placeHolder: "Select Solver" }
    const BUTTON = { buttonText: "Solve" }
    const CARD = { cardBodyText: "Solution:", cardHeaderText: "Solve" }
    const TOOLTIP = { header: "Solver Information", formalDef: "Choose a type of solver to see information about it", info: "", credit: "" }
    const INPUTURL = { url: props.reduxBaseUrl }
    const THEME = {colors:{grey:"#424242",orange:"#d4441c"}}


    const ACCORDION = {ACCORDION_FORM_ONE,CARD,BUTTON,TOOLTIP,INPUTURL,THEME}
    return (
        <AccordionSingleInputNestedButton accordion={ACCORDION}></AccordionSingleInputNestedButton>
        
    )


}

export default SolveRowReact