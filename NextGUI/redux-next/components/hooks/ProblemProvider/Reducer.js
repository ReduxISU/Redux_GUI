import { useGenericInfo, getRequest, getInfo } from "../ProblemProvider";
import React, { useEffect, useState } from "react";

export function useReducer(url, problemName, problemType) {
  const state = {};
  [state.reduceToOptions] = useReduceToOptions(url, problemName, problemType);
  [state.chosenReduceTo, state.setChosenReduceTo] = useChosenReduceTo(problemName, state.reduceToOptions);
  [state.reductionNameMap] = useReductionNameMap(url, problemName, state.chosenReduceTo);
  [state.reductionTypeOptions] = useReductionTypeOptions(url, problemName, problemType, state.chosenReduceTo);
  [state.chosenReductionType, state.setChosenReductionType] = useChosenReductionType(
    problemName,
    state.chosenReduceTo,
    state.reductionTypeOptions
  );
  [state.reducedInstance, state.setReducedInstance] = useState("");
  return state;
}

export function useReducerInfo(url, reducer) {
  return useGenericInfo(url, (reducer ?? "").split("-")[0]);
}

function useReduceToOptions(url, problemName, problemType) {
  const [reduceToOptions, setReduceToOptions] = useState([]);

  useEffect(() => {
    if (problemName) {
      const fullUrl =
        url +
        "Navigation/NPC_NavGraph/availableReductions/" +
        "?chosenProblem=" +
        problemName +
        "&problemType=" +
        problemType;

      initializeList(fullUrl);
    } else {
      setReduceToOptions([]);
    }
  }, [problemName]);

  function initializeList(url) {
    const req = getRequest(url);
    req
      .then((data) => {
        setReduceToOptions(data);
      })
      .catch((error) => console.log("GET REQUEST FAILED SELECT REDUCE TO"));
  }

  // function initializeProblemJson(arr) {
  //   // var elementChosen = false;
  //   arr.map(function (element, index, array) {
  //     if (!problemJson.includes(element)) {
  //       if (element === "CLIQUE" && problemName === "SAT3") {
  //         // stateVal = element;
  //         setChosenReduceTo(element);
  //         setReduceTo(element);
  //         elementChosen = true;
  //       } else if (problemName === "CLIQUE" && element === "VERTEXCOVER") {
  //         setChosenReduceTo(element);
  //         setReduceTo(element);
  //         elementChosen = true;
  //       }
  //       if (!elementChosen) {
  //         setChosenReduceTo(element);
  //         setReduceTo(element);
  //       }
  //       problemJson.push(element);
  //     }
  //   }, 80);
  // }

  return [reduceToOptions, setReduceToOptions];
}

function useReductionTypeOptions(url, problemName, problemType, chosenReduceTo) {
  const [reductionTypeOptions, setReductionTypeOptions] = useState([]);

  useEffect(() => {
    if (chosenReduceTo) {
      const fullUrl =
        url +
        "Navigation/NPC_NavGraph/reductionPath/" +
        "?reducingFrom=" +
        problemName +
        "&reducingTo=" +
        chosenReduceTo +
        "&problemType=" +
        problemType;

      initializeList(fullUrl);
    } else {
      setReductionTypeOptions([]);
    }
  }, [chosenReduceTo]);

  function initializeProblemJson(arr) {
    let path = "";
    arr.map((reduction) => {
      path += reduction[0] + "-";
    });
    setReductionTypeOptions([path.slice(0, -1)]);

    // if (arr.length == 1) {
    //   arr = arr[0];
    //   arr.map(function (element, index, array) {
    //     if (!problemJson.includes(element)) {
    //       // if (element === "SipserReduceToCliqueStandard" && chosenReduceTo === "CLIQUE") {
    //       //   setChosenReductionType(element);
    //       //   setReductionType("Sipser's Clique Reduction");

    //       //   requestReducedInstance(props.url, element, problemInstance)
    //       //     .then((data) => {
    //       //       // propNo reduction method available. Please choose a reduce-tos.setInstance(data.reductionTo.instance);
    //       //       setReducedInstance(data.reductionTo.instance);
    //       //     })
    //       //     .catch((error) => console.log("REDUCTION FAILED, one or more properties was invalid"));
    //       // }

    //       // // Auto populate "select reduction" field with sipserReduceToVC when reducing from Clique to Vertex Cover
    //       // else if (element === "sipserReduceToVC" && chosenReduceTo === "VERTEXCOVER") {
    //       //   setChosenReductionType(element);
    //       //   setReductionType("Sipser's Vertex Cover Reduction");
    //       //   requestReducedInstance(props.url, element, problemInstance)
    //       //     .then((data) => {
    //       //       // props.setInstance(data.reductionTo.instance);
    //       //       setReducedInstance(data.reductionTo.instance);
    //       //     })
    //       //     .catch((error) => console.log("REDUCTION FAILED, one or more properties was invalid"));
    //       // }
    //       setChosenReductionType(element);
    //       problemJson.push(element);
    //     }
    //   }, 80);
    // } else {
    //   let path = "";
    //   arr.map((reduction) => {
    //     path += reduction[0] + "-";
    //   });
    //   // if (path === "SipserReduceToCliqueStandard-sipserReduceToVC-" && chosenReduceTo === "VERTEXCOVER") {
    //   //   setChosenReductionType(path.slice(0, -1));
    //   //   setReductionType("Sipser's Clique Reduction - Sipser's Vertex Cover Reduction");
    //   // }
    //   problemJson.push(path.slice(0, -1));
    // }
  }

  function initializeList(url) {
    if (chosenReduceTo !== "") {
      const req = getRequest(url);
      req
        .then((data) => {
          initializeProblemJson(data);
        })
        .catch((error) => console.log("GET REQUEST FAILED SEARCHBAR SELECT REDUCTION TYPE"));
    }
  }

  // async function requestReducedInstance(url, reductionName, reduceFrom) {
  //   var parsedInstance = reduceFrom.replaceAll("&", "%26");

  //   return await fetch(url + reductionName + "/reduce?" + "problemInstance=" + parsedInstance).then((resp) => {
  //     if (resp.ok) {
  //       return resp.json();
  //     }
  //   });
  // }

  return [reductionTypeOptions, setReductionTypeOptions];
}

function useChosenReductionType(problemName, chosenReduceTo, reductionTypeOptions) {
  const [chosenReductionType, setChosenReductionType] = useState("");

  useEffect(() => {
    setChosenReductionType("");
  }, [problemName, chosenReduceTo]);

  useEffect(() => {
    if (!reductionTypeOptions.length || reductionTypeOptions[0] === "") {
      setChosenReductionType("");
    }
  }, [reductionTypeOptions]);

  return [chosenReductionType, setChosenReductionType];
}

function useChosenReduceTo(problemName, reduceToOptions) {
  const [chosenReduceTo, setChosenReduceTo] = useState("");

  useEffect(() => {
    setChosenReduceTo("");
  }, [problemName]);

  useEffect(() => {
    if (!reduceToOptions.length) {
      setChosenReduceTo("");
    }
  }, [reduceToOptions]);

  return [chosenReduceTo, setChosenReduceTo];
}

function useReductionNameMap(url, problemName, chosenReduceTo) {
  const [reductionNameMap, setReductionNameMap] = useState(new Map());

  useEffect(() => {
    if (chosenReduceTo) {
      requestReductionNameMap(url, problemName, chosenReduceTo).then((reductionMap) => {
        setReductionNameMap(reductionMap);
      });
    } else {
      setReductionNameMap(new Map());
    }
  }, [chosenReduceTo]);

  // The following the functions are used to set the reduction names
  async function requestReductionNameMap(url, problemFrom, problemTo) {
    let map = new Map();
    const data = await getAvailableReductions(url, problemFrom, problemTo).catch((error) =>
      console.log("SOLUTIONS REQUEST FAILED")
    );
    for (const r of data) {
      for (const reduction of r) {
        const info = await getInfo(url, reduction).catch((error) => console.log("SOLVER INFO REQUEST FAILED"));
        map.set(reduction, info.reductionName);
      }
    }
    return map;
  }

  async function getAvailableReductions(url, problemFrom, problemTo) {
    return await fetch(
      url + `Navigation/NPC_NavGraph/reductionPath/?reducingFrom=${problemFrom}&reducingTo=${problemTo}&problemType=NPC`
    ).then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
    });
  }

  return [reductionNameMap, setReductionNameMap];
}
