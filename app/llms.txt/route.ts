import { bestPages } from "@/lib/bestPages";
import { comparePages } from "@/lib/comparePages";
import { promptPages } from "@/lib/promptPages";
import { tools } from "@/lib/tools";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const lines = [
    "# 7labs.org",
    "",
    "7labs.org is an English-first AI tools workbench for practical prompts, developer utilities, document workflows, creator workflows, and AI tool decisions.",
    "",
    "## Tools",
    ...tools.map((tool) => `- ${siteUrl}/tools/${tool.slug} - ${tool.description}`),
    "",
    "## Best AI Guides",
    ...bestPages.map((page) => `- ${siteUrl}/best/${page.slug} - ${page.description}`),
    "",
    "## Comparisons",
    ...comparePages.map((page) => `- ${siteUrl}/compare/${page.slug} - ${page.description}`),
    "",
    "## Prompt Libraries",
    ...promptPages.map((page) => `- ${siteUrl}/prompts/${page.slug} - ${page.metaDescription}`)
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
