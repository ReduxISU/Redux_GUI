import { useEffect } from 'react';

export const useUnload = (problem, solver, verifier, reducer) => {
    useEffect(() => {
        const handleBeforeUnload = () => {
            const data = { problem, solver, verifier, reducer };
            localStorage.setItem('problemData', JSON.stringify(data));
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [problem, solver, verifier, reducer]); // Dependencies array
};