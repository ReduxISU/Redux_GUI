/**
 * ThemeModeContext.js
 *
 * Bridges next-themes (pages/_app.js wraps the app in its ThemeProvider) into
 * MUI. next-themes owns persistence (localStorage, its own key) and injects a
 * blocking inline script that sets `class="dark"`/no class on <html> BEFORE
 * React hydrates -- that's what avoids the flash for anything styled via plain
 * CSS keyed off `html.dark` (see the critical CSS in styles/globals.css).
 *
 * MUI's theme object, though, is a JS value (createAppTheme(mode) builds real
 * palette colors baked into emotion-generated class rules), and next-themes
 * can't tell us the resolved mode ("light" | "dark", after resolving system
 * preference) synchronously at first render without risking a server/client
 * mismatch -- it deliberately returns resolvedTheme === undefined until after
 * mount. So this provider gates its children on a "mounted" flag: renders
 * nothing until the post-mount effect confirms we know the real value, then
 * renders once with the correct MUI theme. Server and pre-mount-client render
 * both produce null, so there's no hydration mismatch, and no MUI element is
 * ever painted with the wrong-mode colors -- the alternative (guessing "light"
 * for that first paint) is exactly the bug this replaces. The <html> class
 * (and therefore the critical CSS) is already correct the instant anything
 * paints, so this brief gap reads as "page not filled in yet," not a
 * wrong-then-right color flash.
 */

import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { useTheme as useNextTheme } from "next-themes";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createAppTheme } from "./theme";

const ThemeModeContext = createContext({
  mode: "light",
  toggleMode: () => {},
});

export function ThemeModeProvider({ children }) {
  const { resolvedTheme, setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mode = resolvedTheme === "dark" ? "dark" : "light";

  const toggleMode = () => {
    setTheme(mode === "dark" ? "light" : "dark");
  };

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  if (!mounted) {
    // Matches the server render (also unmounted) so there's nothing to
    // reconcile/mismatch during hydration -- see file header.
    return null;
  }

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
