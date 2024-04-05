/**
 * SearchBarSelectVerifierV2.js
 * 
* Attempts to create a generic searchbar with passed down props have failed, something about the array
 * of queried data is global and was causing label overriding. 
 * 
 * This searchbar is essentially the same as every other v2 suffix'd searchbar except for some error codes
 * @author Alex Diviney
 */


import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { ProblemContext } from '../../contexts/ProblemProvider'
import React, { useContext, useEffect, useState } from 'react';
const filter = createFilterOptions();
//our problems to be shown

export const noProblemChosenMessage =
  'No verifier available. Please select a problem';


var problemJson = [

];



export default function SearchBarSelectVerifierV2(props) {
  //props.setData and props.data should be passed down.

  let stateVal = undefined;
  const [defaultVerifier, setDefaultVerifier] = useState('');
  const { problemName, verifierNameMap, defaultVerifierMap } = useContext(ProblemContext);
  const [noVerifier, setNoVerifiers] = useState(false);


  const fullUrl = props.url;
  // initializeList(fullUrl) 
  useEffect(() => {
    setDefaultVerifier("");
    props.setData("");


    if (problemName === "" || problemName === null) {
      setNoVerifiers(true);
      setDefaultVerifier(noProblemChosenMessage);
    } else {
      initializeList(fullUrl);
      props.setData(defaultVerifierMap.get(problemName))
      setDefaultVerifier(verifierNameMap.get(defaultVerifierMap.get(problemName)))
    }


  }, [problemName])


  //const [value, setValue] = React.useState(null); //state manager.
  return (
    <Autocomplete
      style={{ width: "100%" }}
      value={defaultVerifier}
      disabled={noVerifier ? true : false}
      onChange={(event, newValue) => {
        if (typeof newValue === 'string') {
          // setChosenReduceTo(
          //   newValue
          // );
          props.setData(newValue);
          setDefaultVerifier(newValue);
          // stateVal = newValue
        } else {
          //setChosenReduceTo(newValue);
          props.setData(newValue);
          setDefaultVerifier(newValue);

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
          return verifierNameMap.get(option) ?? option;
        }

        // Regular option
        return option;
      }}
      // renderOption={(props, option) => <li {...props}>{option}</li>}
      sx={{ width: 300 }}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label={props.placeholder}
          InputProps={noVerifier ? { ...params.InputProps, style: { fontSize: 12 } } : { ...params.InputProps }}
        />
      )}
    />
  );



  function initializeProblemJson(arr) { //converts asynchronous fetch request into synchronous call that sets the dropdown labels
    while (problemJson.length) {
      problemJson.pop();
    }
    // problemJson = [];
    arr.map(function (element, index, array) {

      if (!problemJson.includes(element)) {

        if (element === 'SAT3Verifier' && problemName === 'SAT3') {
          props.setData(element);
          setDefaultVerifier('3SAT Verifier');
        }
        else if (element === 'CliqueVerifier' && problemName === 'CLIQUE'){
          props.setData(element);
          setDefaultVerifier('Generic Verifier');
        }
        problemJson.push(element)
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
    const req = getRequest(url);
    setNoVerifiers(false);
    setDefaultVerifier('');
    req.then(data => {

      initializeProblemJson(data)
    })
      .catch((error) => console.log("GET REQUEST FAILED SEARCHBAR VERIFIER"));


    // }else{
    //   setNoVerifiers(true);
    // setDefaultVerifier(noProblemChosenMessage);
    // }

  }






}


