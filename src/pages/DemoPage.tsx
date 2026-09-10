import { createElement, Suspense } from "react";
import { Link, useParams } from "react-router-dom";

import { RendererBadge } from "../components/RendererBadge";
import { Button } from "../components/ui/button";
import { demoComponents, findDemo } from "../demos/registry";
import styles from "./DemoPage.module.css";

export function DemoPage() {
  const { slug = "" } = useParams();
  const demo = findDemo(slug);
  const Demo = demoComponents.get(slug);

  if (!demo || !Demo) {
    return (
      <section className={styles.missing}>
        <p className="eyebrow">Unknown signal</p>
        <h1>That explainer is not in the observatory.</h1>
        <p>
          Check the URL, or return to the gallery to inspect the available
          processes.
        </p>
        <Button render={<Link to="/" />}>Return to all demos</Button>
      </section>
    );
  }

  return (
    <article>
      <header className={styles.demoHeader}>
        <Link className={styles.backLink} to="/">
          ← All demos
        </Link>
        <div className={styles.metaRow}>
          <RendererBadge renderer={demo.renderer} />
          <span>Updated {demo.updatedAt}</span>
        </div>
        <h1>{demo.title}</h1>
        <p>{demo.summary}</p>
        <nav className={styles.jumpLinks} aria-label="Explainer sections">
          <a href="#eli5">Mental model</a>
          <a href="#technical">Source map</a>
          <a href="#dry-run">Dry run</a>
          <a href="#edge-case">Safety</a>
        </nav>
      </header>
      <Suspense fallback={<p className={styles.loading}>Loading explainer…</p>}>
        {createElement(Demo)}
      </Suspense>
    </article>
  );
}
