import type { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

import { useTheme } from "../hooks/useTheme";
import { Button } from "./ui/button";
import styles from "./AppShell.module.css";

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.appShell}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>
      <header className={styles.header}>
        <Link
          className={styles.brand}
          to="/"
          aria-label="Process Observatory home"
        >
          <span className={styles.brandMark} aria-hidden="true">
            ◉
          </span>
          <span>
            <strong>Process Observatory</strong>
            <small>Interactive systems, made inspectable</small>
          </span>
        </Link>
        <nav className={styles.nav} aria-label="Primary navigation">
          <Link to="/">All demos</Link>
          <a href="https://github.com/arunjnext/interactive-process-explainer-hub">
            GitHub
          </a>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? (
              <Sun data-icon="inline-start" aria-hidden="true" />
            ) : (
              <Moon data-icon="inline-start" aria-hidden="true" />
            )}
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
        </nav>
      </header>
      <main id="main-content" className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <span>Built for causal explanations, not decorative motion.</span>
        <span>React · Three.js · Vite</span>
      </footer>
    </div>
  );
}
