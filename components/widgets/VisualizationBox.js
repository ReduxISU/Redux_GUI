
import VisualizationLogic from './VisualizationLogic';


//const [initialLoad, setInitialLoad] = useState(false);



export default function VisualizationBox({
    reduceToggled,
    solveToggled,
    loading,
    problemVisualizationData,
    reducedVisualizationData,
    problemSolutionData,
    visualizationState,
    url,
    problemInstance,
  
    problemName,
    problemNameMap,
    chosenReduceTo,
    chosenReductionType,
    reductionNameMap,
    reducedInstance,
    chosenSolver,
    currentStep,
    allSteps,
    visualizationType,
  }) {

    return (
        <>
            <VisualizationLogic
                chosenSolver={chosenSolver}
                problemName={problemName}
                problemNameMap={problemNameMap}
                problemInstance={problemInstance}
                reductionName={chosenReduceTo}
                reductionType={chosenReductionType}
                chosenReductionType={chosenReductionType}
                reductionNameMap={reductionNameMap}
                reducedInstance ={reducedInstance}
                url={url}
                loading={loading}
                problemSolutionData={problemSolutionData}
                reducedVisualizationData={reducedVisualizationData}
                problemVisualizationData={problemVisualizationData}
                visualizationState={visualizationState}
                currentStep={currentStep}
                allSteps={allSteps}
                visualizationType={visualizationType}
            />
        </>
    )
}