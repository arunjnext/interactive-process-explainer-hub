import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

const storageKey = "process-observatory-theme";

function readInitialTheme(): Theme {
  const savedTheme = window.localStorage.getItem(storageKey);
  return savedTheme === "light" ? "light" : "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () =>
      setTheme((current) => (current === "dark" ? "light" : "dark")),
  };
}
