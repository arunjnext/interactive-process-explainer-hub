import { lazy } from "react";

import type { DemoDefinition } from "../types/demo";

// demo:new imports

export const demos: readonly DemoDefinition[] = [
  {
    slug: "how-explainers-work",
    title: "How an interactive explainer is built",
    summary:
      "Follow one technical question as it becomes a truthful mental model, source map, and inspectable dry run.",
    tags: ["workflow", "teaching", "three.js"],
    renderer: "hybrid",
    updatedAt: "2026-09-10",
    sources: [
      {
        label: "Interactive Process Explainer repository",
        url: "https://github.com/arunjnext/interactive-process-explainer-hub",
        kind: "repository",
      },
    ],
    load: () => import("./how-explainers-work/HowExplainersWork"),
  },
  {
    slug: "page-seo-foundation",
    title: "How the Page SEO foundation works",
    summary:
      "Follow one page from collected evidence to interpretation and a Yes, No or Unknown verdict.",
    tags: ["seo", "electron", "foundation"],
    renderer: "hybrid",
    presentation: "focused",
    updatedAt: "2026-09-10",
    sources: [],
    load: () => import("./page-seo-foundation/PageSeoFoundation"),
    embedLoad: () => import("./page-seo-foundation/PageSeoFoundationEmbed"),
  },
  {
    slug: "page-change-history",
    title: "What a page visit saves in Change History",
    summary:
      "Follow a page visit into compact state, baseline, skipped revisit, and a saved title-change event.",
    tags: ["serp lens", "change history", "electron", "page analysis"],
    renderer: "dom",
    updatedAt: "2026-09-24",
    sources: [],
    load: () => import("./page-change-history/PageChangeHistory"),
    embedLoad: () => import("./page-change-history/PageChangeHistoryEmbed"),
  },
  // demo:new definitions
];

export const demoComponents = new Map(
  demos.map((demo) => [demo.slug, lazy(demo.load)]),
);

export const embedDemoComponents = new Map(
  demos.flatMap((demo) =>
    demo.embedLoad ? [[demo.slug, lazy(demo.embedLoad)] as const] : [],
  ),
);

export function findDemo(slug: string) {
  return demos.find((demo) => demo.slug === slug);
}

export function validateRegistry(entries: readonly DemoDefinition[] = demos) {
  const seen = new Set<string>();
  const errors: string[] = [];

  for (const entry of entries) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)) {
      errors.push(`Invalid slug: ${entry.slug}`);
    }
    if (seen.has(entry.slug)) {
      errors.push(`Duplicate slug: ${entry.slug}`);
    }
    seen.add(entry.slug);

    for (const source of entry.sources) {
      if (!/^https:\/\//.test(source.url)) {
        errors.push(
          `Source must use a public HTTPS URL: ${entry.slug}/${source.label}`,
        );
      }
    }
  }

  return errors;
}
