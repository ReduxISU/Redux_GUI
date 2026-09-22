/**
 * TruncatedTextSection.js
 *
 * Renders a long text block returned by the API (a reduced instance, a
 * solved certificate, ...) as a clipped preview with a "Show more"/"Show
 * less" toggle. Expanding never adds a scrollbar -- direct project-owner
 * instruction: expanded sections always show everything, never a scrollable
 * sub-box.
 *
 * Past TEXT_TOO_LARGE_TO_RENDER_LENGTH, even the full (non-scrolling) render
 * is skipped entirely: an earlier scrollable version still rendered the
 * whole string into the DOM on expand, which is what actually crashed
 * browsers on very large instances -- the scrollbar just hid that cost, it
 * didn't remove it. Callers that reach this component already have a
 * Download button nearby that gets the visitor the same data without
 * asking the DOM to hold it.
 */

import { Box, Button } from '@mui/material';
import { useState } from 'react';

const TEXT_PREVIEW_LENGTH = 500;
const TEXT_TOO_LARGE_TO_RENDER_LENGTH = 50_000;

function textWrapSx() {
  return { whiteSpace: "pre-wrap", wordBreak: "break-word" };
}

export default function TruncatedTextSection({
  text,
  tooLargeMessage = "Too large to display. Select Download to get the full text.",
}) {
  const [expanded, setExpanded] = useState(false);
  const isTruncated = text.length > TEXT_PREVIEW_LENGTH;

  if (expanded && text.length > TEXT_TOO_LARGE_TO_RENDER_LENGTH) {
    return (
      <Box sx={{ ...textWrapSx(), fontStyle: "italic", opacity: 0.75 }}>
        {tooLargeMessage}
      </Box>
    );
  }

  const displayText = expanded || !isTruncated ? text : text.slice(0, TEXT_PREVIEW_LENGTH) + "…";

  return (
    <>
      <Box sx={textWrapSx()}>{displayText}</Box>
      {isTruncated && (
        <Button
          size="small"
          onClick={() => setExpanded((e) => !e)}
          sx={{ textTransform: "none", minWidth: 0, px: 0, mb: 1 }}
        >
          {expanded ? "Show less" : "Show more"}
        </Button>
      )}
    </>
  );
}
