/**
 * "Report a bug" in the top bar of every page (#393). Opens a new GitHub issue in a new tab,
 * filled in with the page's address (a shared view's state included, when the address has it),
 * the browser's user agent, and headings for what happened, what was expected, and the steps.
 *
 * The link is built when it is clicked (or focused, so a keyboard or middle click gets it too),
 * because the address can change while the page is open. Without JavaScript it still opens a
 * blank new issue.
 */
import { BugReport as BugReportIcon } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import React from "react";
import { buildBugReportUrl, NEW_ISSUE_URL } from "./bugReportLink";

function fillIn(event) {
  event.currentTarget.href = buildBugReportUrl(window.location.href, navigator.userAgent);
}

export default function ReportBugButton() {
  return (
    <Button
      component="a"
      href={NEW_ISSUE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={fillIn}
      onFocus={fillIn}
      onMouseDown={fillIn}
      aria-label="Report a bug (opens GitHub in a new tab)"
      title="Report a bug (opens GitHub in a new tab)"
      startIcon={<BugReportIcon />}
      // Inherits the bar's fixed white-on-dark text (ResponsiveAppBar), the same in both modes.
      sx={{
        color: "inherit",
        minWidth: "auto",
        px: 1.5,
        mr: 1,
        whiteSpace: "nowrap",
        "& .MuiButton-startIcon": { mr: { xs: 0, sm: 1 } },
      }}
    >
      <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
        Report a bug
      </Box>
    </Button>
  );
}
