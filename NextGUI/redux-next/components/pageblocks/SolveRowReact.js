/**
 * SolveRowReact.js
 *
 * This component does the real grunt work of the SolveRowReact component. It uses passed in props to style and provide default text for its objects,
 * uses the global state values for the problem name and instance, sets global state values pertaining to reduction, and has a variety of listeners and API calls.
 *
 * Essentialy, this is the brains of the SolveRowReact.js component and deals with the GUI's Solve "Row"
 * @author Alex Diviney
 */

import React from "react";
import { useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "@mui/material";

import { requestSolvedInstanceTemporarySat3CliqueSolver } from "../redux";
import PopoverTooltipClick from "../widgets/PopoverTooltipClick";
import { useSolverInfo } from "../hooks/ProblemProvider";
import ProblemSection from "../widgets/ProblemSection";
import SearchBarExtensible from "../widgets/SearchBarExtensible";

const ACCORDION_FORM_ONE = { placeHolder: "Select Solver" };
const BUTTON = { buttonText: "Solve" };
const CARD = { cardBodyText: "Solution:", cardHeaderText: "Solve" };
const TOOLTIP = {
  header: "Solver Information",
  formalDef: "Choose a type of solver to see information about it",
  info: "",
};
const THEME = { colors: { grey: "#424242", orange: "#d4441c" } };

export default function SolveRowReact({
  url,
  problemName,
  problemInstance,
  chosenSolver,
  setChosenSolver,
  solvedInstance,
  setSolvedInstance,
  solverOptions,
  solverNameMap,
  problemNameMap,
  chosenReduceTo,
}) {
  const solverInfo = useSolverInfo(url, chosenSolver);

  async function handleSolve() {
    setSolvedInstance(
      chosenSolver && problemInstance
        ? (await requestSolvedInstanceTemporarySat3CliqueSolver(url, chosenSolver, problemInstance)) ?? ""
        : ""
    );
  }

  return (
    <ProblemSection>
      <ProblemSection.Header title={CARD.cardHeaderText}>
        <SearchBarExtensible
          placeholder={ACCORDION_FORM_ONE.placeHolder}
          selected={chosenSolver}
          onSelect={setChosenSolver}
          options={solverOptions}
          optionsMap={solverNameMap}
          disabled={!problemName}
          disabledMessage={"No solvers available. Please select a problem."}
          extenderButtons={(input) => {
            const extender = (problem) => ({
              label: `Add new ${problemNameMap.get(problem)} solution algorithm "${input}"`,
              href: `${url}ProblemTemplate/?problemName=${input}`,
            });
            return !chosenReduceTo ? [extender(problemName)] : [extender(problemName), extender(chosenReduceTo)];
          }}
        />{" "}
        <PopoverTooltipClick
          toolTip={
            chosenSolver
              ? {
                  header: solverInfo.solverName ?? "",
                  formalDef: solverInfo.solverDefinition ?? "",
                  info: solverInfo.source ?? "",
                }
              : TOOLTIP
          }
        ></PopoverTooltipClick>
      </ProblemSection.Header>

      <ProblemSection.Body>
        {CARD.cardBodyText + " " + solvedInstance}
        <div className="submitButton">
          <Button
            size="large"
            color="white"
            style={{ backgroundColor: THEME.colors.grey }}
            onClick={handleSolve}
            disabled={!chosenSolver}
          >
            {BUTTON.buttonText}
          </Button>
        </div>
      </ProblemSection.Body>
    </ProblemSection>
  );
}
