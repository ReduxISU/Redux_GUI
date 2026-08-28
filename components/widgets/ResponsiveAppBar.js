/**
 * ResponsiveAppBar.js
 *
 * This component was directly ripped from the app bar section of mui.com:
 * https://mui.com/material-ui/react-app-bar/
 * * @author Alex Diviney
 */

import { Adb as AdbIcon } from "@mui/icons-material"; // Grouped icons safely
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material"; // Grouped all directory imports safely into a named root import
import * as React from "react";

const pages = ["Home", "About Us", "Browse", "Help", "Contribute"];

const ResponsiveAppBar = () => {
  return (
    <AppBar position="static">
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

          <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          ></Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
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
                  sx={{ my: 2, color: "inherit", display: "block" }}
                >
                  {page}
                </Button>
              );
            })}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
