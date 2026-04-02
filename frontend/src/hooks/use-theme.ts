import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "theme";
const THEME_EVENT = "yukihon:theme-change";

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
};

const applyResolvedTheme = (theme: ResolvedTheme) => {
  const root = document.documentElement;

  if (theme === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
    return;
  }

  root.classList.remove("light");
  root.classList.add("dark");
};

export const useTheme = () => {
  const [theme, setThemeState] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    return isThemePreference(saved) ? saved : "system";
  });
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => setSystemTheme(mediaQuery.matches ? "dark" : "light");

    syncSystemTheme();
    mediaQuery.addEventListener("change", syncSystemTheme);

    return () => mediaQuery.removeEventListener("change", syncSystemTheme);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncFromCustomEvent = (event: Event) => {
      const nextTheme = (event as CustomEvent<ThemePreference>).detail;
      if (isThemePreference(nextTheme)) {
        setThemeState(nextTheme);
      }
    };

    const syncFromStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      const nextTheme = event.newValue;
      setThemeState(isThemePreference(nextTheme) ? nextTheme : "system");
    };

    window.addEventListener(THEME_EVENT, syncFromCustomEvent as EventListener);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.removeEventListener(THEME_EVENT, syncFromCustomEvent as EventListener);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    applyResolvedTheme(resolvedTheme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [resolvedTheme, theme]);

  const setTheme = useCallback((nextTheme: ThemePreference) => {
    setThemeState(nextTheme);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, nextTheme);
      window.dispatchEvent(new CustomEvent<ThemePreference>(THEME_EVENT, { detail: nextTheme }));
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return { theme, resolvedTheme, setTheme, toggleTheme };
};
