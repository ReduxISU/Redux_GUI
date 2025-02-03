import ArcSetSvgReact from "./ArcSet_SVG_React"
import VertexCoverSvgReact from "./VertexCover_SVG_React"
import CLIQUE_SVG_REACT from "./CLIQUE_SVG_REACT"
const ReducedVisualizations = new Map([
    //Vertex Cover
    ["LawlerKarp",(solve, url, problemInstance, solution) => {
        let apiCall = createAPICall("ARCSET", solve, url, problemInstance, solution)
        return(
            <ArcSetSvgReact 
                apiCall={apiCall} 
                reductionType={"LawlerKarp"}
            ></ArcSetSvgReact>
        )
    }],

    //3SAT 
    ["SipserReduceToCliqueStandard",(solve, url, problemInstance, solution) => {
        return(
            <CLIQUE_SVG_REACT
                solutionData={solution}
                url={url}
                reductionType={"SipserReduceToCliqueStandard"}
                problemInstance={problemInstance}
                solveSwitch={solve}>
            </CLIQUE_SVG_REACT>
        )
    }],
    ["SipserReduceToCliqueStandard-sipserReduceToVC",(solve, url, problemInstance, solution) => {
        let apiCall = createAPICall("VERTEXCOVER", solve, url, problemInstance, solution)
        return(
            <VertexCoverSvgReact 
                apiCall={apiCall} 
            ></VertexCoverSvgReact>
        )
    }],
    ["SipserReduceToCliqueStandard-sipserReduceToVC-LawlerKarp",(solve, url, problemInstance, solution) => {
        let apiCall = createAPICall("ARCSET", solve, url, problemInstance, solution)
        return(
            <ArcSetSvgReact 
                apiCall={apiCall} 
                reductionType={"LawlerKarp"}
            ></ArcSetSvgReact>
        )
    }],

    //CLIQUE
    ["sipserReduceToVC",(solve, url, problemInstance, solution) => {
        let apiCall = createAPICall("VERTEXCOVER", solve, url, problemInstance, solution)
        return(
            <VertexCoverSvgReact 
                apiCall={apiCall} 
            ></VertexCoverSvgReact>
        )
    }],
    ["sipserReduceToVC-LawlerKarp",(solve, url, problemInstance, solution) => {
        let apiCall = createAPICall("ARCSET", solve, url, problemInstance, solution)
        return(
            <ArcSetSvgReact 
                apiCall={apiCall} 
                reductionType={"LawlerKarp"}
            ></ArcSetSvgReact>
        )
    }],
])

function createAPICall(problemName, solve, url, problemInstance, solution){
    if(solve){
        return url + problemName +"Generic/solvedVisualization?problemInstance="+ problemInstance+ "&solution=" + solution;
    }
    else{
        return url + problemName +"Generic/visualize?problemInstance="+ problemInstance; 
    }
}

export default ReducedVisualizations;