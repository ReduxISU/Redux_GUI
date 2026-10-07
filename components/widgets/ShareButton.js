import { Share as ShareIcon } from "@mui/icons-material";
import { Fab } from "@mui/material";
import React from "react";

const GREY = "#424242";

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

  // Create the share URL with the parameters
  const shareUrl = createShareLink(window.location.origin + window.location.pathname, data);

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Check this out!",
        text: "Here is some interesting content.",
        url: shareUrl,
      });
      console.log("Content shared successfully");
    } catch (error) {
      console.error("Error sharing content:", error);
    }
  } else {
    // Fallback: Copy the URL to the clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert(
        "Web Share API is not supported in your browser. The share URL has been copied to your clipboard.",
      );
    } catch (error) {
      console.error("Error copying URL to clipboard:", error);
      alert("Failed to copy the share URL to the clipboard.");
    }
  }
};

const ShareButton = ({ problem, solver, verifier, reducer }) => (
  <Fab
    data-tour-id="share-button"
    size="medium"
    aria-label="Share this problem"
    sx={{ backgroundColor: GREY, color: "#fff", "&:hover": { backgroundColor: "#616161" } }}
    onClick={() => handleShare(problem, solver, verifier, reducer)}
  >
    <ShareIcon />
  </Fab>
);

export default ShareButton;
