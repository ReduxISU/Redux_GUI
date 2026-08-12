//redux.aws.cose.isu.edu/testpage
//testpage.js
/**
 * This is the main page for the Redux Application. All active components are children (in the heirarchy) of this parent react component.
 *
 *
 */

import React from "react"; //React is implicitly imported
import ProblemRowReact from "../components/pageblocks/ProblemRowReact";
import ReduceToRowReact from "../components/pageblocks/ReduceToRowReact";
import VisualizeRowReact from "../components/pageblocks/VisualizeRowReact";
import SolveRowReact from "../components/pageblocks/SolveRowReact";
import VerifyRowReact from "../components/pageblocks/VerifyRowReact";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import isulogo from "../components/images/ISULogo.png";
import ResponsiveAppBar from "../components/widgets/ResponsiveAppBar";
import {
  Box,
  createTheme,
  Grid,
  ThemeProvider,
  Typograph,
} from "@mui/material";
import { Container } from "react-bootstrap";
import { useProblemProvider } from "../components/hooks/ProblemProvider";
import { useEffect, memo, useState } from "react"; // CHANGED: added useState for row order
import { useUnload } from "../components/eventHandlers/handleUnload";
import ShareButton from "../components/widgets/ShareButton";
import { useHandleParameters } from "../components/eventHandlers/handleParameters";

const SHOW_QUANTUM_VIS = false; //Flag to show a quantum circuit visualizer (sandbox feature)
const ProblemRowMemo = memo(ProblemRowReact);
const ReduceToRowMemo = memo(ReduceToRowReact);
const VisualizeRowMemo = memo(VisualizeRowReact);
const SolveRowMemo = memo(SolveRowReact);
const VerifyRowMemo = memo(VerifyRowReact);

const reduxBaseUrl = '/api/redux/';
/**
 * Generates the actual page contents
 *
 * @returns The contents of the page (jsx)
 */
function MainPageContent() {
  const imgStyle = { textAlign: "center" };

  const theme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#424242",
        lGray: "#f3f3f3",
        contrastText: "#fff", //button text white instead of black
      },
      secondary: {
        main: "#f47920",
      },
      white: {
        main: "#ffffff",
      },
    },
    // overrides: {
    //   MuiButton: {
    //     raisedPrimary: {
    //       color: 'white',
    //       contrastText: "#fff" //button text white instead of black

    //     },
    //   },
    // }
  });

  //useHandleParameters();

  const { problem, solver, verifier, reducer, visualization } =
    useProblemProvider(reduxBaseUrl);

  //useUnload(problem, solver, verifier, reducer);

  // ==================== CHANGED: added drag-and-drop state and handlers ====================
  const [rowOrder, setRowOrder] = useState([
    "problem",
    "reduce",
    "visualize",
    "solve",
    "verify",
  ]);

  const rowMap = {
    problem: <ProblemRowMemo url={reduxBaseUrl} {...problem} />,
    reduce: <ReduceToRowMemo url={reduxBaseUrl} {...problem} {...reducer} />,
    visualize: (
      <VisualizeRowMemo
        url={reduxBaseUrl}
        {...problem}
        {...reducer}
        chosenSolver={solver.chosenSolver}
        defaultSolverMap={solver.defaultSolverMap}
        {...visualization}
      />
    ),
    solve: (
      <SolveRowMemo
        url={reduxBaseUrl}
        {...problem}
        {...solver}
        chosenReduceTo={reducer.chosenReduceTo}
      />
    ),
    verify: <VerifyRowMemo url={reduxBaseUrl} {...problem} {...verifier} />,
  };

  function handleDragStart(e, key) {
    e.dataTransfer.setData("text/plain", key);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e, targetKey) {
    e.preventDefault();
    const draggedKey = e.dataTransfer.getData("text/plain");
    if (draggedKey === targetKey) return;

    setRowOrder((prev) => {
      const next = prev.filter((k) => k !== draggedKey);
      const targetIndex = next.indexOf(targetKey);
      next.splice(targetIndex, 0, draggedKey);
      return next;
    });
  }
  // ==================== END CHANGED ====================

  return (
    <>
      <ThemeProvider theme={theme}>
        <ResponsiveAppBar></ResponsiveAppBar>

        <div className="container-fluid">
          {/** This is an artifact from the old bootstrap code, may be deprecated */}
          <div className="d-flex flex-column">
            <div className="p-2 col-example">
              <ShareButton
                problem={problem}
                solver={solver}
                verifier={verifier}
                reducer={reducer}
              />
            </div>

            {/* ==================== CHANGED: whole row is draggable, no handle indicator ==================== */}
            {rowOrder.map((key) => (
              <div
                key={key}
                draggable
                onDragStart={(e) => handleDragStart(e, key)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, key)}
                className="p-2 col-example"
                style={{ cursor: "grab" }}
              >
                {rowMap[key]}
              </div>
            ))}
            {/* ==================== END CHANGED ====================
                 Previously five separate hardcoded divs (Problem/ReduceTo/Visualize/Solve/Verify)
                 in a fixed order. Now generated from rowOrder + rowMap, each row itself draggable. */}
          </div>
        </div>

        {/*<!-- /Container-->*/}

        {/* <footer className='fixed-bottom centered'> */}
        {/* </footer> */}
      </ThemeProvider>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "10vh",
          // marginTop: '25%',
        }}
      >
        <Image src={isulogo} height={125} width={500} alt="ISU logo"></Image>
      </Box>
    </>
  );
}

/**
 * Renders the actual page contents (this is the default export and is seen by next.js due to folder structure and broadcasted)
 * @returns A rendered page
 */
export default function MainPage() {
  return (
    <>
      <MainPageContent></MainPageContent> 
    </>
  );
}