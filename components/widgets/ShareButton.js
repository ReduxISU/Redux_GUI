/**
 * Share and Import, in the main page's corner (#281 and ReduxISU/Redux#844, link sharing).
 *
 * Share puts the current view (problem, instance, solver, reduction target and method, verifier)
 * into a link and copies it. If the browser won't copy, the link is shown to copy by hand. A view
 * too big for a safe plain link (MAX_SHARE_URL_LENGTH) is saved on the server instead and a short
 * `?share={id}` link is copied; if it can't be saved, a message says why.
 *
 * Import takes a pasted link, its "?problem=..." or "?share=..." part, or a bare short-link id,
 * and restores that view in place, without reloading. Like opening the link, it never runs
 * anything (useShareRestore.js).
 */
import { FileOpen as ImportIcon, Share as ShareIcon } from "@mui/icons-material";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  Button as MuiButton,
  Snackbar,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import { buildShareUrl, shareStateFrom } from "../share/shareState";
import { buildShortLinkUrl, createShortLink, SHORT_LINK_LIFETIME } from "../share/shortLinks";

// Round theme buttons like the Getting started button in the opposite corner: the theme's grey in
// both light and dark mode (no Bootstrap blue border), icons centered, the same 48 px size, and an
// orange ring that shows only when the button has keyboard focus.
const cornerFabSx = {
  "&.Mui-focusVisible": {
    outline: "3px solid",
    outlineColor: "secondary.main",
    outlineOffset: "2px",
  },
};

/** The page's address without its query: shared links always open the main page. */
function pageBaseUrl() {
  return window.location.origin + window.location.pathname;
}

/**
 * @param url the Redux API base URL, where too-big views are saved as short links.
 */
export default function ShareButton({ url, problem, solver, verifier, reducer, importLink }) {
  // What the Share dialog shows: null (closed), { kind: "manual", url } when the link couldn't be
  // copied, or { kind: "tooBig", message }.
  const [shareDialog, setShareDialog] = useState(null);
  // Whether the "copied" snackbar shows, and for which kind of link ("plain" or "short"). The kind
  // is kept after closing so the text doesn't change while the snackbar fades out.
  const [copied, setCopied] = useState(false);
  const [copiedKind, setCopiedKind] = useState("plain");
  // True while a short link is being saved, so a second click doesn't save it twice.
  const [sharing, setSharing] = useState(false);
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
    let link = built.url;
    let kind = "plain";
    if (!built.ok) {
      // Too long for a plain link: save the view on the server and share its short id instead.
      setSharing(true);
      const saved = await createShortLink(url, state);
      setSharing(false);
      if (!saved.ok) {
        setShareDialog({ kind: "tooBig", message: saved.message });
        return;
      }
      link = buildShortLinkUrl(pageBaseUrl(), saved.id);
      kind = "short";
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopiedKind(kind);
      setCopied(true);
    } catch {
      // No clipboard (an http:// page, or permission refused): let the user copy it themselves.
      setShareDialog({ kind: "manual", url: link });
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
      <span className="corner-button" style={{ display: "flex", gap: "12px" }}>
        <Fab
          color="primary"
          size="medium"
          sx={cornerFabSx}
          onClick={openImport}
          aria-label="Import a shared link"
          title="Import a shared link"
        >
          <ImportIcon />
        </Fab>
        <Fab
          data-tour-id="share-button"
          color="primary"
          size="medium"
          sx={cornerFabSx}
          onClick={handleShare}
          disabled={sharing}
          aria-label="Share a link to this view"
          title="Share a link to this view"
        >
          <ShareIcon />
        </Fab>
      </span>

      <Snackbar
        open={copied}
        autoHideDuration={copiedKind === "short" ? 6000 : 4000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setCopied(false)} variant="filled">
          {copiedKind === "short"
            ? `Saved link copied. Anyone who opens it sees this view; it lasts ${SHORT_LINK_LIFETIME}.`
            : "Link copied. Anyone who opens it sees this view."}
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
