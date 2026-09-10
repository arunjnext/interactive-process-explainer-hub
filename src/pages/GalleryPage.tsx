import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { RendererBadge } from "../components/RendererBadge";
import { demos } from "../demos/registry";
import type { RendererKind } from "../types/demo";
import styles from "./GalleryPage.module.css";

type RendererFilter = "all" | RendererKind;

export function GalleryPage() {
  const [query, setQuery] = useState("");
  const [renderer, setRenderer] = useState<RendererFilter>("all");

  const filteredDemos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return demos.filter((demo) => {
      const matchesRenderer = renderer === "all" || demo.renderer === renderer;
      const searchableText = [demo.title, demo.summary, ...demo.tags]
        .join(" ")
        .toLowerCase();
      return matchesRenderer && searchableText.includes(normalizedQuery);
    });
  }, [query, renderer]);

  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className="eyebrow">Observe the system, not just the outcome</p>
          <h1>Difficult processes, made inspectable.</h1>
          <p>
            Start with a faithful analogy. Trace the real implementation. Then
            run concrete data through every meaningful state change.
          </p>
        </div>
        <div className={styles.orbit} aria-hidden="true">
          <span className={styles.orbitCore}>01</span>
          <span className={styles.orbitRing} />
          <span className={styles.orbitDot} />
        </div>
      </section>

      <section className={styles.catalogue} aria-labelledby="catalogue-title">
        <div className={styles.catalogueHeader}>
          <div>
            <p className="eyebrow">Demo catalogue</p>
            <h2 id="catalogue-title">Choose a process to inspect</h2>
          </div>
          <span className={styles.resultCount} aria-live="polite">
            {filteredDemos.length}{" "}
            {filteredDemos.length === 1 ? "demo" : "demos"}
          </span>
        </div>

        <div className={styles.filters}>
          <label>
            <span>Search explainers</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, topic, or tag"
            />
          </label>
          <label>
            <span>Renderer</span>
            <select
              value={renderer}
              onChange={(event) =>
                setRenderer(event.target.value as RendererFilter)
              }
            >
              <option value="all">All renderers</option>
              <option value="hybrid">Hybrid</option>
              <option value="dom">DOM / SVG</option>
              <option value="three">Three.js</option>
            </select>
          </label>
        </div>

        {filteredDemos.length > 0 ? (
          <div className={styles.grid}>
            {filteredDemos.map((demo, index) => (
              <article className={styles.card} key={demo.slug}>
                <div className={styles.cardIndex}>
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className={styles.cardMeta}>
                  <RendererBadge renderer={demo.renderer} />
                  <span>{demo.updatedAt}</span>
                </div>
                <h3>{demo.title}</h3>
                <p>{demo.summary}</p>
                <ul className={styles.tags} aria-label="Topics">
                  {demo.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <Link
                  to={`/demos/${demo.slug}`}
                  aria-label={`Open ${demo.title}`}
                >
                  Open explainer <span aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <h3>No matching signals</h3>
            <p>Try a broader search or reset the renderer filter.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setRenderer("all");
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
