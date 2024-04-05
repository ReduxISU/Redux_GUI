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

import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { ProblemContext } from '../../contexts/ProblemProvider';
// import  ProblemParser from '../../Tools/ProblemParser';
import React, { useContext, useState, useEffect } from 'react';
const filter = createFilterOptions();
// var initialized = false;
// var defaultProblem = null;
//our problems to be shown
var problemJson = [];

export default function SearchBarProblemType(props) {
  const { problem, problemName, setProblemName, solverNameMap, setSolverNameMap, verifierNameMap, setVerifierNameMap, problemNameMap, setProblemNameMap, defaultSolverMap, setDefaultSolverMap, defaultVerifierMap, setDefaultVerifierMap } = useContext(ProblemContext); //passed in context
  // const [defaultProblemName, setDefaultProblemName] = useState('');

  // need to change the url to the live site

  useEffect(() => {
    initializeList(`${props.url}navigation/NPC_ProblemsRefactor/`);
  }, [])

  return (
    <Autocomplete
      style={{ width: "100%" }}
      //defaultValue={defaultProblem !== null ?  props.setTestName : null}
      value={problemNameMap.get(problemName) || ''}
      onChange={(event, newValue) => {
        newValue = getKeyByValue(problemNameMap, newValue);
        if (typeof newValue === 'string') {
          setProblemName(
            newValue
          );
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
      options={Array.from(problemNameMap, ([problem, label]) => (label)).sort()}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        return ''
      }}
      sx={{ width: 300 }}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label={props.placeholder} />
      )}
    />
  );



  /**
   * converts asynchronous fetch request into synchronous call that sets the dropdown labels by updating our array
   * we make sure to avoid duplicates
   * @param {*} arr 
   */
  function initializeProblemJson(arr) {
    arr.map(function (element, index, array) {
      if (!problemJson.includes(element)) {


        if (element === 'SAT3') {
          //setDefaultProblemName(element);
          setProblemName(element);
          props.setTestName(element);
        }

        problemJson.push(element)
      }
    }, 80);
  }

  /**
   * 
   * @param {*} url passed in url
   * @returns a promise with the json
   */
  async function getRequest(url) {
    const promise = await fetch(url).then(result => {
      return result.json()
    })
    return promise;

  }
  /**
   * gets the data from our request and attempts to set our labels by calling initializeProblemJson
   * 
   */
  function initializeList(url) {
    if (problemJson.length === 0) {
      const req = getRequest(url);
      req.then(data => {
        initializeProblemJson(data)
        requestProblemNameMap(props.url, data).then(problemNames => {
          setProblemNameMap(problemNames);
        })

        requestDefaultSolverMap(props.url, data).then(defaultSolverNames => {
          requestDefaultSolverFileMap(props.url, data, defaultSolverNames).then(defaultSolverFileNames => {
            setDefaultSolverMap(defaultSolverFileNames);
          })
        })

        requestDefaultVerifierMap(props.url, data).then(defaultVerifierNames => {
          requestDefaultVerifierFileMap(props.url, data, defaultVerifierNames).then(defaultVerifierFileNames => {
            setDefaultVerifierMap(defaultVerifierFileNames);
          })
        })

        requestVerifierNameMap(props.url, data).then(verifierMap => {
          setVerifierNameMap(verifierMap);
        })
        
        requestSolverNameMap(props.url, data).then(solverMap => {
          setSolverNameMap(solverMap);
        })
      })
        .catch((error) => console.log("GET REQUEST FAILED", error));

    }

    // initialized = true;
  }

  //The requestProblemNameMap sets the problem names
  async function requestProblemNameMap(url, problems) {
    let map = new Map();
    problems.forEach(problem => {
      getProblemInfo(url, problem + "Generic").then(info => {
        map.set(problem, info.problemName)
      }).catch(error => console.log("PROBLEM INFO REQUEST FAILED"))
    })
    return map;
  }

  //The requestDefaultSolverMap sets the solver names
  async function requestDefaultSolverMap(url, problems) {
    let map = new Map();
    problems.forEach(problem => {
      getProblemInfo(url, problem + "Generic").then(info => {
        map.set(problem, info.defaultSolver.solverName)
      }).catch(error => console.log("PROBLEM INFO REQUEST FAILED"))
    })
    return map;
  }

  //The requestDefaultSolverFileMap sets the solver names by the file name
  async function requestDefaultSolverFileMap(url, problems, defaultSolverNames) {
    let map = new Map();
    problems.forEach(async problem => {
      await getAvailableSolvers(url, problem).then(data => {
        data.forEach((s) => {
          let solver = s.split(" ")[0];
          getInfo(url, solver).then(info => {
            if (Array.from(defaultSolverNames.values()).includes(info.solverName)) {
              map.set(problem, s);
            }
          }).catch(error => console.log("SOLVER INFO REQUEST FAILED"))
        })
      }).catch(error => console.log("SOLUTIONS REQUEST FAILED"));
    })
    return map;
  }


  //The requestDefaultVerifierMap sets the verifier names
  async function requestDefaultVerifierMap(url, problems) {
    let map = new Map();
    problems.forEach(problem => {
      getProblemInfo(url, problem + "Generic").then(info => {
        map.set(problem, info.defaultVerifier.verifierName)
      }).catch(error => console.log("PROBLEM INFO REQUEST FAILED"))
    })
    return map;
  }
  //The requestDefaultVerifierFileMap sets the verifier names by the file name
  async function requestDefaultVerifierFileMap(url, problems, defaultVerifierNames) {
    let map = new Map();
    problems.forEach(async problem => {
      await getAvailableVerifiers(url, problem).then(data => {
        data.forEach((v) => {
          let verifier = v.split(" ")[0];
          getInfo(url, verifier).then(info => {
            if (Array.from(defaultVerifierNames.values()).includes(info.verifierName)) {
              map.set(problem, v);
            }
          }).catch(error => console.log("SOLVER INFO REQUEST FAILED"))
        })
      }).catch(error => console.log("SOLUTIONS REQUEST FAILED"));
    })
    return map;
  }

  async function getProblemInfo(url, problem) {
    return await fetch(url + `${problem}`).then(resp => {

      if (resp.ok) {
        return resp.json();
      }
    })
  }

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

  //The following the functions are used to set the solver names
  async function requestSolverNameMap(url, problems) {
    let map = new Map();
    for (const problem of problems) {
    await getAvailableSolvers(url, problem).then(data => {
      data.forEach((s) => {
        let solver = s.split(" ")[0];
        getInfo(url, solver).then(info => {
          map.set(s, info.solverName);
        }).catch(error => console.log("SOLVER INFO REQUEST FAILED"))
      })
    }).catch(error => console.log("SOLUTIONS REQUEST FAILED"));
  }
    return map;
  }

  async function getAvailableSolvers(url, problem) {
    return await fetch(url + `Navigation/Problem_SolversRefactor/?chosenProblem=${problem}&problemType=NPC`).then(resp => {
      if (resp.ok) {
        return resp.json();
      }
    })
  }

  async function getInfo(url, apiCall) {
    return await fetch(url + `${apiCall}/info`).then(resp => {

      if (resp.ok) {
        return resp.json();
      }
    })
  }

  //The following the functions are used to set the verifier names
  async function requestVerifierNameMap(url, problems) {
    let map = new Map();
    for (const problem of problems) {
    await getAvailableVerifiers(url, problem).then(data => {
      data.forEach((v) => {
        let verifier = v;
        getInfo(url, verifier).then(info => {
          map.set(verifier, info.verifierName);
        }).catch(error => console.log("VERIFIER INFO REQUEST FAILED"))
      })
    }).catch(error => console.log("VERIFIER REQUEST FAILED"));
  }
    return map;
  }

  async function getAvailableVerifiers(url, problem) {
    return await fetch(url + `Navigation/Problem_VerifiersRefactor/?chosenProblem=${problem}&problemType=NPC`).then(resp => {
      if (resp.ok) {
        return resp.json();
      }
    })
  }



}
