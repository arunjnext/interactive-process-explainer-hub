import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

const storageKey = "process-observatory-theme-v2";

function readInitialTheme(): Theme {
  const savedTheme = window.localStorage.getItem(storageKey);
  return savedTheme === "dark" ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () =>
      setTheme((current) => (current === "dark" ? "light" : "dark")),
  };
}
