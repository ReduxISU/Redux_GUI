import ArcSetSvgReact from "./ArcSet_SVG_React"
import VertexCoverSvgReact from "./VertexCover_SVG_React"
import CLIQUE_SVG_REACT from "./CLIQUE_SVG_REACT"
const ReducedVisualizations = new Map([
    //Vertex Cover
    ["LawlerKarp",(solve, url, problemInstance, solution) => {
        return(
            <ArcSetSvgReact 
                problemName={"ARCSET"}
                solve={solve}
                url={url}
                problemInstance={problemInstance}
                solution={solution} 
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
        return(
            <VertexCoverSvgReact 
                problemName={"VERTEXCOVER"}
                solve={solve}
                url={url}
                problemInstance={problemInstance}
                solution={solution}
            ></VertexCoverSvgReact>
        )
    }],
    ["SipserReduceToCliqueStandard-sipserReduceToVC-LawlerKarp",(solve, url, problemInstance, solution) => {
        return(
            <ArcSetSvgReact 
                problemName={"ARCSET"}
                solve={solve}
                url={url}
                problemInstance={problemInstance}
                solution={solution} 
                reductionType={"LawlerKarp"}
            ></ArcSetSvgReact>
        )
    }],

    //CLIQUE
    ["sipserReduceToVC",(solve, url, problemInstance, solution) => {
        return(
            <VertexCoverSvgReact 
                problemName={"VERTEXCOVER"}
                solve={solve}
                url={url}
                problemInstance={problemInstance}
                solution={solution} 
            ></VertexCoverSvgReact>
        )
    }],
    ["sipserReduceToVC-LawlerKarp",(solve, url, problemInstance, solution) => {
        return(
            <ArcSetSvgReact 
                problemName={"ARCSET"}
                solve={solve}
                url={url}
                problemInstance={problemInstance}
                solution={solution} 
                reductionType={"LawlerKarp"}
            ></ArcSetSvgReact>
        )
    }],
])

export default ReducedVisualizations;