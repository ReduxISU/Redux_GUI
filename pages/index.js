//redux.aws.cose.isu.edu/testpage
//testpage.js
/**
 * This is the main page for the Redux Application. All active components are children (in the heirarchy) of this parent react component.
 *
 *
 */

import React from "react"; //React is implicitly imported
import QuantumCircuitVisualizer from "../components/Quantum/QuantumCircuitVisualizer.jsx";
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
import { useEffect, memo } from "react";
import { useUnload } from "../components/eventHandlers/handleUnload";
import ShareButton from "../components/widgets/ShareButton";
import { useHandleParameters } from "../components/eventHandlers/handleParameters";

const ProblemRowMemo = memo(ProblemRowReact);
const ReduceToRowMemo = memo(ReduceToRowReact);
const VisualizeRowMemo = memo(VisualizeRowReact);
const SolveRowMemo = memo(SolveRowReact);
const VerifyRowMemo = memo(VerifyRowReact);

//const reduxBaseUrl = 'http://redux.aws.cose.isu.edu:27000/';
const reduxBaseUrl = process.env.NEXT_PUBLIC_REDUX_BASE_URL; //redux url. Note the trailing slash
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

            <div className="p-2 col-example">
              <ProblemRowMemo url={reduxBaseUrl} {...problem} />
            </div>
            <div className="p-2 col-example">
              <ReduceToRowMemo url={reduxBaseUrl} {...problem} {...reducer} />
            </div>

            <div className="p-2 col-example">
              <VisualizeRowMemo
                url={reduxBaseUrl}
                {...problem}
                {...reducer}
                chosenSolver={solver.chosenSolver}
                defaultSolverMap={solver.defaultSolverMap}
                {...visualization}
              />
            </div>

            <div className="p-2 col-example">
              <SolveRowMemo
                url={reduxBaseUrl}
                {...problem}
                {...solver}
                chosenReduceTo={reducer.chosenReduceTo}
              />
            </div>

            <div className="p-2 col-example">
              <VerifyRowMemo url={reduxBaseUrl} {...problem} {...verifier} />
            </div>
          </div>
        </div>

        {/*<!-- /Container-->*/}

        {/* <footer className='fixed-bottom centered'> */}
        {/* </footer> */}
      </ThemeProvider>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="10vh"
        // marginTop={'25%'}
        //Tried to push the logo down with the margin
      >
        <Image src={isulogo} height={125} width={500}></Image>
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
      <QuantumCircuitVisualizer
        circuit={{
          qubits: 2,
          gates: [
            { type: "h", qubit: 0, t: 0 },
            { type: "x", qubit: 1, t: 1 },
            { type: "cnot", control: 0, target: 1, t: 2 },
          ],
        }}
      />
      <MainPageContent></MainPageContent>{" "}
      {/** Renders the actual contents of the page */}
    </>
  );
}
