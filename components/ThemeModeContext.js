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
import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { createAppTheme } from "./theme";

const ThemeModeContext = createContext({
  mode: "light",
  toggleMode: () => {},
});

// No-op subscribe: "mounted" never changes after the client snapshot below
// starts returning true, so there's nothing to notify React about.
function subscribeToMount() {
  return () => {};
}

export function ThemeModeProvider({ children }) {
  const { resolvedTheme, setTheme } = useNextTheme();
  // useSyncExternalStore (not useState+useEffect) gives us a server/client-
  // divergent value -- false during SSR and the first client render, true
  // after -- without ever calling setState, so there's no cascading-render
  // lint complaint and no extra render pass beyond the one React already
  // does to reconcile the server/client snapshot mismatch.
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );

  const mode = resolvedTheme === "dark" ? "dark" : "light";

  const toggleMode = () => {
    // Many components transition `all` (background/border/shadow) for a
    // smooth hover effect, but those same properties also differ between
    // light/dark variants -- so without this, toggling animates through
    // every in-between color over ~0.2-0.25s, which reads as a "wrong
    // color, then corrects" flash, most visible on hover-highlighted
    // elements. Force transitions off for the swap itself (see the
    // .theme-transition-off rule in globals.css), then let them resume
    // right after so normal hover animations are unaffected.
    const root = document.documentElement;
    root.classList.add("theme-transition-off");
    // Flush layout so the transition-disabling rule is guaranteed to be in
    // effect before setTheme below changes any colors -- otherwise both
    // could land in the same paint and disabling would do nothing.
    void root.offsetHeight;
    setTheme(mode === "dark" ? "light" : "dark");
    // Two frames: one for the disabled-transition state to paint, one for
    // the new theme's colors to paint under it, before re-enabling.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove("theme-transition-off");
      });
    });
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
