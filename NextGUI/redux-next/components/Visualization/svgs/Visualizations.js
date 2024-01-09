import SAT3_SVG_React from "./SAT3_SVG_React";
import CliqueSvgReactV2 from "./Clique_SVG_REACT_V2";
import VertexCoverSvgReact from "./VertexCover_SVG_React";
import ArcSetSvgReact from "./ArcSet_SVG_React";
import CutSvgReact  from "./Cut_SVG_REACT";
import CliqueCoverSvgReact  from "./CliqueCover_SVG_REACT";
import GraphColoringSvgReact from "./GraphColoring_SVG_REACT";
import HamiltonianSvgReact from "./Hamiltonian_SVG_REACT";
import SteinerTreeSvgReact from "./SteinerTree_SVG_REACT";
import WeightedCutSvgReact from "./WeightedCut_SVG_REACT";
import DirHamiltonianSvgReact from "./DirHamiltonian_SVG_React";
import TSPSvgReact from "./TSP_SVG_React";
import NodeSetSvgReact from "./NodeSet_SVG_React";

const Visualizations = new Map([
    ["SAT3" , (solve, url, problemInstance, solution) => {
        return(
            <SAT3_SVG_React 
                solutionData={solution}
                data={problemInstance}
                showSolution={solve}
                url={url}
            ></SAT3_SVG_React>  
        )
    }],
    ["CLIQUE", (solve, url, problemInstance, solution)=>{
        let apiCall = createAPICall("ClIQUE", solve, url, problemInstance, solution)
        return(
        <CliqueSvgReactV2 
            apiCall={apiCall} 
        ></CliqueSvgReactV2>
        )
    }],
    ["INDEPENDENTSET", (solve, url, problemInstance, solution)=>{
        let apiCall = createAPICall("INDEPENDENTSET", solve, url, problemInstance, solution)
        return(
        <CliqueSvgReactV2 
            apiCall={apiCall} 
        ></CliqueSvgReactV2>
        )
    }],
    ["VERTEXCOVER", (solve, url, problemInstance, solution)=>{
        let apiCall = createAPICall("VERTEXCOVER", solve, url, problemInstance, solution)
        return(
            <VertexCoverSvgReact 
                apiCall={apiCall}> 
            </VertexCoverSvgReact>
        )
    }],
    ["ARCSET", (solve, url, problemInstance, solution)=>{
        let apiCall = createAPICall("ARCSET", solve, url, problemInstance, solution)
        return(
            <ArcSetSvgReact 
                apiCall={apiCall} 
            ></ArcSetSvgReact>
        )
    }],
    ["CUT", (solve, url, problemInstance, solution)=>{
        let apiCall = createAPICall("CUT", solve, url, problemInstance, solution)
        return(
            <CutSvgReact 
                apiCall={apiCall} 
            ></CutSvgReact>
        )
    }],
    ["CLIQUECOVER", (solve, url, problemInstance, solution)=>{
        let apiCall = createAPICall("CLIQUECOVER", solve, url, problemInstance, solution)
        return(
            <CliqueCoverSvgReact 
                apiCall={apiCall} 
            ></CliqueCoverSvgReact>
        )
    }],
    ["GRAPHCOLORING", (solve, url, problemInstance, solution)=>{
        let apiCall = createAPICall("GRAPHCOLORING", solve, url, problemInstance, solution)
        return(
            <GraphColoringSvgReact 
                apiCall={apiCall} 
            ></GraphColoringSvgReact>
        )
    }],
    ["HAMILTONIAN", (solve, url, problemInstance, solution)=>{
        let apiCall = createAPICall("HAMILTONIAN", solve, url, problemInstance, solution)
        return(
            <HamiltonianSvgReact 
                apiCall={apiCall} 
            ></HamiltonianSvgReact>
        )
    }],
    ["DIRHAMILTONIAN", (solve, url, problemInstance, solution)=>{
        let apiCall = createAPICall("DIRHAMILTONIAN", solve, url, problemInstance, solution)
        return(
            <DirHamiltonianSvgReact 
                apiCall={apiCall} 
            ></DirHamiltonianSvgReact>
        )
    }],
    ["STEINERTREE", (solve, url, problemInstance, solution)=>{
        let apiCall = createAPICall("STEINERTREE", solve, url, problemInstance, solution)
        return(
            <SteinerTreeSvgReact
                apiCall={apiCall} 
            ></SteinerTreeSvgReact>
        )
    }],
    ["WEIGHTEDCUT", (solve, url, problemInstance, solution)=>{
        let apiCall = createAPICall("WEIGHTEDCUT", solve, url, problemInstance, solution)
        return(
            <WeightedCutSvgReact
                apiCall={apiCall} 
            ></WeightedCutSvgReact>
        )
    }],
    ["TSP", (solve, url, problemInstance, solution)=>{
        let apiCall = createAPICall("TSP", solve, url, problemInstance, solution)
        return(
            <TSPSvgReact
                apiCall={apiCall} 
            ></TSPSvgReact>
        )
    }],
    ["NODESET", (solve, url, problemInstance, solution)=>{
        let apiCall = createAPICall("NODESET", solve, url, problemInstance, solution)
        return(
            <NodeSetSvgReact
                apiCall={apiCall} 
            ></NodeSetSvgReact>
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
export default Visualizations;