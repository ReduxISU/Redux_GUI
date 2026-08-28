//redux.aws.cose.isu.edu/testpage
//testpage.js
/**
 * This is the main page for the Redux Application. All active components are children (in the heirarchy) of this parent react component.
 *
 *
 */

import React from "react"; //React is implicitly imported
import Button from "react-bootstrap/Button";
import ProblemRowReact from "../components/pageblocks/ProblemRowReact";
import ReduceToRowReact from "../components/pageblocks/ReduceToRowReact";
import SolveRowReact from "../components/pageblocks/SolveRowReact";
import VerifyRowReact from "../components/pageblocks/VerifyRowReact";
import VisualizeRowReact from "../components/pageblocks/VisualizeRowReact";
import "bootstrap/dist/css/bootstrap.min.css";

import {
  closestCenter,
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, createTheme, Grid, ThemeProvider, Typograph } from "@mui/material";
import Image from "next/image";
import { memo, useEffect, useState } from "react"; // CHANGED: added useState for row order
import { Container } from "react-bootstrap";
import { useHandleParameters } from "../components/eventHandlers/handleParameters";
import { useUnload } from "../components/eventHandlers/handleUnload";
import { useProblemProvider } from "../components/hooks/ProblemProvider";
import isulogo from "../components/images/ISULogo.png";
import TourLauncher from "../components/tour/TourLauncher";
import ResponsiveAppBar from "../components/widgets/ResponsiveAppBar";
import ShareButton from "../components/widgets/ShareButton";

const SHOW_QUANTUM_VIS = false; //Flag to show a quantum circuit visualizer (sandbox feature)
const ProblemRowMemo = memo(ProblemRowReact);
const ReduceToRowMemo = memo(ReduceToRowReact);
const VisualizeRowMemo = memo(VisualizeRowReact);
const SolveRowMemo = memo(SolveRowReact);
const VerifyRowMemo = memo(VerifyRowReact);

const reduxBaseUrl = "/api/redux/";

function SortableRow({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
    opacity: isDragging ? 0.6 : 1,
  };

  const tourIds = {
    reduce: "reduce-row",
    solve: "solve-row",
    verify: "verify-row",
  };

  const tourId = tourIds[id];

  const childrenWithProps = React.cloneElement(children, {
    dragHandleProps: { attributes, listeners },
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-2 col-example"
      {...(tourId ? { "data-tour-id": tourId } : {})}
    >
      {childrenWithProps}
    </div>
  );
}

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

  const { problem, solver, verifier, reducer, visualization } = useProblemProvider(reduxBaseUrl);

  const [rowOrder, setRowOrder] = useState(["problem", "reduce", "visualize", "solve", "verify"]);

  // PointerSensor covers mouse; TouchSensor adds mobile/tablet support
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

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

  // Replaces the old handleDragStart/handleDragOver/handleDrop trio.
  function handleDragEnd(event) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRowOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

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
              <TourLauncher />
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={rowOrder} strategy={verticalListSortingStrategy}>
                {rowOrder.map((key) => (
                  <SortableRow key={key} id={key}>
                    {rowMap[key]}
                  </SortableRow>
                ))}
              </SortableContext>
            </DndContext>
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
