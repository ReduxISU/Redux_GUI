import StandardGraphSvgReact from "./StandardGraphSvgReact";
import StandardSetSvgReact from "./StandardSetSvgReact";

const Visualizations = new Map([
    ["Boolean Satisfiability" , (solve, url, problemData, gadgetMap) => {
        return(
            <StandardSetSvgReact 
                problemData={problemData}
                solve={solve}
                url={url}
                gadgetMap={gadgetMap}
            ></StandardSetSvgReact>  
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