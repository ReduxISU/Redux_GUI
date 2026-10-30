/**
 * SiteFooter.js
 *
 * The ISU logo shown at the bottom of every page, linking to the ISU Computer Science
 * department. Rendered once by SiteLayout, so pages don't carry their own copy.
 */

import { Box, Link } from "@mui/material";
import isulogoDark from "../images/ISULogo-Dark.png";
import isulogoLight from "../images/ISULogo-Light.png";
import { useThemeMode } from "../ThemeModeContext";

const SiteFooter = () => {
  const { mode } = useThemeMode();

  return (
    <Box
      component="footer"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pt: 2,
        pb: 3,
      }}
    >
      <Link
        href="https://www.isu.edu/cs/"
        target="_blank"
        rel="noopener noreferrer"
        underline="none"
        sx={{ display: "inline-flex" }}
      >
        <Box
          component="img"
          src={mode === "dark" ? isulogoDark.src : isulogoLight.src}
          alt="Idaho State University Computer Science"
          sx={{
            height: 72,
            width: "auto",
            display: "block",
          }}
        />
      </Link>
    </Box>
  );
};

export default SiteFooter;
