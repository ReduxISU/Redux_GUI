/**
 * SiteLayout.js
 *
 * The header, page background and footer shared by every page. pages/_app.js wraps each
 * page in it, so a page only renders its own content and can't forget the header or
 * footer. A page can opt out by setting `noSiteLayout = true` on its component (used by
 * the hidden sandbox pages).
 *
 * The column is at least one screen tall and the content area grows, so the footer sits
 * at the bottom of short pages instead of floating mid-screen.
 */

import { Box } from "@mui/material";
import { useThemeMode } from "../ThemeModeContext";
import { pageBackground } from "../theme";
import ResponsiveAppBar from "./ResponsiveAppBar";
import SiteFooter from "./SiteFooter";

const SiteLayout = ({ children }) => {
  const { mode } = useThemeMode();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: pageBackground(mode),
      }}
    >
      <ResponsiveAppBar />
      <Box sx={{ flex: 1 }}>{children}</Box>
      <SiteFooter />
    </Box>
  );
};

export default SiteLayout;
