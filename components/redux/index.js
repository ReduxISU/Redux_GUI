/**
 * Functionality for interacting with the backend Redux API.
 * This is a reusable, stand-alone module.
 */

/**
 * @param failMsg The message that is logged on failure. Message is lazily evaluated.
 * @returns the JSON format of the fetch request.
 * @returns `undefined` on failure and logs the error.
 */
async function fetchJson(url, failMsg) {
  try {
    const resp = await fetch(url);
    if (resp.ok) {
      return await resp.json();
    }
    console.log(`${failMsg()}: ${resp.status} (${resp.statusText})`);
  } catch (error) {
    console.log(`${failMsg()}: `, error);
  }
  return undefined;
}

/**
 * @param failMsg The message that is logged on failure. Message is lazily evaluated.
 * @returns the JSON format of the fetch request.
 * @returns `undefined` on failure and logs the error.
 */
async function fetchPostJson(url, body, failMsg) {
  try {
    const resp = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      }
    });
    if (resp.ok) {
      return await resp.json();
    }
    console.log(`${failMsg()}: ${resp.status} (${resp.statusText})`);
  } catch (error) {
    console.log(`${failMsg()}: `, error);
  }
  return undefined;
}

/**
 * This function is a temporary solution for validating user input until it is ported to the Redux API.
 * @returns `true` if the specified verifier certificate is valid.
 */
function isCertificateValid(problem, certificate) {
  var cleanInput = certificate.replace(new RegExp(/[( )]/g), ""); // Strips spaces and ()
  cleanInput = cleanInput.replaceAll(":", "=");
  var regexFormat = /[^-.,=:!{}\w]/; // Checks for special characters not including -.,=:!{}
  if (regexFormat.test(cleanInput) == true) {
    // Invalid characters found, warn user.
    return false;
  } else {
    var validUserInput = true;
    if (problem == "SAT" || problem == "SAT3") {
      var clauses = cleanInput.split(",");
      const regex = /[^!\w]/; // Only allow alphanumber and !
      const notBooleanRegex = /[^true$|^True$|^t$|^T$|^false$|^False$|^F$|^f$]/;
      clauses.forEach((clause) => {
        const singleClause = clause.split("=");

        if (singleClause.length !== 2 || regex.test(singleClause[0] == true)) {
          // No boolean assigned to variable.
          validUserInput = false;
          return false;
        }

        if (notBooleanRegex.test(singleClause[1] == true)) {
          // boolean is not in the form True/true/T/F...
          validUserInput = false;
          return false;
        } else {
          // Replace True/true/t with T and False/false/f with F
          singleClause[1] = singleClause[1].replace(new RegExp(/^false$|^False$|^f$/g), "F");
          singleClause[1] = singleClause[1].replace(new RegExp(/^True$|^true$|^t$/g), "T");
          validUserInput = true; // valid input
        }
      });
    }
    return validUserInput;
  }
}

/**
 * @returns the gadget map of ids based on an `instance` from the specified `reduction`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestGadgetMap(url, reduction, instance) {
  return await fetchPostJson(
    `${url}ProblemProvider/gadgets?reduction=${reduction}`,
    instance,
    () => `${reduction} MAP GADGETS REQUEST FAILED`
  );
}

export async function processReductions(url, reductionPath, instance) {
  const reductions = reductionPath.split("-").map(r => r.trim());

  let currentInstance = instance;
  let currentMap = null;

  for (const reduction of reductions) {
    const nextMap = await requestGadgetMap(url, reduction, currentInstance);
    const nextInstance = await requestReducedInstanceFromPath(url, reduction, currentInstance);

    // compose A→B and B→C into A→C
    if (currentMap) {
      currentMap = composeMappings(currentMap, nextMap);
    } else {
      currentMap = nextMap;
    }

    currentInstance = nextInstance;
  }
  return currentMap;
}

/**
 * Compose two gadget maps: map1: A→B and map2: B→C → result: A→C.
 */
function composeMappings(map1, map2) {
  const composed = [];

  for (const entry1 of map1) {
    const linkedTo = new Set();

    for (const b of entry1.reductionToIds) {
      for (const entry2 of map2) {
        if (entry2.reductionFromIds.includes(b)) {
          entry2.reductionToIds.forEach(c => linkedTo.add(c));
        }
      }
    }

    composed.push({
      color: entry1.color,
      reductionFromIds: entry1.reductionFromIds,
      reductionToIds: Array.from(linkedTo),
    });
  }

  return composed;
}

/**
 * Give unique IDs to elements between the two instances to remove collision
 */
export function makeIdsUnique(gadgets) {
  if (!gadgets || !Array.isArray(gadgets)) {
    return { gadgets: [], fromIdMap: new Map(), toIdMap: new Map() };
  }

  const fromIdMap = new Map();
  const toIdMap = new Map();

  let nextFromId = 0;
  let nextToId = 0;

  // First pass: map reductionFromIds safely
  gadgets.forEach(gadget => {
    (gadget.reductionFromIds || []).forEach(oldId => {
      const key = String(oldId);
      if (!fromIdMap.has(key)) {
        fromIdMap.set(key, String(nextFromId++));
      }
    });
  });

  // Second pass: map reductionToIds safely
  nextToId = nextFromId;
  gadgets.forEach(gadget => {
    (gadget.reductionToIds || []).forEach(oldId => {
      const key = String(oldId);
      if (!toIdMap.has(key)) {
        toIdMap.set(key, String(nextToId++));
      }
    });
  });

  // Third pass: create new gadgets array safely
  const updatedGadgets = gadgets.map(gadget => ({
    ...gadget,
    reductionFromIds: (gadget.reductionFromIds || []).map(id => fromIdMap.get(String(id)) || String(id)),
    reductionToIds: (gadget.reductionToIds || []).map(id => toIdMap.get(String(id)) || String(id)),
  }));

  return { gadgets: updatedGadgets, fromIdMap, toIdMap };
}


/**
 * Remap IDs in gadgets, clauses, or literals based on the provided idMap.
 * Only touches properties that exist: id, reductionFromIds, reductionToIds.
 */
export function remapIdsDeep(obj, idMap) {
  if (!obj || typeof obj !== "object") return obj;

  // Copy object
  const result = Array.isArray(obj) ? [] : {};

  for (const [key, val] of Object.entries(obj)) {
    if (key === "id" && idMap.has(String(val))) {
      result[key] = String(idMap.get(String(val)));
    } else if ((key === "reductionFromIds" || key === "reductionToIds") && Array.isArray(val)) {
      result[key] = val.map(v => String(idMap.get(String(v)) ?? v));
    } else if (Array.isArray(val)) {
      // only recurse for arrays
      result[key] = val.map(v => remapIdsDeep(v, idMap));
    } else if (val && typeof val === "object") {
      result[key] = remapIdsDeep(val, idMap);
    } else {
      result[key] = val;
    }
  }

  return result;
}

/**
 * @returns information regarding the problem/solver/verifier.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestInfo(url, apiCall) {
  return await fetchJson(`${url}ProblemProvider/info?interface=${apiCall}`, () => `${apiCall} INFO REQUEST FAILED`);
}

/**
 * @param reductionPath a hyphen (`-`) separated list of reductions to perform on the instance.
 * @returns the reduced `instance` list of reductions, the reduction path.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReducedInstanceFromPath(url, reductionPath, instance) {
  for (const path of reductionPath.split("-")) {
    const reducedInst = await requestReducedInstance(url, path, instance);
    if (!reducedInst) {
      console.log(`${reductionPath} AT ${path} REDUCED INSTANCE FROM PATH REQUEST FAILED`);
      return instance;
    }
    instance = reducedInst.reductionTo.instance;
  }
  return instance;
}

/**
 * @returns the reduced `instance` from the specified `reduction`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReducedInstance(url, reduction, instance) {
  return await fetchPostJson(
    `${url}ProblemProvider/reduce?reduction=${reduction}`,
    instance,
    () => `${reduction}  REDUCED INSTANCE REQUEST FAILED`
  );
}

/**
 * @returns information regarding the reduction.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReductionInfo(url, apiCall) {
  return await fetchJson(`${url}${apiCall}/info`, () => `${apiCall} INFO REQUEST FAILED`);
}

/**
 * @returns an array of problems that have implemented reductions from `problem`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReductionOptions(url, problem, problemType = "NPC") {
  return await fetchJson(
    `${url}Navigation/NPC_NavGraph/availableReductions/?chosenProblem=${problem}&problemType=${problemType}`,
    () => `${problem} REDUCTION OPTIONS REQUEST FAILED`
  );
}

/**
 * @returns the graph visualization of the reduced problem instance.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReductionVisualization(url, reduction, instance, solver) {
  return await fetchPostJson(
    `${url}ProblemProvider/visualizeReduction?reduction=${reduction}&solver=${solver}`,
    instance,
    () => `${reduction} VISUALIZE REQUEST FAILED`
  );
}

export async function processReductionVisualizations(url, reductionPath, instance, solver) {
  const reductions = reductionPath.split("-").map(r => r.trim());

  let currentInstance = instance;
  let solution = requestSolvedInstance(url, solver, currentInstance)
  let finalVisualization = null;

  for (const reduction of reductions) {
    finalVisualization = await requestReductionVisualization(url, reduction, currentInstance, solution);
    const info = await requestInfo(url, reduction, instance);
    currentInstance = info.reductionTo.defaultInstance;
    solution = requestMappedSolution(url, solution, currentInstance);
  }

  return finalVisualization;
}

/**
 * @param reductionPath a hyphen (`-`) separated list of reductions to perform on the instance.
 */
export async function requestMappedSolutionTransitive(url, reductionPath, problemInstance, solution) {
  let problemFrom = problemInstance;
  let mappedSolution = solution;
  for (const reduction of reductionPath.split("-")) {
    const reduced = await requestReducedInstance(url, reduction, problemFrom);
    if (!reduced) {
      console.log(`${reductionPath} AT ${reduction} REDUCTION FOR SOLUTION MAPPING REQUEST FAILED`);
      break;
    }
    const problemTo = reduced.reductionTo.instance;

    const solution = await requestMappedSolution(url, reduction, problemFrom, problemTo, mappedSolution);
    if (!solution) {
      console.log("SOLUTION MAPPING REQUEST FAILED");
      break;
    }
    mappedSolution = solution;

    problemFrom = problemTo;
  }
  return mappedSolution;
}

export async function requestMappedSolution(url, reduction, problemFrom, problemTo, solution) {
  return await fetchPostJson(
    `${url}${reduction}/mapSolution`,
    { problemFrom: problemFrom, problemTo: problemTo, problemFromSolution: solution },
    () => `${reduction} MAPPED SOLUTION REQUEST FAILED`
  );
}

/**
 * @returns an array of all implemented problems identifiers.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestProblems(url) {
  return await fetchJson(`${url}navigation/NPC_ProblemsRefactor/`, () => `PROBLEMS REQUEST FAILED`);
}

/**
 * @returns the generic instance of the `problem` with the given `instance`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestProblemGenericInstance(url, problem, instance) {
  return await fetchPostJson(
    `${url}ProblemProvider/problemInstance?problem=${problem}`,
    instance,
    () => `${problem} PROBLEM GENERIC INSTANCE REQUEST FAILED`
  );
}


/**
 * @returns an array of arrays of reductions implemented for reducing a problem to another problem.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestReductions(url, problemFrom, problemTo, problemType = "NPC") {
  return await fetchJson(
    `${url}Navigation/NPC_NavGraph/reductionPath/?reducingFrom=${problemFrom}&reducingTo=${problemTo}&problemType=${problemType}`,
    () => `${problemFrom} TO ${problemTo} REDUCTIONS REQUEST FAILED`
  );
}

/**
 * @returns the solved `instance` from the specified `solver`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestSolvedInstance(url, solver, instance) {
  return await fetchPostJson(
    `${url}ProblemProvider/solve?solver=${solver}`,
    instance,
    () => `${solver} SOLVED INSTANCE REQUEST FAILED`
  );
}

/**
 * Temporary solution to allow solving 3 SAT with a Clique solver.
 * All calls to this function should eventually be replace with `requestSolvedInstance`.
 * A verbose name was purposefully chosen as a reminder to fix this.
 * @returns the solved `instance` from the specified `solver`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestSolvedInstanceTemporarySat3CliqueSolver(url, solver, instance) {
  // NOTE - Caleb - the following is a temporary solution to allow sat3 to be solved using the clique solver
  // remove first if once this functionality is added for all problems, the else code block was the original
  // functionality
  if (solver == "CliqueBruteForce - via SipserReduceToCliqueStandard") {
    const reduction = await requestReducedInstance(url, "SipserReduceToCliqueStandard", instance);
    if (!reduction) {
      return undefined;
    }

    const solution = await requestSolvedInstance(url, "CliqueBruteForce", reduction.reductionTo.instance);
    if (!solution) {
      return undefined;
    }

    const mappedSolution = await fetchPostJson(
      `${url}SipserReduceToCliqueStandard/reverseMappedSolution`,
      { problemFrom: instance, problemTo: reduction.reductionTo.instance, problemFromSolution: solution },
      () => "TRANSITIVE SOLVED REQUEST FAILED"
    );

    return mappedSolution;
  } else {
    return await requestSolvedInstance(url, solver, instance);
  }
}

/**
 * @returns the solved graph visualization of the problem instance.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestSolvedVisualization(url, problem, instance, solution) {
  // TODO: convert to POST request for problem instance
  var preparedSolution = solution.replaceAll("&", "%26");
  var preparedInstance = instance.replaceAll("&", "%26");
  if (problem == "SipserReduceToCliqueStandard") {
    return await fetchJson(
      `${url}${problem}/solvedVisualization?problemInstance=${preparedInstance}&solution=${preparedSolution}`,
      () => `${problem} VISUALIZE REQUEST FAILED`
    );
  } else {
    return await fetchJson(
      `${url}${problem}Generic/solvedVisualization?problemInstance=${preparedInstance}&solution=${preparedSolution}`,
      () => `${problem} VISUALIZE REQUEST FAILED`
    );
  }
}

/**
 * @returns the `steps` from the specified `solver`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestSolverSteps(url, solver, instance) {
  return await fetchPostJson(
    `${url}ProlemProvider/steps?solver=${solver}`,
    instance,
    () => `${solver} SOLVED INSTANCE REQUEST FAILED`
  );
}

/**
 * @returns an array of solvers implemented for the `problem`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestSolvers(url, problem, problemType = "NPC") {
  return await fetchJson(
    `${url}Navigation/Problem_SolversRefactor/?chosenProblem=${problem}&problemType=${problemType}`,
    () => `${problem} SOLVERS REQUEST FAILED`
  );
}

/**
 * @returns an array of verifiers implemented for the `problem`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestVerifiers(url, problem, problemType = "NPC") {
  return await fetchJson(
    `${url}Navigation/Problem_VerifiersRefactor/?chosenProblem=${problem}&problemType=${problemType}`,
    () => `${problem} VERIFIERS REQUEST FAILED`
  );
}

/**
 * @returns the verified `instance` results from the specified `verifier`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestVerifiedInstance(url, problem, verifier, instance, certificate) {
  // Temporary solution until certificate validation is moved to the Redux API
  if (!isCertificateValid(problem, certificate)) {
    return "Invalid Input"
  }

  return await fetchPostJson(
    `${url}ProblemProvider/verify?verifier=${verifier}`,
    { problemInstance: instance, certificate: certificate },
    () => `${verifier} VERIFIED INSTANCE REQUEST FAILED`
  );
}

/**
 * @returns the graph visualization of the problem instance.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestVisualization(url, visualization, instance, solver) {
  return await fetchPostJson(
    `${url}ProblemProvider/visualize?visualization=${visualization}&solver=${solver}`,
    instance,
    () => `${visualization} VISUALIZE REQUEST FAILED`
  );
}

/**
 * @returns an array of visualizations implemented for the `problem`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestVisualizations(url, problem, problemType = "NPC") {
  return await fetchJson(
    `${url}Navigation/Problem_VisualizationsRefactor/?chosenProblem=${problem}&problemType=${problemType}`,
    () => `${problem} VISUALIZATIONS REQUEST FAILED`
  );
}
