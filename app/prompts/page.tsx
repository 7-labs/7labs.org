import type { Metadata } from "next";
import Link from "next/link";
import { ToolGrid } from "@/components/ToolGrid";
import { promptPages } from "@/lib/promptPages";
import { tools } from "@/lib/tools";
import { absoluteUrl, breadcrumbJsonLd, itemListJsonLd, siteImage, siteUrl } from "@/lib/seo";

const description = "7labs Prompt Studio: copy-ready image prompts, video prompts, Midjourney, Stable Diffusion, product photos, YouTube thumbnails, and prompt optimization.";

export const metadata: Metadata = {
  title: "Prompt Studio",
  description,
  alternates: {
    canonical: `${siteUrl}/prompts`
  },
  openGraph: {
    title: "Prompt Studio | 7labs.org",
    description,
    url: `${siteUrl}/prompts`,
    type: "website",
    images: [siteImage]
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompt Studio | 7labs.org",
    description,
    images: [siteImage]
  }
};

export default function PromptsPage() {
  const promptTools = tools.filter((tool) => tool.category === "prompt");
  const pageUrl = absoluteUrl("/prompts");
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Prompt Studio", url: pageUrl }
  ]);
  const listSchema = itemListJsonLd({
    url: pageUrl,
    name: "Prompt libraries",
    items: promptPages.map((page) => ({
      name: page.title,
      url: absoluteUrl(`/prompts/${page.slug}`),
      description: page.metaDescription
    }))
  });
  return (
    <div className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />
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
