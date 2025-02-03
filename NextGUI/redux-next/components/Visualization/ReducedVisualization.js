/**
 * ReducedVisualization.js
 * 
 * This component generates an example split view with two graphs using the Graphviz library and the React split component.
 * 
 * @author Daniel Igbokwe
 */


import { Container } from "@mui/material";
import Split from "react-split";



export default function visualize(props){


    return(
        <Split className="wrap" direction="horizontal" style={{height: 'inherit'}}>
            
            {/* <div className="visualization" id="instanceDiv" >
                {props.instanceVisualization}

            </div> */}
            <div>
            <Container>
            {props.instanceVisualization !== null ? <div className="visualization" id="instanceDiv" >
                {props.instanceVisualization}

            </div> : null}
                </Container>
            </div>
            {/* <div className="visualization"  id="reducedDiv">
            {props.instanceVisualization}
                
            </div> */}
            <div>
            <Container>
            {props.reducedVisualization !== null ? <div className="visualization" id="reducedDiv" >
                {props.reducedVisualization}

            </div> : null}
            </Container>
            </div>
        </Split>
    )
}