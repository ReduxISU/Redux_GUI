/**
 * SearchBarSelectSolverV2.js
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
const noSolverMessage = " No solvers available. Please select a problem";

export default function SearchBarSelectSolverV2(props) {
  const [defaultSolver, setDefaultSolver] = useState("");
  const { problemName, solverNameMap, defaultSolverMap, setChosenSolver, solverOptions } = useContext(ProblemContext);
  const [noSolver, setNoSolvers] = useState(false);

  useEffect(() => {
    if (problemName === "" || problemName === null) {
      setNoSolvers(true);
      setDefaultSolver(noSolverMessage);
    } else {
      setNoSolvers(false);
      setDefaultSolver(defaultSolverMap.get(problemName)); // Matches file name with solver name
    }
  }, [problemName, defaultSolverMap]);

  return (
    <Autocomplete
      style={{ width: "100%" }}
      value={defaultSolver}
      disabled={noSolver}
      onChange={(event, newValue) => {
        setChosenSolver(newValue);
        setDefaultSolver(newValue);
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="search-bar"
      options={solverOptions}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === "string") {
          if (option === "CliqueBruteForce - via SipserReduceToCliqueStandard") {
            return "Clique Brute Force - via Sipser Clique Reduction";
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
        <TextField
          {...params}
          label={props.placeholder}
          InputProps={noSolver ? { ...params.InputProps, style: { fontSize: 12 } } : { ...params.InputProps }}
        />
      )}
    />
  );
}
