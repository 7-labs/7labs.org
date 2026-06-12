import type { Metadata } from "next";
import Link from "next/link";
import { ToolGrid } from "@/components/ToolGrid";
import { promptPages } from "@/lib/promptPages";
import { tools } from "@/lib/tools";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://7labs.org").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Prompt Studio",
  description: "7labs Prompt Studio: image prompts, video prompts, Midjourney, Stable Diffusion, product photos, YouTube thumbnails, and prompt optimization.",
  alternates: {
    canonical: `${siteUrl}/prompts`
  }
};

export default function PromptsPage() {
  const promptTools = tools.filter((tool) => tool.category === "prompt");
  return (
    <div className="container">
      <section className="page-hero">
        <div className="kicker">Prompt Studio</div>
        <h1>Get the prompt right before you pay for generation.</h1>
        <p>Image and video generation can get expensive fast. 7labs starts with a low-cost prompt workbench that turns vague ideas into model-ready prompts for English-speaking creators, marketers, and builders.</p>
        <div className="hero-actions">
          <Link className="primary-button" href="/tools/image-prompt-generator">Generate image prompt</Link>
          <Link className="secondary-button" href="/tools/prompt-optimizer">Optimize a prompt</Link>
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-kicker">Prompt Libraries</div>
            <h2>Copy-ready prompt examples</h2>
            <p>Each library wraps an existing 7labs prompt tool with curated examples, model notes, negative prompts, and internal links to related workflows.</p>
          </div>
        </div>
        <div className="tool-grid">
          {promptPages.map((page) => (
            <Link className="content-card" href={`/prompts/${page.slug}`} key={page.slug}>
              <span className="pill pill-purple">Library</span>
              <h3>{page.title}</h3>
              <p>{page.metaDescription}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-kicker">Tools</div>
            <h2>Generate a fresh prompt</h2>
            <p>Use the generators when the examples are close but still need your subject, audience, platform, or shot constraints.</p>
          </div>
        </div>
        <ToolGrid tools={promptTools} />
      </section>
    </div>
  );
}
