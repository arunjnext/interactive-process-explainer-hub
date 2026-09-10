import type { RendererKind } from "../types/demo";
import { Badge } from "./ui/badge";

const labels: Record<RendererKind, string> = {
  dom: "DOM / SVG",
  three: "Three.js",
  hybrid: "Hybrid",
};

export function RendererBadge({ renderer }: { renderer: RendererKind }) {
  return (
    <Badge className="renderer-badge" variant="outline">
      {labels[renderer]}
    </Badge>
  );
}
