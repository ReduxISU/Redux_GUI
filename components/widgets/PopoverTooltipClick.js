import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, Divider, Link, Popover, Typography } from "@mui/material";
import { useState } from "react";

function PopoverTooltipClick({ toolTip = {} }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

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
              <Box sx={{ px: 2, py: 1, fontWeight: 700, bgcolor: "grey.100" }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {t.header}
                </Typography>
              </Box>
              <Divider />
            </>
          )}

          <Box sx={{ px: 2, py: 1.5, maxWidth: 480 }}>
            {t.formalDef && t.isMathDef ? (
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: "0.85em",
                  whiteSpace: "pre-wrap",
                  mb: 1.5,
                }}
              >
                {t.formalDef}
              </Typography>
            ) : t.formalDef ? (
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                {t.formalDef}
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
