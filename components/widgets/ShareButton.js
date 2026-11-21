/**
 * Share and Import, in the main page's corner (#281, link sharing phase 1).
 *
 * Share puts the current view (problem, instance, solver, reduction target and method, verifier)
 * into a link and copies it. If the browser won't copy, the link is shown to copy by hand. A view
 * too big for a safe link (MAX_SHARE_URL_LENGTH) is refused with a message instead.
 *
 * Import takes a pasted link, or just its "?problem=..." part, and restores that view in place,
 * without reloading. Like opening the link, it never runs anything (useShareRestore.js).
 */
import { FileOpen as ImportIcon, Share as ShareIcon } from "@mui/icons-material";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button as MuiButton,
  Snackbar,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { buildShareUrl, shareStateFrom } from "../share/shareState";

const THEME = { colors: { grey: "#424242", orange: "#d4441c" } };

/** The page's address without its query: shared links always open the main page. */
function pageBaseUrl() {
  return window.location.origin + window.location.pathname;
}

export default function ShareButton({ problem, solver, verifier, reducer, importLink }) {
  // What the Share dialog shows: null (closed), { kind: "manual", url } when the link couldn't be
  // copied, or { kind: "tooBig", message }.
  const [shareDialog, setShareDialog] = useState(null);
  const [copied, setCopied] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [importing, setImporting] = useState(false);

  async function handleShare() {
    const state = shareStateFrom({
      problemName: problem.problemName,
      problemInstance: problem.problemInstance,
      solver: solver.chosenSolver,
      reduceTo: reducer.chosenReduceTo,
      reductionType: reducer.chosenReductionType,
      verifier: verifier.chosenVerifier,
    });
    const built = buildShareUrl(pageBaseUrl(), state);
    if (!built.ok) {
      setShareDialog({ kind: "tooBig", message: built.message });
      return;
    }
    try {
      await navigator.clipboard.writeText(built.url);
      setCopied(true);
    } catch {
      // No clipboard (an http:// page, or permission refused): let the user copy it themselves.
      setShareDialog({ kind: "manual", url: built.url });
    }
  }

  function openImport() {
    setImportText("");
    setImportError("");
    setImportOpen(true);
  }

  async function handleImport(event) {
    event?.preventDefault();
    setImporting(true);
    const result = await importLink(importText);
    setImporting(false);
    if (result.ok) setImportOpen(false);
    else setImportError(result.message);
  }

  return (
    <>
      <span className="corner-button" style={{ display: "flex", gap: "8px" }}>
        <Button
          variant="primary"
          size="large"
          color="white"
          style={{ backgroundColor: THEME.colors.grey }}
          onClick={openImport}
          aria-label="Import a shared link"
          title="Import a shared link"
        >
          <ImportIcon />
        </Button>
        <Button
          data-tour-id="share-button"
          variant="primary"
          size="large"
          color="white"
          style={{ backgroundColor: THEME.colors.grey }}
          onClick={handleShare}
          aria-label="Share a link to this view"
          title="Share a link to this view"
        >
          <ShareIcon />
        </Button>
      </span>

      <Snackbar
        open={copied}
        autoHideDuration={4000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setCopied(false)} variant="filled">
          Link copied. Anyone who opens it sees this view.
        </Alert>
      </Snackbar>

      <Dialog open={!!shareDialog} onClose={() => setShareDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          {shareDialog?.kind === "tooBig" ? "Too big to share as a link" : "Copy this link"}
        </DialogTitle>
        <DialogContent>
          {shareDialog?.kind === "tooBig" ? (
            <DialogContentText>{shareDialog.message}</DialogContentText>
          ) : (
            <>
              <DialogContentText>
                Your browser didn&apos;t let us copy it. Select the link and copy it yourself.
              </DialogContentText>
              <TextField
                value={shareDialog?.url ?? ""}
                fullWidth
                multiline
                maxRows={6}
                margin="dense"
                slotProps={{ htmlInput: { readOnly: true, "aria-label": "Share link" } }}
                onFocus={(event) => event.target.select()}
                autoFocus
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setShareDialog(null)}>Close</MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog open={importOpen} onClose={() => setImportOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleImport}>
          <DialogTitle>Import a shared link</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Paste a link made with the Share button. The page switches to that view; nothing runs
              until you press a button.
            </DialogContentText>
            <TextField
              value={importText}
              onChange={(event) => {
                setImportText(event.target.value);
                setImportError("");
              }}
              fullWidth
              margin="dense"
              autoFocus
              error={!!importError}
              helperText={importError || " "}
              slotProps={{ htmlInput: { "aria-label": "Shared link" } }}
            />
          </DialogContent>
          <DialogActions>
            <MuiButton onClick={() => setImportOpen(false)}>Cancel</MuiButton>
            <MuiButton type="submit" variant="contained" disabled={importing}>
              Import
            </MuiButton>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
