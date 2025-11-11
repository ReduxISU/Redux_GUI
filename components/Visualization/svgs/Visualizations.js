import StandardGraphSvgReact from "./StandardGraphSvgReact";
import StandardSATSvgReact from "./StandardSATSvgReact";

const Visualizations = new Map([
    ["Boolean Satisfiability" , (solve, url, problemData, gadgetMap) => {
        return(
            <StandardSATSvgReact 
                problemData={problemData}
                solve={solve}
                url={url}
                gadgetMap={gadgetMap}
            ></StandardSATSvgReact>  
        )
    }],
    ["Graph D3", (solve, url, problemData, gadgetMap)=>{
        return(
        <StandardGraphSvgReact 
            problemData={problemData}
            solve={solve}
            url={url}
            gadgetMap={gadgetMap}
        ></StandardGraphSvgReact>
        )
    }],
])

export default Visualizations;