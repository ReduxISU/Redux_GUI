/**
 * SearchBarSelectSolverV2.js
 * 
* Attempts to create a generic searchbar with passed down props have failed, something about the array
 * of queried data is global and was causing label overriding. 
 * 
 * This searchbar is essentially the same as every other v2 suffix'd searchbar except for some error codes
 * @author Alex Diviney
 */

import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { ProblemContext } from '../../contexts/ProblemProvider';
import React, { useContext, useEffect, useState } from 'react';
import { curveStepBefore } from 'd3';
const filter = createFilterOptions();
const noSolverMessage = ' No solvers available. Please select a problem';

//our problems to be shown
var problemJson = [];



export default function SearchBarSelectSolverV2(props) {
  //props.setData and props.data should be passed down.
  const [defaultSolver, setDefaultSolver] = useState('');
  const { problemName, solverNameMap, problemNameMap, defaultSolverMap } = useContext(ProblemContext);
  const [noSolver, setNoSolvers] = useState(false);



  const fullUrl = props.url;
  // initializeList(fullUrl) 
  useEffect(() => {
    setDefaultSolver("");
    props.setData("");

    if (problemName === "" || problemName === null) {
      setNoSolvers(true);
      setDefaultSolver(noSolverMessage);
    } else {
      initializeList(fullUrl);
      props.setData(defaultSolverMap.get(problemName)); // Gets the file name of default solver
      setDefaultSolver(solverNameMap.get(defaultSolverMap.get(problemName))) // Matches file name with solver name
    }
  }, [problemName])

  //const [value, setValue] = React.useState(null); //state manager.
  return (
    <Autocomplete
      style={{ width: "100%" }}
      value={defaultSolver}
      disabled={noSolver ? true : false}
      onChange={(event, newValue) => {
        if (typeof newValue === 'string') {
          // setChosenReduceTo(
          //   newValue
          // );
          props.setData(newValue);
          setDefaultSolver(newValue);
          // stateVal = newValue
        } else {
          //setChosenReduceTo(newValue);
          props.setData(newValue);
          setDefaultSolver(newValue);
          // stateVal = newValue;
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some((option) => inputValue === option.title);
        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="search-bar"

      options={problemJson}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          if (option === "CliqueBruteForce - via SipserReduceToCliqueStandard") {
            return "Clique Brute Force - via Sipser Clique Reduction"
          }
          return solverNameMap.get(option) ?? option;
        }
        // Regular option
        return option;
      }}
      // renderOption={(props, option) => <li {...props}>{option}</li>}
      sx={{ width: 300 }}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label={props.placeholder}
          InputProps={noSolver ? { ...params.InputProps, style: { fontSize: 12 } } : { ...params.InputProps }}
        />
      )}
    />
  );



  function initializeProblemJson(arr) { //converts asynchronous fetch request into synchronous call that sets the dropdown labels
    while (problemJson.length) {
      problemJson.pop();
    }


    //Every problem should have a generic solver 
    // if(!arr){ setNoSolvers(true);}
    // problemJson = []
    arr.map(function (element, index, array) {
      //setNoSolvers(false);

      if (!problemJson.includes(element)) {
        if (element === 'Sat3BacktrackingSolver' && problemName === 'SAT3') {
          props.setData(element);
          setDefaultSolver('3SAT Backtracking Solver');
        }
        else if (element === 'CliqueBruteForce' && problemName === 'CLIQUE') {
          props.setData(element);
          setDefaultSolver('Clique Brute Force');
        }
        problemJson.push(element);
      }
    }, 80);
  }
  async function getRequest(url) {
    const promise = await fetch(url).then(result => {
      return result.json()
    })
    return promise;

  }

  function initializeList(url) {

    // if(problemName !== "" || problemName !== null ){
    const req = getRequest(url);
    setNoSolvers(false);
    setNoSolvers("");
    req.then(data => {

      initializeProblemJson(data)
    })
      .catch((error) => console.log("GET REQUEST FAILED SEARCHBAR SOLVER"));

    // }else{
    //   setNoSolvers(true);
    //   setNoSolvers(noSolverMessage);
    // }


  }



}

