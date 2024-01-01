/**
 * SearchBarSelectReduceToV2.js
 *
 * Attempts to create a generic searchbar with passed down props have failed, something about the array
 * of queried data is global and was causing label overriding.
 *
 * This searchbar is essentially the same as every other v2 suffix'd searchbar except for some error codes
 * @author Alex Diviney, Daniel Igbokwe
 */

import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { ProblemContext } from "../../contexts/ProblemProvider";
import React, { useContext, useEffect, useState } from "react";
export const noReductionsMessage = "No reductions available. Click on the add button to add a new reduce-to";

export default function SearchBarSelectReduceToV2(props) {
  // const [defaultProblemName, setDefaultProblemName] = useState('');
  const [reductionProblem, setReduceTo] = useState(noReductionsMessage);
  const { problemName, setChosenReduceTo, reduceToOptions, problemNameMap } = useContext(ProblemContext);
  const [noReductions, setNoReductions] = useState(true);

  useEffect(() => {
    if (problemName !== "" || problemName !== null) {
      setNoReductions(true);
      setReduceTo(noReductionsMessage);
    } else {
      setReduceTo("");
    }
  }, [problemName]);

  useEffect(() => {
    if (!reduceToOptions.length) {
      setNoReductions(true);
      setReduceTo(noReductionsMessage);
    } else {
      setNoReductions(false);
      setReduceTo("");
    }
  }, [reduceToOptions]);

  return (
    <Autocomplete
      style={{ width: "100%" }}
      disabled={noReductions}
      value={reductionProblem}
      onChange={(event, newValue) => {
        setReduceTo(newValue);
        setChosenReduceTo(newValue);

        if (newValue === "" || newValue === null) {
          setChosenReduceTo("");
        }
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="search-bar"
      options={reduceToOptions}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === "string") {
          return problemNameMap.get(option) ?? option;
        }
        return "";
      }}
      sx={{ width: 300 }}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.placeholder}
          InputProps={noReductions ? { ...params.InputProps, style: { fontSize: 12 } } : { ...params.InputProps }}
        />
      )}
    />
  );
}
