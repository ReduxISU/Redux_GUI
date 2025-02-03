import React from 'react'
import { getClique } from './Sat3ToCliqueReduction'
import dynamic from "next/dynamic";
import { useRef,useState,useEffect,useContext } from 'react';

/// SAT3_SVG_React.js
/// This is a wrapper for the SAT3 visualization instance. It allows us to use the visualization as a react component, and also disables
/// server side rendering due to compilation issues with rendering a d3 svg before the entire page is rendered. 
// Note that it also is taking in additional props like the url prop and sending a data request that it forwards to the child component
function CliqueSvgReact(props) { //props.url, props.reductionName, props.problemInstance, props.solveSwitch

    //ALEX NOTE: This Default Array gets exposed upon api call failure I think. For dev testing, try setting a solution state variable to "True"
    const defaultArr= [
        {
            "name": "x1",
            "cluster": "0",
            "solutionState":""
        },
        {
            "name": "!x2",
            "cluster": "0",
            "solutionState":""

        },
        {
            "name": "x3",
            "cluster": "0",
            "solutionState":""

        },
        {
            "name": "!x1",
            "cluster": "1",
            "solutionState":""

        },
        {
            "name": "x3_1",
            "cluster": "1",
            "solutionState":""

        },
        {
            "name": "x1_1",
            "cluster": "1",
            "solutionState":""

        },
        {
            "name": "x2",
            "cluster": "2",
            "solutionState":""

        },
        {
            "name": "!x3",
            "cluster": "2",
            "solutionState":""

        },
        {
            "name": "x1_2",
            "cluster": "2",
            "solutionState":""

        }
    ]

    const data2 =[
        {
          "solutionState": "True",
          "cluster": "0",
          "name": "x1"
        },
        {
          "solutionState": "",
          "cluster": "0",
          "name": "!x2"
        },
        {
          "solutionState": "",
          "cluster": "0",
          "name": "x3"
        },
        {
          "solutionState": "",
          "cluster": "1",
          "name": "!x1"
        },
        {
          "solutionState": "",
          "cluster": "1",
          "name": "x3_1"
        },
        {
          "solutionState": "True",
          "cluster": "1",
          "name": "x1_1"
        },
        {
          "solutionState": "",
          "cluster": "2",
          "name": "x2"
        },
        {
          "solutionState": "",
          "cluster": "2",
          "name": "!x3"
        },
        {
          "solutionState": "True",
          "cluster": "2",
          "name": "x1_2"
        }
      ]
    let ref = useRef(null);
    const [jsonData, setJsonData] = useState(defaultArr);
    useEffect(() => {
        if (props.solveSwitch) {
            getReducedVisualizationDataSolved(props.url, props.reductionType, "solvedVisualization", props.problemInstance,props.solutionData).then(data => {
                setJsonData(data)
                if (typeof data  === 'undefined') {
                    setJsonData(data2)
                  }
               
            })
        }
        else if (!props.solveSwitch) {
            getReducedVisualizationData(props.url, props.reductionType, "reduce", props.problemInstance).then(data => {
                setJsonData(data.reductionTo.clusterNodes)
            }).catch((error) => {console.log("CLIQUE_SVG_REACT solver switch off switch faled to fetch data")})
        }
        
    }, [props.problemInstance,props.solveSwitch, props.solutionData])
    getClique(ref.current, jsonData);
    return (
        <svg ref={ref}
            style={{
                height: "100%",
                width: "100%",
            marginRight: "0px",
            marginLeft: "0px",
          }}/>
)     
}


function getReducedVisualizationData(url, reduction, suffix, instance) {

    if(reduction !== null || reduction !== ''){
      var fullUrl = `${url}${reduction}/${suffix}?problemInstance=${instance}`;
        return fetch(fullUrl).then(resp => {
          if (resp.ok) {
              return resp.json()
          }
      });

    }
    
  }
function getReducedVisualizationDataSolved(url, reduction, suffix, instance, solution) {

    if(reduction !== null || reduction !== ''){
      var fullUrl = `${url}${reduction}/${suffix}?problemInstance=${instance}&solution=${solution}`;
      return fetch(fullUrl).then(resp => {
        if (resp.ok) {
            return resp.json()
        }
      });

    }
    
  }



export default dynamic(() => Promise.resolve(CliqueSvgReact), {
    ssr: false
})