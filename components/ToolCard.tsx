import Link from "next/link";
import { ToolDefinition, categories } from "@/lib/tools";
import { TrackedLink } from "@/components/TrackedLink";

export function ToolCard({ tool, trackingSource }: { tool: ToolDefinition; trackingSource?: string }) {
  const category = categories[tool.category];
  const href = `/tools/${tool.slug}`;
  const searchText = [
    tool.name,
    tool.tagline,
    tool.description,
    tool.primaryIntent,
    tool.conversionGoal,
    tool.keywords.join(" "),
    tool.examples.join(" "),
    category.name
  ].join(" ").toLowerCase();
  const content = (
    <>
      <div className="tool-card-top">
        <span className={`pill pill-${category.accent}`}>{category.name}</span>
        <span className="mono">{tool.monetization}</span>
      </div>
      <h3>{tool.name}</h3>
      <p>{tool.tagline}</p>
      <p className="tool-intent">{tool.primaryIntent}</p>
      <div className="tool-card-bottom">
        <span>{tool.conversionGoal}</span>
        <span>Open</span>
      </div>
    </>
  );

  if (trackingSource) {
    return (
      <TrackedLink
        className="tool-card"
        href={href}
        eventName="best_compare_click"
        eventPayload={{ toolSlug: tool.slug, category: tool.category, value: trackingSource }}
      >
        {content}
      </TrackedLink>
    );
  }

  return (
    <Link className="tool-card" href={href} data-tool-card data-category={tool.category} data-search={searchText}>
      {content}
    </Link>
  );
}
