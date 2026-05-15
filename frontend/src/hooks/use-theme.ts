import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light";

const STORAGE_KEY = "theme";
const THEME_EVENT = "yukihon:theme-change";

const applyLightTheme = () => {
  const root = document.documentElement;
  root.classList.add("light");
  root.classList.remove("dark");
  root.dataset.theme = "light";
};

export const useTheme = () => {
  const [theme, setThemeState] = useState<ThemePreference>("light");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    applyLightTheme();
    localStorage.setItem(STORAGE_KEY, "light");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncTheme = () => {
      setThemeState("light");
      applyLightTheme();
      localStorage.setItem(STORAGE_KEY, "light");
    };

    window.addEventListener(THEME_EVENT, syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener(THEME_EVENT, syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const setTheme = useCallback((_nextTheme: ThemePreference) => {
    setThemeState("light");

    if (typeof window !== "undefined") {
      applyLightTheme();
      localStorage.setItem(STORAGE_KEY, "light");
      window.dispatchEvent(new CustomEvent<ThemePreference>(THEME_EVENT, { detail: "light" }));
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme("light");
  }, [setTheme]);

  return {
    theme,
    resolvedTheme: "light" as ResolvedTheme,
    setTheme,
    toggleTheme,
  };
};
