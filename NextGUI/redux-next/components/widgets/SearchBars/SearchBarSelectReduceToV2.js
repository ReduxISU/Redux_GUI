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
import Autocomplete from "@mui/material/Autocomplete";
import { ProblemContext } from "../../contexts/ProblemProvider";
import React, { useContext } from "react";
export const noReductionsMessage = "No reductions available. Click on the add button to add a new reduce-to";

export default function SearchBarSelectReduceToV2(props) {
  const { problemName, chosenReduceTo, setChosenReduceTo, reduceToOptions, problemNameMap } =
    useContext(ProblemContext);

  const noReductions = !!problemName && !reduceToOptions.length;

  return (
    <Autocomplete
      style={{ width: "100%" }}
      disabled={noReductions}
      value={noReductions ? noReductionsMessage : chosenReduceTo}
      onChange={(event, value) => {
        if (value !== noReductionsMessage) {
          setChosenReduceTo(value ?? "");
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
