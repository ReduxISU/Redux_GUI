/**
 * SearchBarProblemType.js
 *
 * Attempts to create a generic searchbar with passed down props have failed, something about the array
 * of queried data is global and was causing label overriding.
 *
 * This specific SearchBar has some quirks that the others do not have. As it is intended to be the first
 * searchbar that a user interacts with, the option labels do not need to dynamically change. Another way
 * to say this is that this search bar is not dependent on any state variables, but other search bars may
 * be dependent on state variables (the problem name) that this searchbar sets.
 *
 * @author Alex Diviney, Daniel Igbokwe
 */

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ProblemContext } from "../../contexts/ProblemProvider";
import React, { useContext } from "react";

// The following function gets the map key based on a value input
function getKeyByValue(map, searchValue) {
  for (const [key, value] of map.entries()) {
    if (value === searchValue) {
      return key;
    }
  }
  // Return a default value (e.g., null) if the value is not found
  return null;
}

export default function SearchBarProblemType(props) {
  const { problemName, setProblemName, problemNameMap } = useContext(ProblemContext); //passed in context

  return (
    <Autocomplete
      style={{ width: "100%" }}
      //defaultValue={defaultProblem !== null ?  props.setTestName : null}
      value={problemNameMap.get(problemName) || ""}
      onChange={(event, newValue) => {
        newValue = getKeyByValue(problemNameMap, newValue);
        if (typeof newValue === "string") {
          setProblemName(newValue);
          //setDefaultProblemName(newValue)
          props.setTestName(newValue);
        } else {
          setProblemName(newValue);
          props.setTestName(newValue);
        }

        if (newValue === "" || newValue === null) {
          props.setTestName("");
          setProblemName("");
        }
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="search-bar"
      options={Array.from(problemNameMap, ([problem, label]) => label)}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === "string") {
          return option;
        }
        return "";
      }}
      sx={{ width: 300 }}
      freeSolo
      renderInput={(params) => <TextField {...params} label={props.placeholder} />}
    />
  );
}
