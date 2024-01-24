
import React from 'react'
import { useContext, useState, useEffect } from 'react';
import SAT3_SVG_React from '../Visualization/svgs/SAT3_SVG_React';
import { getClique } from '../Visualization/svgs/Sat3ToCliqueReduction';
import { getSat3 } from '../Visualization/svgs/Sat3ToCliqueInstance'
import CLIQUE_SVG_REACT from '../Visualization/svgs/CLIQUE_SVG_REACT';
import { Container } from '@mui/material';
import TEST_SVG_REACT from '../Visualization/svgs/TEST_SVG_REACT';
import Split from 'react-split'
import { ProblemContext } from '../contexts/ProblemProvider';
import VisualizationLogic from './VisualizationLogic';


//const [initialLoad, setInitialLoad] = useState(false);



export default function VisualizationBox({ reduceToggled, solveToggled, loading, problemVisualizationData, reducedVisualizationData, problemSolutionData, visualizationState, url,apiInstance }) {

    const { problemName, chosenReduceTo,chosenReductionType, reducedInstance, defaultSolverMap } = useContext(ProblemContext);


    // if (visualizationState.reductionOn && !loading) {

    //     return (
    //         <>
    //                 {/* <SAT3_SVG_React data={problemVisualizationData}></SAT3_SVG_React>
    //                 <CLIQUE_SVG_REACT data={reducedVisualizationData}></CLIQUE_SVG_REACT> */}
    //                 {/* <TEST_SVG_REACT></TEST_SVG_REACT>
    //                 <TEST_SVG_REACT></TEST_SVG_REACT> */}
    //                 +
    //             <Split
    //                 class="wrap"      
    //                 direction="horizontal"
    //                 style={{ height: 'inherit' }}

    //             >
    //                             <Container>
    //                             <SAT3_SVG_React 
    //                                 data={problemVisualizationData}
    //                                 solution={problemSolutionData}
    //                                 showSolution={solveToggled}
    //                             ></SAT3_SVG_React>
    //                             </Container>
    //                             <Container>
    //                             <CLIQUE_SVG_REACT data={reducedVisualizationData}></CLIQUE_SVG_REACT>
    //                             </Container>
    //                 </Split>

    //         </>
    //     )
    // }
    // else if (!visualizationState.reductionOn && !loading) {
    //     return (
    //         <>

    //             <Container>
    //             <VisualizationLogic
    //                     problemName={problemName}
    //                     problemInstance={problemInstance}
    //                     reductionName={chosenReductionType}
    //                     loading={loading}
    //                     problemSolutionData={problemSolutionData}
    //                     reducedVisualizationData={reducedVisualizationData}
    //                     problemVisualizationData={problemVisualizationData}
    //                     visualizationState ={visualizationState}
    //                     // solverOn={true}
    //                     // reductionOn={reduceToggled}
    //                     // gadgetsOn={false}


    //                 />
    //                  {/* <SAT3_SVG_React data={problemVisualizationData}></SAT3_SVG_React> */}
    //                 </Container>

    //             </>)
    // }


    return (
        <>
            <VisualizationLogic
                defaultSolverMap={defaultSolverMap}
                problemName={problemName}
                problemInstance={apiInstance} //passing a string that replaces and symbols with ascii values.
                reductionName={chosenReduceTo}
                reductionType={chosenReductionType}
                reducedInstance ={reducedInstance}
                url={url}
                loading={loading}
                problemSolutionData={problemSolutionData}
                reducedVisualizationData={reducedVisualizationData}
                problemVisualizationData={problemVisualizationData}
                visualizationState={visualizationState}
            // solverOn={true}
            // reductionOn={reduceToggled}
            // gadgetsOn={false}
            />
        </>
    )
}