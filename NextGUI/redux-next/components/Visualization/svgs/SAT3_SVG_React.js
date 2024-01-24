import React from 'react'
import { fullClear, getSat3, showSolution} from './Sat3ToCliqueInstance'
import dynamic from "next/dynamic";
import { useRef,useState,useEffect,useContext } from 'react';

import { requestProblemGenericInstance } from '../../redux';
import {ProblemContext} from '../../contexts/ProblemProvider'
/// SAT3_SVG_React.js
/// This is a wrapper for the SAT3 visualization instance. It allows us to use the visualization as a react component, and also disables
/// server side rendering due to compilation issues with rendering a d3 svg before the entire page is rendered. 

function Sat3SvgReact(props) {
    const ref = useRef(null);
    const {problemInstance} = useContext(ProblemContext);
    const defaultSolution = ["x1"];
    const [solutionData, setSolutionData] = useState([]);
    const [data, setData] = useState('hello');
    useEffect(() => {
      try{
        requestProblemGenericInstance(props.url, "SAT3", problemInstance).then((d) => {
          if (d) {
            getSat3(ref.current, d.clauses);
          }
        });
        
        if(props.showSolution){
            // let solutionData = getProblemSolution(props.url, "Sat3BacktrackingSolver", problemInstance.replaceAll('&', "%26"));
            let apiCompatibleInstance = problemInstance.replaceAll('&', "%26");
            let stringArr = props.solutionData.replace('(', '').replace(')', ''); //turns (x1:True) int x1:True
            stringArr = stringArr.split(','); //turns x1:True,x2:True into [x1:True,x2:True]
            let finalArr = [];
            for (const str of stringArr) {
              let temp = str.split(':');
              if(temp[1] === "False"){
                finalArr.push("NOT"+temp[0]);
              }
              else{
                finalArr.push(temp[0]); //turns x1:true into x1
              }
            }
            setSolutionData(finalArr);
        }
        
        else if (!props.showSolution) { //ALEX NOTE: Code in here causes a rerender of sat3 that gets rid of the solution.
          setSolutionData([]);
          fullClear();


        }
      }
      catch(error){console.log("VISUALIZATION FAILED")};

    }, [problemInstance, props.showSolution])

    try{
      if(props.showSolution){
        showSolution(solutionData); //Data fed to this triggers a instance render with solution
      }
    }
    catch(error){console.log("VISUALIZATION FAILED")}
   
  // useEffect(() => { //This updated the cerificate text with a solution value when a user hits the solution button in SolvedRow
  //  if(!props.showSolution){
  //   setSolutionData([])
  //  }
  // }, [props.showSolution])

    return (
        <svg ref={ref}
            style={{
                height: "700px",
                width:"100%",
            marginRight: "0px",
            marginLeft: "0px",
          }}/>
)     
}
export default dynamic(() => Promise.resolve(Sat3SvgReact), {
    ssr: false
  })