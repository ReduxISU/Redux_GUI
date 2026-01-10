import StandardGraphSvgReact from "./StandardGraphSvgReact";
import StandardSATSvgReact from "./StandardSATSvgReact";
import StandardCircuitSvgReact from "./StandardCircuitSvgReact";
import QuantumCircuitVis from "../QuantumCircuitVis";

const Visualizations = new Map([
    ["Boolean Satisfiability" , (solve, url, problemData, gadgetMap, gadgetsOn) => {
        return(
            <StandardSATSvgReact 
                problemData={problemData}
                solve={solve}
                url={url}
                gadgetMap={gadgetMap}
                gadgetsOn={gadgetsOn}
            ></StandardSATSvgReact>  
        )
    }],
    ["Graph D3", (solve, url, problemData, gadgetMap, gadgetsOn)=>{
        return(
        <StandardGraphSvgReact 
            problemData={problemData}
            solve={solve}
            url={url}
            gadgetMap={gadgetMap}
            gadgetsOn={gadgetsOn}
        ></StandardGraphSvgReact>
        )
    }],
    ["Quantum Circuit D3", (solve, url, problemData, gadgetMap, gadgetsOn)=>{
        return(
        <StandardCircuitSvgReact
            problemData={problemData}
            solve={solve}
            url={url}
            gadgetMap={gadgetMap}
            gadgetsOn={gadgetsOn}
        ></StandardCircuitSvgReact>
        )
    }],
    ["Quantum Circuit Q.js", (solve, url, problemData, gadgetMap, gadgetsOn) => {
        return (
            <QuantumCircuitVis
                problemData={problemData}
                solve={solve}
                url={url}
                gadgetMap={gadgetMap}
                gadgetsOn={gadgetsOn}
            />
        );
    }],
])

export default Visualizations;
