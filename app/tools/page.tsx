import type { Metadata } from "next";
import { ToolSearch } from "@/components/ToolSearch";
import { ToolGrid } from "@/components/ToolGrid";
import { tools } from "@/lib/tools";
import { siteImage, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Tools Directory",
  description: "Browse the 7labs.org English-first AI tools directory: AI tool finder, developer utilities, prompt studio, document workflows, creator tools, and utility tools.",
  alternates: {
    canonical: `${siteUrl}/tools`
  },
  openGraph: {
    title: "AI Tools Directory | 7labs.org",
    description: "Browse the 7labs.org English-first AI tools directory.",
    url: `${siteUrl}/tools`,
    type: "website",
    images: [siteImage]
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tools Directory | 7labs.org",
    description: "Browse practical AI tools for real English-language workflows.",
    images: [siteImage]
  }
};

export default function ToolsPage() {
  return (
    <div className="container">
      <section className="page-hero">
        <div className="kicker">Tools Directory</div>
        <h1>AI tools directory</h1>
        <p>Every tool page starts with a usable tool, not a long article. Launch with local rule-based utilities, then connect LLMs only for high-value, repeat-use tools.</p>
      </section>

      <ToolSearch totalTools={tools.length} />

      <section className="section">
        <ToolGrid tools={tools} />
      </section>
    </div>
  );
}
