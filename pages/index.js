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
import { memo, useEffect, useState } from "react"; // CHANGED: added useState for row order
import { Container } from "react-bootstrap";
import { useHandleParameters } from "../components/eventHandlers/handleParameters";
import { useUnload } from "../components/eventHandlers/handleUnload";
import { useProblemProvider } from "../components/hooks/ProblemProvider";
import TourLauncher from "../components/tour/TourLauncher";
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

  //useHandleParameters();

  const { problem, solver, verifier, reducer, visualization } = useProblemProvider(reduxBaseUrl);

  const [rowOrder, setRowOrder] = useState(["problem", "visualize", "solve", "verify", "reduce"]);

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
      <div className="container-fluid">
        {/** This is an artifact from the old bootstrap code, may be deprecated */}
        <div className="d-flex flex-column">
          {/* In normal flow under the nav bar, so neither button can cover a row's controls. */}
          <div className="p-2 col-example d-flex justify-content-between align-items-center">
            <TourLauncher />
            <div className="ms-auto">
              <ShareButton
                problem={problem}
                solver={solver}
                verifier={verifier}
                reducer={reducer}
              />
            </div>
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
