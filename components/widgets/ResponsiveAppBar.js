/**
 * ResponsiveAppBar.js
 *
 * This component was directly ripped from the app bar section of mui.com:
 * https://mui.com/material-ui/react-app-bar/
 * * @author Alex Diviney
 */

import {
  Adb as AdbIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Menu as MenuIcon,
} from "@mui/icons-material"; // Grouped icons safely
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material"; // Grouped all directory imports safely into a named root import
import * as React from "react";
import { useThemeMode } from "../ThemeModeContext";

const pages = ["Home", "About Us", "Browse", "Help", "Contribute"];

// "Home" -> "/", "About Us" -> "/aboutus", ...
const pageHref = (page) => (page === "Home" ? "/" : "/" + page.toLowerCase().replace(" ", ""));

const ResponsiveAppBar = () => {
  const { mode, toggleMode } = useThemeMode();
  const [menuAnchor, setMenuAnchor] = React.useState(null);
  const closeMenu = () => setMenuAnchor(null);

  return (
    // Fixed dark chrome, independent of the page's own theme (which several
    // pages also reuse for their own accent color elsewhere -- e.g. /browse's
    // section cards -- so pulling the banner's color from theme.primary would
    // mean changing that theme to fix the banner also recolors unrelated
    // things on the page) and independent of light/dark mode too -- the
    // banner stays one consistent dark bar in both. color="inherit" so
    // REDUX/AdbIcon/nav buttons below (all color: 'inherit') pick up this
    // fixed text color instead of the ambient theme's primary.contrastText.
    <AppBar position="static" color="inherit" sx={{ bgcolor: "#3F3F46", color: "#fff" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          {/**This is the REDUX LOGO Component. */}
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            REDUX
          </Typography>

          {/* Below md the nav links collapse into a hamburger menu. */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              aria-label="Open navigation menu"
              aria-controls="nav-menu"
              aria-haspopup="true"
              aria-expanded={menuAnchor ? "true" : undefined}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={{ color: "inherit", width: 44, height: 44, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="nav-menu"
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={closeMenu}
              slotProps={{ list: { "aria-label": "Navigation" } }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  component="a"
                  href={pageHref(page)}
                  onClick={closeMenu}
                  sx={{ minHeight: 44, minWidth: 160 }}
                >
                  {page}
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            REDUX
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 0.5 }}>
            {pages.map((page) => {
              var currentHref = page.toLowerCase();

              if (currentHref === "home") {
                currentHref = "";
              } else {
                currentHref = currentHref.replace(" ", "");
              }
              return (
                <Button
                  key={page}
                  href={"/" + currentHref}
                  // minWidth: 'auto' overrides MUI Button's default 64px floor --
                  // without it, a short label like "Home"/"Help" gets padded out to
                  // 64px with its text left-anchored inside, leaving a visible dead
                  // zone of empty button before the next tab starts. px replaces
                  // that floor with real, symmetric padding instead.
                  sx={{ my: 2, px: 1.5, minWidth: "auto", color: "inherit", display: "block" }}
                >
                  {page}
                </Button>
              );
            })}
          </Box>

          <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton
              onClick={toggleMode}
              sx={{ color: "inherit" }}
              aria-label="Toggle dark mode"
            >
              {mode === "dark" ? (
                <LightModeIcon fontSize="small" />
              ) : (
                <DarkModeIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
