/**
 * ThemeModeContext.js
 *
 * App-wide light/dark mode state, wired in once at pages/_app.js so every
 * page shares the same theme instance and the toggle in ResponsiveAppBar can
 * flip it everywhere at once. Persisted to localStorage; defaults to light
 * on first visit and while the persisted value hasn't loaded yet server-side
 * (localStorage isn't available during SSR, so the very first client render
 * always starts light too, then switches after mount if "dark" was saved --
 * a brief flash for returning dark-mode users, not worth a blocking
 * SSR/cookie script for a research tool's admin toggle).
 */

import { CssBaseline, ThemeProvider } from "@mui/material";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createAppTheme } from "./theme";

const STORAGE_KEY = "redux-theme-mode";

const ThemeModeContext = createContext({
  mode: "light",
  toggleMode: () => {},
});

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    // Deliberately read-then-setState here, not moved into a useState lazy initializer:
    // localStorage isn't available during SSR, so the server always renders "light". Reading
    // it in the initializer would make the client's first (pre-hydration) render read real
    // localStorage and could produce "dark" while the server-rendered HTML says "light" --
    // a hydration mismatch, which is worse than this rule's generic extra-render concern.
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(saved);
    }
  }, []);

  const toggleMode = () => {
    setMode((current) => {
      const next = current === "light" ? "dark" : "light";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
