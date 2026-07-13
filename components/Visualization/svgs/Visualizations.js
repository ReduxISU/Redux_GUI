import StandardGraphSvgReact from "./StandardGraphSvgReact";
import StandardSATSvgReact from "./StandardSATSvgReact";
import StandardCircuitSvgReact from "./StandardCircuitSvgReact";
import QuantumCircuitVis from "../QuantumCircuitVis";
import LaTeXGraphSvgReact from "./LaTeXGraphSvgReact";
import StandardSetSvgReact from "./StandardSetSvgReact";
import PumpSchedulingSvgReact from "./PumpSchedulingSvgReact";
import SSSPTableVisualization from "./SSSPTableSvgReact";

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
    ["Set D3" , (solve, url, problemData, gadgetMap, gadgetsOn) => {
        return(
            <StandardSetSvgReact
                problemData={problemData}
                solve={solve}
                url={url}
                gadgetMap={gadgetMap}
                gadgetsOn={gadgetsOn}
            ></StandardSetSvgReact>  
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
    ["Graph LaTeX", (solve, url, problemData, gadgetMap, gadgetsOn)=>{
        return(
        <LaTeXGraphSvgReact 
            problemData={problemData}
            solve={solve}
            url={url}
            gadgetMap={gadgetMap}
            gadgetsOn={gadgetsOn}
        ></LaTeXGraphSvgReact>
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
    ["pump", (solve, url, problemData) => {
        return (
            <PumpSchedulingSvgReact
                problemData={problemData}
                solve={solve}
                url={url}
            />
        );
    }],
    ["SSSP Table", (solve, url, problemData) => {
        return (
            <SSSPTableVisualization
                problemData={problemData}
                solve={solve}
                url={url}
            />
        );
    }]
])

export default Visualizations;
