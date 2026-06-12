import { ToolDefinition } from "@/lib/tools";
import { ToolCard } from "./ToolCard";

export function ToolGrid({ tools, trackingSource }: { tools: ToolDefinition[]; trackingSource?: string }) {
  return (
    <div className="tool-grid">
      {tools.map((tool) => <ToolCard key={tool.slug} tool={tool} trackingSource={trackingSource} />)}
    </div>
  );
}
