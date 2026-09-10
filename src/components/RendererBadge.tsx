import type { RendererKind } from "../types/demo";

const labels: Record<RendererKind, string> = {
  dom: "DOM / SVG",
  three: "Three.js",
  hybrid: "Hybrid",
};

export function RendererBadge({ renderer }: { renderer: RendererKind }) {
  return (
    <span className={`renderer-badge renderer-badge--${renderer}`}>
      {labels[renderer]}
    </span>
  );
}
