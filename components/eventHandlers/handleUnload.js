import { useEffect } from 'react';

export const useUnload = (problem, solver, verifier, reducer) => {
    useEffect(() => {
        const handleBeforeUnload = () => {
            const data = {
                problem: problem.problemName ?? "",
                instance: problem.problemInstance ?? "",
                solver: solver.chosenSolver ?? "",
                reduceTo: reducer.chosenReduceTo ?? "",
                reductionType: reducer.chosenReductionType ?? "",
                verifier: verifier.chosenVerifier ?? "",
            };
            // localStorage.setItem('problemData', JSON.stringify(data));
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [problem, solver, verifier, reducer]); // Dependencies array
};