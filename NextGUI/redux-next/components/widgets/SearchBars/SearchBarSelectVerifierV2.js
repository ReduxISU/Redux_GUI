/**
 * SearchBarSelectVerifierV2.js
 *
 * Attempts to create a generic searchbar with passed down props have failed, something about the array
 * of queried data is global and was causing label overriding.
 *
 * This searchbar is essentially the same as every other v2 suffix'd searchbar except for some error codes
 * @author Alex Diviney
 */

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ProblemContext } from "../../contexts/ProblemProvider";
import React, { useContext, useEffect, useState } from "react";

export const noProblemChosenMessage = "No verifier available. Please select a problem";

export default function SearchBarSelectVerifierV2(props) {
  const { problemName, verifierNameMap, verifierOptions, setChosenVerifier, chosenVerifier } =
    useContext(ProblemContext);

  return (
    <Autocomplete
      style={{ width: "100%" }}
      value={!problemName ? noProblemChosenMessage : chosenVerifier}
      disabled={!problemName}
      onChange={(event, value) => {
        if (value !== noProblemChosenMessage) {
          setChosenVerifier(value ?? "");
        }
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="search-bar"
      options={verifierOptions}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === "string") {
          return verifierNameMap.get(option) ?? option;
        }

        // Regular option
        return option;
      }}
      // renderOption={(props, option) => <li {...props}>{option}</li>}
      sx={{ width: 300 }}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.placeholder}
          InputProps={!problemName ? { ...params.InputProps, style: { fontSize: 12 } } : { ...params.InputProps }}
        />
      )}
    />
  );
}
