// This is a holder for visualizations that passes down urls based on switch data.


import Split from 'react-split'
import { Container } from '@mui/material';
import { useEffect, useState } from 'react';
import VertexCoverSvgReact from "../Visualization/svgs/VertexCover_SVG_React";
import SAT3_SVG_React from "../Visualization/svgs/SAT3_SVG_React";
import CLIQUE_SVG_REACT from "../Visualization/svgs/CLIQUE_SVG_REACT";
import CliqueSvgReactV2 from "../Visualization/svgs/Clique_SVG_REACT_V2";
import { tsvFormatValue } from 'd3';
import Refresh from '@mui/icons-material/Refresh';
import {No_Viz_Svg, No_Reduction_Viz_Svg} from '../Visualization/svgs/No_Viz_SVG';
import ArcSetSvgReact from '../Visualization/svgs/ArcSet_SVG_React';
import Visualizations from '../Visualization/svgs/Visualizations.js'

export default function VisualizationLogic(props) {

    const [solution, setSolution] = useState();
    const [mappedSolution, setMappedSolution] = useState();
    let apiCall = ""
    let apiCall2 = ""
    let visualization;
    let reducedVisualization;
    let problemName = props.problemName
    let reductionName = props.reductionName
    let reductionType = props.reductionType
    let reducedInstance = props.reducedInstance;
    let visualizationState = props.visualizationState
    let loading = props.loading
    let url = props.url;

    const handleBar = (sizes) => {
    }

    //VertexCover 
    if (problemName === "VERTEXCOVER") {
        if(props.url && props.problemInstance){
            requestSolution(props.url,"VertexCoverBruteForce",props.problemInstance).then(data => {
                setSolution(data)
            }).catch((error) => console.log("SOLUTION REQUEST FAILED"))
        }
    
        if(props.visualizationState.reductionOn){
            let apiCall2
            if(reductionName === "ARCSET"){
                if(props.url && props.problemInstance && props.reducedInstance && solution){
                    requestMappedSolution(props.url, "LawlerKarp", props.problemInstance, props.reducedInstance, solution).then(data => {
                        setMappedSolution(data);
                    }).catch((error) => console.log("SOLUTION MAPPING REQUEST FAILED"))
                }
                // Solver on
                if(props.visualizationState.solverOn){
                    apiCall2 = props.url +"ARCSETGeneric/solvedVisualization?problemInstance="+ props.reducedInstance+ "&solution=" + mappedSolution;
                }
                //Solver off
                else{
                    apiCall2 = props.url +"ARCSETGeneric/visualize?problemInstance="+ props.reducedInstance;
                }reducedVisualization = 
                    <ArcSetSvgReact 
                        apiCall={apiCall2} 
                        reductionType={props.reductionType}
                    ></ArcSetSvgReact>
            }else reducedVisualization = <No_Reduction_Viz_Svg></No_Reduction_Viz_Svg> 
            
        }
        
        if(props.visualizationState.solverOn){
            apiCall = props.url + "VERTEXCOVERGeneric/solvedVisualization?problemInstance=" + props.problemInstance + "&solution=" + solution;
        }else{
            apiCall = props.url +"VERTEXCOVERGeneric/visualize?problemInstance=" + props.problemInstance;
        }visualization = 
            <VertexCoverSvgReact 
                apiCall={apiCall}> 
            </VertexCoverSvgReact>

    }
    
    

    //3SAT
    else if (problemName === "SAT3") {
        if(props.url && props.problemInstance){
            requestSolution(props.url,"Sat3BacktrackingSolver",props.problemInstance).then(data => {
                setSolution(data) 
            }).catch((error) => console.log("SOLUTION REQUEST FAILED"))
        }
        // SAT3 -> CLIQUE
        if(reductionName === "CLIQUE"){
            if(props.url && props.problemInstance && props.reducedInstance && solution){
                requestMappedSolution(props.url, "SipserReduceToCliqueStandard", props.problemInstance, props.reducedInstance, solution).then(data => {
                    setMappedSolution(data);
                }).catch((error) => console.log("MAPPED SOLUTION REQUEST FAILED"))
            }
            reducedVisualization =
                <CLIQUE_SVG_REACT
                    solutionData={mappedSolution}
                    data={props.reducedVisualizationData}
                    url={props.url}
                    reductionType={reductionType}
                    problemInstance={props.problemInstance}
                    solveSwitch={props.visualizationState.solverOn}>
                </CLIQUE_SVG_REACT>
        }

        if(reductionName === "VERTEXCOVER"){
            if(props.url && props.problemInstance && props.reducedInstance && solution){
                requestMappedSolutionTransitive(props.url, "SipserReduceToCliqueStandard-sipserReduceToVC", props.problemInstance, solution).then(data => {
                    setMappedSolution(data);
                }).catch((error) => console.log("MAPPED SOLUTION REQUEST FAILED"))
            }
            // Solver on
            if(props.visualizationState.solverOn){
                apiCall2 = props.url +"VERTEXCOVERGeneric/solvedVisualization?problemInstance="+ props.reducedInstance+ "&solution=" + mappedSolution;
            }
            //Solver off
            else{
                apiCall2 = props.url +"VERTEXCOVERGeneric/visualize?problemInstance="+ props.reducedInstance;
            }reducedVisualization = 
                <VertexCoverSvgReact 
                    apiCall={apiCall2} 
                ></VertexCoverSvgReact>
        }

        if(reductionName === "ARCSET"){
            if(props.url && props.problemInstance && props.reducedInstance && solution){
                requestMappedSolutionTransitive(props.url, "SipserReduceToCliqueStandard-sipserReduceToVC-LawlerKarp", props.problemInstance, solution).then(data => {
                    setMappedSolution(data);
                }).catch((error) => console.log("MAPPED SOLUTION REQUEST FAILED"))
            }
            // Solver on
            if(props.visualizationState.solverOn){
                apiCall2 = props.url +"ARCSETGeneric/solvedVisualization?problemInstance="+ props.reducedInstance+ "&solution=" + mappedSolution;
            }
            //Solver off
            else{
                apiCall2 = props.url +"ARCSETGeneric/visualize?problemInstance="+ props.reducedInstance;
            }reducedVisualization = 
                <ArcSetSvgReact 
                    apiCall={apiCall2} 
                    reductionType={props.reductionType}
                ></ArcSetSvgReact>
        }
        visualization = 
            <SAT3_SVG_React 
                solutionData={solution}
                data={props.problemVisualizationData}
                showSolution={props.visualizationState.solverOn}
                url={props.url}
            ></SAT3_SVG_React>    
    
    }

    
    // Clique problem
    else if (problemName === "CLIQUE") {
        if(props.url && props.problemInstance){
            requestSolution(props.url, "CliqueBruteForce", props.problemInstance).then(data=>{
                setSolution(data);
            }).catch((error) => console.log("SOLUTION REQUEST FAILED"))
        }
        // CLIQUE -> VERTEXCOVER
        if(reductionName === "VERTEXCOVER"){
            if(props.url && props.problemInstance && props.reducedInstance && solution){
                requestMappedSolution(props.url, "sipserReduceToVC", props.problemInstance, props.reducedInstance, solution).then(data => {
                    setMappedSolution(data);
                }).catch((error) => console.log("MAPPED SOLUTION REQUEST FAILED"))
            }
            if(props.visualizationState.solverOn){
                apiCall2 = props.url + "VERTEXCOVERGeneric/solvedVisualization?problemInstance=" + props.reducedInstance + "&solution=" + mappedSolution;
            }else{
                apiCall2 = props.url + "VERTEXCOVERGeneric/visualize?problemInstance=" + props.reducedInstance;
            }
            reducedVisualization = 
                <VertexCoverSvgReact 
                    apiCall={apiCall2}>
                </VertexCoverSvgReact> 
        }
        // CLIQUE -> ARCSET
        else if(reductionName === "ARCSET"){
            if(props.url && props.problemInstance && props.reducedInstance && solution){
                requestMappedSolutionTransitive(props.url, "sipserReduceToVC-LawlerKarp", props.problemInstance, solution).then(data => {
                    setMappedSolution(data);
                }).catch((error) => console.log("MAPPED SOLUTION REQUEST FAILED"))
            }
            if(props.visualizationState.solverOn){
                apiCall2 = props.url + "ARCSETGeneric/solvedVisualization?problemInstance=" + props.reducedInstance + "&solution=" + mappedSolution;
            }else{
                apiCall2 = props.url + "ARCSETGeneric/visualize?problemInstance=" + props.reducedInstance;
            }
            reducedVisualization = 
                <ArcSetSvgReact 
                    apiCall={apiCall2}
                    reductionType={props.reductionType}
                    >
                </ArcSetSvgReact> 
        }
        //solution on
        if(props.visualizationState.solverOn){
            apiCall = props.url +"CLIQUEGeneric/solvedVisualization?problemInstance="+ props.problemInstance+ "&solution=" + solution;
        }
        //solution off
        else{
            apiCall = props.url +"CLIQUEGeneric/visualize?problemInstance="+ props.problemInstance;
        }
        visualization = 
            <CliqueSvgReactV2 
                apiCall={apiCall} 
            ></CliqueSvgReactV2>

    }

    else if (problemName == "ARCSET"){
        if(props.url && props.problemInstance){
            requestSolution(props.url,"ArcSetBruteForce",props.problemInstance).then(data => {
                setSolution(data) 
            }).catch((error) => console.log("SOLUTION REQUEST FAILED"))
        }
        
        //solution on
        if(props.visualizationState.solverOn){
            apiCall = props.url +"ARCSETGeneric/solvedVisualization?problemInstance="+ props.problemInstance+ "&solution=" + solution;
        }
        //solution off
        else{
            apiCall = props.url +"ARCSETGeneric/visualize?problemInstance="+ props.problemInstance;
        }
        visualization = 
            <ArcSetSvgReact 
                apiCall={apiCall} 
                instance={props.problemInstance}
            ></ArcSetSvgReact>

        
    }

    // GUI

        
        //Problem isnt 3SAT or Clique or VertexCover
    else {
        visualization = <No_Viz_Svg></No_Viz_Svg>
        reducedVisualization = <No_Viz_Svg></No_Viz_Svg>
    }


    if (!visualizationState.reductionOn && !loading) {
        return (
            <>
                <Container>
                    {visualization}
                </Container>
            </>
        )
    }
    else if (visualizationState.reductionOn && !loading) {

        console.log(Visualizations.get("SAT3")("0"));

        return (
            <>
                <Split
                    class="wrap"
                    direction="horizontal"
                    style={{ height: 'inherit' }}
                    onDragStart={handleBar}
                >
                    <Container>
                        {/* {"Container1"} */}
                        {visualization}
                    </Container>

                    <Container>
                        {/* {"Container2"} */}
                        {reducedVisualization}
                    </Container>
                </Split>

            </>
        )
    }

    return (
        <>
        </>
    )
}

export function requestSolution(url, solver, problemFrom ) {
    let parsedInstance = problemFrom.replaceAll('&', '%26');
  
        return fetch(url + solver + '/solve?' + "problemInstance=" + parsedInstance).then(resp => {
        if (resp.ok) {
            return resp.json();
        }
        }).catch((error) => console.log(error)) 
}

export function requestMappedSolution(url, reduction, problemFrom, problemTo, solution ) {
    let parsedFrom = problemFrom.replaceAll('&', '%26');
    let parsedTo = problemTo.replaceAll('&', '%26');
    let fullUrl = url + reduction + '/mapSolution?' + "problemFrom=" + parsedFrom + "&problemTo=" + parsedTo + "&problemFromSolution=" + solution
    return fetch(fullUrl).then(resp => {
      if (resp.ok) {
        return resp.json();
      }
    }).catch((error) => console.log(error))
}

export async function requestMappedSolutionTransitive(url, reduction, problemInstance, solution ) {
    let problemFrom = problemInstance;
    let mappedSolution = solution;
    let problemTo;
    let reductionList = reduction.split("-");
    for(let i=0; i<reductionList.length; i++){
        await requestReducedInstance(url, reductionList[i], problemFrom).then(data => {
            problemTo = data.reductionTo.instance;
        }).catch((error) => console.log("REDUCTION FOR SOLUTION MAPPING REQUEST FAILED"))
        await requestMappedSolution(url, reductionList[i], problemFrom, problemTo, mappedSolution).then(data => {
            mappedSolution = data;
        }).catch((error) => console.log("SOLUTION MAPPING REQUEST FAILED"))
        problemFrom = problemTo;
    }
    return mappedSolution;
}

export async function requestReducedInstance(url, reductionName, reduceFrom) {
    var parsedInstance = reduceFrom.replaceAll('&', '%26');
  
    return await fetch(url + reductionName + '/reduce?' + "problemInstance=" + parsedInstance).then(resp => {
      if (resp.ok) {
  
        return resp.json();
      }
    })
  }