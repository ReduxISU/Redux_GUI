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
import StandardGraphSvgReact from "./StandardGraphSvgReact";

import { requestVisualization } from "../../redux";

const Visualizations = new Map([
    ["Boolean Satisfiability" , (solve, url, problemInstance, solution) => {
        return(
            <SAT3_SVG_React 
                problemName={"SAT3"}
                solutionData={solution}
                data={problemInstance}
                problemInstance={problemInstance}
                showSolution={solve}
                url={url}
            ></SAT3_SVG_React>  
        )
    }],
    ["CLIQUE", (solve, url, problemInstance, solution, currentStep, allSteps)=>{
        return(
        <CliqueSvgReactV2 
            problemName={"CLIQUE"}
            problemSteps={allSteps}
            currentStep={currentStep}
            solve={solve}
            url={url}
            problemInstance={problemInstance}
            solution={solution}
        ></CliqueSvgReactV2>
        )
    }],
    // ["INDEPENDENTSET", (solve, url, problemInstance, solution)=>{
    //     return(
    //     <CliqueSvgReactV2 
    //         problemName={"INDEPENDENTSET"}
    //         solve={solve}
    //         url={url}
    //         problemInstance={problemInstance}
    //         solution={solution}
    //     ></CliqueSvgReactV2>
    //     )
    // }],
    ["VERTEXCOVER", (solve, url, problemInstance, solution)=>{
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
    ["ARCSET", (solve, url, problemInstance, solution)=>{
        return(
            <ArcSetSvgReact 
                problemName={"ARCSET"}
                solve={solve}
                url={url}
                problemInstance={problemInstance}
                solution={solution}
            ></ArcSetSvgReact>
        )
    }],
    ["CUT", (solve, url, problemInstance, solution)=>{
        return(
            <CutSvgReact 
                problemName={"CUT"}
                solve={solve}
                url={url}
                problemInstance={problemInstance}
                solution={solution}
            ></CutSvgReact>
        )
    }],
    ["CLIQUECOVER", (solve, url, problemInstance, solution)=>{
        return(
            <CliqueCoverSvgReact 
                problemName={"CLIQUECOVER"}
                solve={solve}
                url={url}
                problemInstance={problemInstance}
                solution={solution}
            ></CliqueCoverSvgReact>
        )
    }],
    ["GRAPHCOLORING", (solve, url, problemInstance, solution)=>{
        return(
            <GraphColoringSvgReact 
                problemName={"GRAPHCOLORING"}
                solve={solve}
                url={url}
                problemInstance={problemInstance}
                solution={solution}
            ></GraphColoringSvgReact>
        )
    }],
    ["HAMILTONIAN", (solve, url, problemInstance, solution)=>{
        return(
            <HamiltonianSvgReact 
                problemName={"HAMILTONIAN"}
                solve={solve}
                url={url}
                problemInstance={problemInstance}
                solution={solution}
            ></HamiltonianSvgReact>
        )
    }],
    ["DIRHAMILTONIAN", (solve, url, problemInstance, solution)=>{
        return(
            <DirHamiltonianSvgReact 
                problemName={"DIRHAMILTONIAN"}
                solve={solve}
                url={url}
                problemInstance={problemInstance}
                solution={solution}
            ></DirHamiltonianSvgReact>
        )
    }],
    ["STEINERTREE", (solve, url, problemInstance, solution)=>{
        return(
            <SteinerTreeSvgReact
                problemName={"STEINERTREE"}
                solve={solve}
                url={url}
                problemInstance={problemInstance}
                solution={solution}
            ></SteinerTreeSvgReact>
        )
    }],
    ["WEIGHTEDCUT", (solve, url, problemInstance, solution)=>{
        return(
            <WeightedCutSvgReact
                problemName={"WEIGHTEDCUT"}
                solve={solve}
                url={url}
                problemInstance={problemInstance}
                solution={solution}
            ></WeightedCutSvgReact>
        )
    }],
    ["TSP", (solve, url, problemInstance, solution)=>{
        return(
            <TSPSvgReact
                problemName={"TSP"}
                solve={solve}
                url={url}
                problemInstance={problemInstance}
                solution={solution}
            ></TSPSvgReact>
        )
    }],
    ["NODESET", (solve, url, problemInstance, solution)=>{
        return(
            <NodeSetSvgReact
                problemName={"NODESET"}
                solve={solve}
                url={url}
                problemInstance={problemInstance}
                solution={solution}
            ></NodeSetSvgReact>
        )
    }],
    ["Graph D3", (solve, url, problemInstance, solution, problemData)=>{
        return(
        <StandardGraphSvgReact 
            problemData={problemData}
            solve={solve}
            url={url}
        ></StandardGraphSvgReact>
        )
    }],
])

export default Visualizations;