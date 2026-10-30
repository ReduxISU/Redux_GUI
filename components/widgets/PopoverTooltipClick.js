import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, Divider, Link, Popover, Typography } from "@mui/material";
import { useState } from "react";
import { useThemeMode } from "../ThemeModeContext";
import { surfaceColors, textColors } from "../theme";

// GitHub repo holding the backend source; `sourceFile` paths from the API are relative to it.
// NEXT_PUBLIC_ vars are inlined at build time, so overriding this requires a rebuild.
const REDUX_REPO_URL = (
  process.env.NEXT_PUBLIC_REDUX_REPO_URL || "https://github.com/reduxISU/Redux"
).replace(/\/+$/, "");

// blob/HEAD resolves to the repo's default branch.
function sourceFileUrl(sourceFile) {
  const path = sourceFile.split("/").map(encodeURIComponent).join("/");
  return `${REDUX_REPO_URL}/blob/HEAD/${path}`;
}

function PopoverTooltipClick({ toolTip = {} }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { mode } = useThemeMode();
  const surface = surfaceColors(mode);
  const text = textColors(mode);

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const t = toolTip || {};

  return (
    <>
      <InfoOutlinedIcon onClick={handleClick} style={{ cursor: "pointer" }} fontSize="medium" />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        disableRestoreFocus
      >
        <Box sx={{ maxWidth: 520, p: 0 }}>
          {t.header && (
            <>
              <Box sx={{ px: 2, py: 1, fontWeight: 700, bgcolor: surface.surfaceAlt }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: text.heading }}>
                  {t.header}
                </Typography>
              </Box>
              <Divider />
            </>
          )}

          <Box sx={{ px: 2, py: 1.5, maxWidth: 480 }}>
            {t.input ? (
              <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
                <strong>Input:</strong> {t.input}
              </Typography>
            ) : null}

            {t.output ? (
              <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.35 }}>
                <strong>Output:</strong> {t.output}
              </Typography>
            ) : null}

            {t.info ? (
              <Typography
                variant="body2"
                sx={{ mb: 1.5, whiteSpace: "pre-wrap", lineHeight: 1.35 }}
              >
                <strong>Definition:</strong> {t.info}
                {t.componentLink && (
                  <Link
                    href={t.componentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ ml: 0.5, verticalAlign: "middle" }}
                  >
                    <OpenInNewIcon fontSize="inherit" />
                  </Link>
                )}
              </Typography>
            ) : null}

            {Array.isArray(t.classification) && t.classification.length > 0 ? (
              <Box sx={{ mb: 1.5 }}>
                {t.classification.map(({ label, value }) => (
                  <Typography key={label} variant="body2" sx={{ lineHeight: 1.35 }}>
                    <strong>{label}:</strong> {value}
                  </Typography>
                ))}
              </Box>
            ) : null}

            {t.source ? (
              <Typography variant="body2" sx={{ mb: 0.75, lineHeight: 1.35 }}>
                <strong>Source:</strong> {t.source}
                {t.sourceLink && (
                  <Link
                    href={t.sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ ml: 0.5, verticalAlign: "middle" }}
                  >
                    <OpenInNewIcon fontSize="inherit" />
                  </Link>
                )}
              </Typography>
            ) : null}

            {t.sourceFile ? (
              <Typography variant="body2" sx={{ mb: 0.75, lineHeight: 1.35 }}>
                <strong>Code:</strong>{" "}
                <Link
                  href={sourceFileUrl(t.sourceFile)}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ wordBreak: "break-all" }}
                >
                  {t.sourceFile}
                  <OpenInNewIcon fontSize="inherit" sx={{ ml: 0.5, verticalAlign: "middle" }} />
                </Link>
              </Typography>
            ) : null}

            {t.credit ? (
              <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
                <strong>Contributed by:</strong> {t.credit}
              </Typography>
            ) : null}
          </Box>
        </Box>
      </Popover>
    </>
  );
}

export default PopoverTooltipClick;
