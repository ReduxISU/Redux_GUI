/**
 * Functionality for interacting with the backend Redux API.
 * This is a reusable, stand-alone module.
 */

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
  let preparedFrom = problemFrom.replaceAll("&", "%26");
  let preparedTo = problemTo.replaceAll("&", "%26");

  return await fetchJson(
    `${url}${reduction}/mapSolution?problemFrom=${preparedFrom}&problemTo=${preparedTo}&problemFromSolution=${solution}`,
    () => `${reduction} MAPPED SOLUTION REQUEST FAILED`
  );
}

/**
 * This function is a temporary solution for validating user input until it is ported to the Redux API.
 * @returns `true` if the specified verifier certificate is valid.
 */
function isCertificateValid(problem, certificate) {
  var cleanInput = certificate.replace(new RegExp(/[( )]/g), ""); // Strips spaces and ()
  cleanInput = cleanInput.replaceAll(":", "=");
  var regexFormat = /[^,=:!{}\w]/; // Checks for special characters not including ,=:!{}
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
 * @returns the verified `instance` results from the specified `verifier`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestVerifiedInstance(url, problem, verifier, instance, certificate) {
  // Temporary solution until certificate validation is moved to the Redux API
  if (!isCertificateValid(problem, certificate)) {
    return "Invalid Input"
  }

  var preparedInstance = instance.replaceAll("&", "%26");

  return await fetchJson(
    `${url}${verifier}/verify?problemInstance=${preparedInstance}&certificate=${certificate}`,
    () => `${verifier} VERIFIED INSTANCE REQUEST FAILED`
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

    const parsedInstanceSat = instance.replaceAll("&", "%26");
    const parsedInstanceClique = reduction.reductionTo.instance.replaceAll("&", "%26");
    const tempUrl = `${url}SipserReduceToCliqueStandard/reverseMappedSolution?problemFrom=${parsedInstanceSat}&problemTo=${parsedInstanceClique}&problemToSolution=${solution}`;
    const mappedSolution = await fetchJson(tempUrl, "TRANSITIVE SOLVED REQUEST FAILED");

    return mappedSolution;
  } else {
    return await requestSolvedInstance(url, solver, instance);
  }
}

/**
 * @returns the solved `instance` from the specified `solver`.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestSolvedInstance(url, solver, instance) {
  var preparedInstance = instance.replaceAll("&", "%26");

  return await fetchJson(
    `${url}${solver}/solve?problemInstance=${preparedInstance}`,
    () => `${solver} SOLVED INSTANCE REQUEST FAILED`
  );
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
  var preparedInstance = instance.replaceAll("&", "%26");

  return await fetchJson(
    `${url}${reduction}/reduce?problemInstance=${preparedInstance}`,
    () => `${reduction} REDUCED INSTANCE REQUEST FAILED`
  );
}

/**
 * @returns information regarding the problem/solver/verifier.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestInfo(url, apiCall) {
  return await fetchJson(`${url}${apiCall}/info`, () => `${apiCall} INFO REQUEST FAILED`);
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
  var preparedInstance = instance.replaceAll("&", "%26");

  return await fetchJson(
    `${url}${problem}Generic/instance?problemInstance=${preparedInstance}`,
    () => `${problem} PROBLEM GENERIC INSTANCE REQUEST FAILED`
  );
}

/**
 * @returns a generic default instance of the problem information.
 * @returns `undefined` on failure and logs the error.
 */
export async function requestProblemGeneric(url, problem) {
  return await fetchJson(`${url}${problem}Generic`, () => `${problem} GENERIC REQUEST FAILED`);
}

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
