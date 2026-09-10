import type { RendererKind } from "../types/demo";
import { Badge } from "./ui/badge";

const labels: Record<RendererKind, string> = {
  dom: "DOM / SVG",
  three: "Three.js",
  hybrid: "Hybrid",
};

export function RendererBadge({ renderer }: { renderer: RendererKind }) {
  const tone = {
    dom: "border-agent-2-border bg-agent-2-bg text-agent-2",
    three: "border-agent-1-border bg-agent-1-bg text-agent-1",
    hybrid: "border-agent-3-border bg-agent-3-bg text-agent-3",
  }[renderer];

  return (
    <Badge
      className={`renderer-badge font-mono uppercase tracking-wider ${tone}`}
      variant="outline"
    >
      {labels[renderer]}
    </Badge>
  );
}
