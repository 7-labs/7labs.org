import type { Metadata } from "next";
import Link from "next/link";
import { comparePages } from "@/lib/comparePages";
import { absoluteUrl, breadcrumbJsonLd, itemListJsonLd, siteImage, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Tool Comparisons",
  description: "Practical AI tool comparisons for ChatGPT, Gemini, Claude, Midjourney, Stable Diffusion, Cursor, and GitHub Copilot workflows.",
  alternates: {
    canonical: `${siteUrl}/compare`
  },
  openGraph: {
    title: "AI Tool Comparisons | 7labs.org",
    description: "Compare AI tools by workflow fit, caveats, and next actions.",
    url: `${siteUrl}/compare`,
    type: "website",
    images: [siteImage]
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tool Comparisons | 7labs.org",
    description: "Compare AI tools by workflow fit, caveats, and next actions.",
    images: [siteImage]
  }
};

export default function CompareHubPage() {
  const pageUrl = absoluteUrl("/compare");
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: "AI tool comparisons", url: pageUrl }
  ]);
  const listSchema = itemListJsonLd({
    url: pageUrl,
    name: "AI tool comparisons",
    items: comparePages.map((page) => ({
      name: page.title,
      url: absoluteUrl(`/compare/${page.slug}`),
      description: page.description
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
        <div className="kicker">Compare</div>
        <h1>Compare AI tools by the work they need to finish.</h1>
        <p>These comparisons use selection criteria, caveats, and related 7labs tools so the page ends in a workflow decision instead of a generic ranking.</p>
      </section>

      <section className="section">
        <div className="tool-grid">
          {comparePages.map((page) => (
            <Link className="content-card" href={`/compare/${page.slug}`} key={page.slug}>
              <span className="pill pill-green">Comparison</span>
              <h2>{page.title}</h2>
              <p>{page.description}</p>
              <p className="meta-line">Last reviewed: {page.lastReviewed}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
