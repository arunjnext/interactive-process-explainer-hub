import { createElement, Suspense } from "react";
import { useParams } from "react-router-dom";

import { embedDemoComponents, findDemo } from "../demos/registry";
import { useTheme } from "../hooks/useTheme";
import styles from "./EmbedDemoPage.module.css";

export function EmbedDemoPage() {
  useTheme();
  const { slug = "" } = useParams();
  const demo = findDemo(slug);
  const EmbedDemo = embedDemoComponents.get(slug);

  if (!demo || !EmbedDemo) {
    return (
      <main className={styles.missing}>
        This explainer does not have an embeddable view.
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className={styles.embedPage}
      aria-label={`${demo.title} interactive embed`}
    >
      <Suspense fallback={<p className={styles.loading}>Loading explainer…</p>}>
        {createElement(EmbedDemo)}
      </Suspense>
    </main>
  );
}
