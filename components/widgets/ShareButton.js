import React from 'react';
import Button from 'react-bootstrap/Button';
import ShareIcon from '@mui/icons-material/Share';

const THEME = { colors: { grey: "#424242", orange: "#d4441c" } };

const createShareLink = (baseUrl, data) => {
    const params = new URLSearchParams(data).toString();
    return `${baseUrl}?${params}`;
};

const handleShare = async (problem, solver, verifier, reducer) => {

    const data = {
        problem: problem.problemName ?? "",
        instance: problem.problemInstance ?? "",
        solver: solver.chosenSolver ?? "",
        reduceTo: reducer.chosenReduceTo ?? "",
        reductionType: reducer.chosenReductionType ?? "",
        verifier: verifier.chosenVerifier ?? "",
    };
    
    localStorage.setItem('problemData', JSON.stringify(data));
    // Create the share URL with the parameters
    const shareUrl = createShareLink(window.location.origin + window.location.pathname, data);    

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Check this out!',
                text: 'Here is some interesting content.',
                url: shareUrl
            });
            console.log('Content shared successfully');
        } catch (error) {
            console.error('Error sharing content:', error);
        }
    } else {
        alert('Web Share API is not supported in your browser.');
    }
};

const ShareButton = ({ problem, solver, verifier, reducer }) => (
    <Button 
    variant="primary" 
    className="corner-button" 
    size="large"
    color="white"
    style={{ backgroundColor: THEME.colors.grey }}
    onClick={() => handleShare(problem, solver, verifier, reducer)}>
        <ShareIcon />
    </Button>
);

export default ShareButton;