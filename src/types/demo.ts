import type { ComponentType } from "react";

export type RendererKind = "dom" | "three" | "hybrid";

export type SourceKind =
  "repository" | "documentation" | "article" | "conceptual";

export interface SourceReference {
  label: string;
  url: string;
  kind: SourceKind;
}

export interface DemoDefinition {
  slug: string;
  title: string;
  summary: string;
  tags: readonly string[];
  renderer: RendererKind;
  presentation?: "focused";
  updatedAt: string;
  sources: readonly SourceReference[];
  load: () => Promise<{ default: ComponentType }>;
  embedLoad?: () => Promise<{ default: ComponentType }>;
}
