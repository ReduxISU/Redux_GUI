import StandardGraphSvgReact from "./StandardGraphSvgReact";
import StandardSATSvgReact from "./StandardSATSvgReact";
import StandardCircuitSvgReact from "./StandardCircuitSvgReact";
import QuantumCircuitVis from "../QuantumCircuitVis";

const Visualizations = new Map([
    ["Boolean Satisfiability" , (solve, url, problemData, gadgetMap, gadgetsOn, extra) => {
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
    ["Graph D3", (solve, url, problemData, gadgetMap, gadgetsOn, extra)=>{
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
    ["Quantum Circuit D3", (solve, url, problemData, gadgetMap, gadgetsOn, extra)=>{
        return(
        <StandardCircuitSvgReact
            problemData={problemData}
            solve={solve}
            url={url}
            gadgetMap={gadgetMap}
            gadgetsOn={gadgetsOn}
            useSolutionCircuit={extra?.showSolutionCircuit}
        ></StandardCircuitSvgReact>
        )
    }],
    ["Quantum Circuit Q.js", (solve, url, problemData, gadgetMap, gadgetsOn, extra) => {
        return (
            <QuantumCircuitVis
                problemData={problemData}
                solve={solve}
                url={url}
                gadgetMap={gadgetMap}
                gadgetsOn={gadgetsOn}
                useSolutionCircuit={extra?.showSolutionCircuit}
            />
        );
    }],
])

export default Visualizations;
