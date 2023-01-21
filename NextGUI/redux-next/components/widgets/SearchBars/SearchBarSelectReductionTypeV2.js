/**
 * SearchBarSelectReductionTypeV2.js
 * 
* Attempts to create a generic searchbar with passed down props have failed, something about the array
 * of queried data is global and was causing label overriding. 
 * 
 * This searchbar is essentially the same as every other v2 suffix'd searchbar except for some error codes
 * @author Alex Diviney, Daniel Igbokwe
 */


import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { ProblemContext } from '../../contexts/ProblemProvider';
import React, { useContext, useEffect, useState } from 'react';
import message from './SearchBarSelectReduceToV2';
import AccordionTogglesSvg from '../AccordionTogglesSvg';
// import requestReducedInstance from  '../AccordionDualInputNestedButton'
const filter = createFilterOptions();
export const noReductionsTypeMessage =
  'No reduction method available. Please choose a reduce-to';
var problemJson = [];


export default function SearchBarSelectReductionTypeV2(props) {
  //props.setData and props.data should be passed down.
  //our problems to be shown


  const [reductionType, setReductionType] = useState('');
  const { problemInstance, chosenReduceTo, setReducedInstance, reductionNameMap } = useContext(ProblemContext);
  const [noReductionsType, setNoReductionsType] = useState(false);
  //chosenReduceTo

  const fullUrl = props.url;
  useEffect(() => {
    problemJson = [];
    setReductionType("");
    initializeList(fullUrl);
  }, [chosenReduceTo]);

  //const [value, setValue] = React.useState(null); //state manager.
  return (
    <Autocomplete
      style={{ width: "100%" }}
      disabled={noReductionsType ? true : false}
      value={reductionType}
      onChange={(event, newValue) => {


        if (typeof newValue === 'string') {
          setReductionType(
            newValue
          );
          props.setData(newValue);
          // stateVal = newValue
        } else {
          setReductionType(newValue);
          props.setData(newValue);
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
          let reductions = option.split("-");
          reductions = reductions.map(r => {return reductionNameMap.get(r) ?? r})
          let reductionName = "";
          reductions.forEach(r => reductionName += r + " - ");
          return reductionName.slice(0, reductionName.lastIndexOf(" - "));
        }

        // Regular option
        return option;
      }}
      // renderOption={(props, option) => <li {...props}>{option}</li>}
      sx={{ width: 300 }}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label={props.placeholder}
          InputProps={noReductionsType ? { ...params.InputProps, style: { fontSize: 12 } } : { ...params.InputProps }}
        />
      )}
    />
  );



  function initializeProblemJson(arr) { //converts asynchronous fetch request into synchronous call that sets the dropdown labels
    // problemJson = [];
    while (problemJson.length) {
      problemJson.pop();
    }
     // check if reduceTo is selected
    if (!arr.length) {
      setNoReductionsType(true);
      setReductionType(noReductionsTypeMessage);
      props.setData('');
    }
    else{
      setNoReductionsType(false);
    }
    
    if(arr.length == 1){
      arr = arr[0]
      arr.map(function (element, index, array) {
        // problemJson = [];
        if (!problemJson.includes(element)) {
          if (element === "SipserReduceToCliqueStandard" && chosenReduceTo === 'CLIQUE') {
            props.setData(element);
            setReductionType("Sipser's Clique Reduction");

            requestReducedInstance(props.instanceURL, element, problemInstance).then(data => {

              // propNo reduction method available. Please choose a reduce-tos.setInstance(data.reductionTo.instance);
              setReducedInstance(data.reductionTo.instance);
            }).catch((error) => console.log("REDUCTION FAILED, one or more properties was invalid"))

          }

         // Auto populate "select reduction" field with sipserReduceToVC when reducing from Clique to Vertex Cover
         else if(element === "sipserReduceToVC" && chosenReduceTo === 'VertexCover'){
          props.setData(element);
          setReductionType("Sipser's Vertex Cover Reduction");
          requestReducedInstance(props.instanceURL, element, problemInstance).then(data => {

          // props.setInstance(data.reductionTo.instance);
          setReducedInstance(data.reductionTo.instance);
          }).catch((error) => console.log("REDUCTION FAILED, one or more properties was invalid"))
        }

          problemJson.push(element);

        }
      }, 80);
    }
    else{
      let path = ""
      arr.map((reduction)=>{
        path += reduction[0]+"-"
      })
      problemJson.push(path.slice(0,-1))
    }
  }
  async function getRequest(url) {
    const promise = await fetch(url).then(result => {
      return result.json()
    })
    return promise;

  }

  function initializeList(url) {

    if (chosenReduceTo !== '') {

      const req = getRequest(url);
      req.then(data => {
        initializeProblemJson(data);
      })
        .catch((error) => console.log("GET REQUEST FAILED SEARCHBAR SELECT REDUCTION TYPE"));

    } else {
      setNoReductionsType(true);
      setReductionType(noReductionsTypeMessage);
    }


  }
  async function requestReducedInstance(url, reductionName, reduceFrom) {
    var parsedInstance = reduceFrom.replaceAll('&', '%26');

    return await fetch(url + reductionName + '/reduce?' + "problemInstance=" + parsedInstance).then(resp => {
      if (resp.ok) {

        return resp.json();
      }
    })
  }




}

// export noReductionsMessage




