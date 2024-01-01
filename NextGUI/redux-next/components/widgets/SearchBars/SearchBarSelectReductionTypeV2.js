/**
 * SearchBarSelectReductionTypeV2.js
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
import React, { useContext, useEffect, useState } from "react";
export const noReductionsTypeMessage = "No reduction method available. Please choose a reduce-to";

export default function SearchBarSelectReductionTypeV2(props) {
  const [reductionType, setReductionType] = useState("");
  const { chosenReduceTo, reductionNameMap, setChosenReductionType, reductionTypeOptions } = useContext(ProblemContext);
  const [noReductionsType, setNoReductionsType] = useState(false);

  useEffect(() => {
    if (chosenReduceTo === "") {
      setNoReductionsType(true);
      setReductionType(noReductionsTypeMessage);
    }
  }, [chosenReduceTo]);

  useEffect(() => {
    if (reductionTypeOptions.length) {
      setNoReductionsType(false);
      setReductionType("");
    } else {
      setNoReductionsType(true);
      setReductionType(noReductionsTypeMessage);
    }
  }, [reductionTypeOptions]);

  return (
    <Autocomplete
      style={{ width: "100%" }}
      disabled={noReductionsType}
      value={reductionType}
      onChange={(event, newValue) => {
        setReductionType(newValue);
        setChosenReductionType(newValue);
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="search-bar"
      options={reductionTypeOptions}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === "string") {
          let reductions = option.split("-");
          reductions = reductions.map((r) => {
            return reductionNameMap.get(r) ?? r;
          });
          let reductionName = "";
          reductions.forEach((r) => (reductionName += r + " - "));
          return reductionName.slice(0, reductionName.lastIndexOf(" - "));
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
          InputProps={noReductionsType ? { ...params.InputProps, style: { fontSize: 12 } } : { ...params.InputProps }}
        />
      )}
    />
  );
}
