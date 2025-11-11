import StandardGraphSvgReact from "./StandardGraphSvgReact";
import StandardSATSvgReact from "./StandardSATSvgReact";

const Visualizations = new Map([
    ["Boolean Satisfiability" , (solve, url, problemData, gadgetMap, showGadgets) => {
        return(
            <StandardSATSvgReact 
                problemData={problemData}
                solve={solve}
                url={url}
                gadgetMap={gadgetMap}
                showGadgets={showGadgets}
            ></StandardSATSvgReact>  
        )
    }],
    ["Graph D3", (solve, url, problemData, gadgetMap, showGadgets)=>{
        return(
        <StandardGraphSvgReact 
            problemData={problemData}
            solve={solve}
            url={url}
            gadgetMap={gadgetMap}
            showGadgets={showGadgets}
        ></StandardGraphSvgReact>
        )
    }],
])

export default Visualizations;