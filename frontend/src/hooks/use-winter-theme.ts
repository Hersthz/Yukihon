import { useCallback, useEffect, useState } from "react";

export type WinterTheme = "light" | "dark";

const STORAGE_KEY = "yukihon-winter-theme";

const getInitial = (): WinterTheme => {
  if (typeof window === "undefined") return "light";
  // URL param wins (shareable themed links) — e.g. /?theme=dark
  const param = new URLSearchParams(window.location.search).get("theme");
  if (param === "light" || param === "dark") return param;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return "light";
};

/**
 * Light/dark theme state scoped to the public winter pages (landing + auth).
 * Persisted in localStorage; does NOT affect the logged-in app palette.
 */
export const useWinterTheme = () => {
  const [theme, setTheme] = useState<WinterTheme>(getInitial);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  return { theme, isDark: theme === "dark", setTheme, toggle };
};
