import type { Metadata } from "next";
import Link from "next/link";
import { bestPages } from "@/lib/bestPages";
import { absoluteUrl, breadcrumbJsonLd, itemListJsonLd, siteImage, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Best AI Guides",
  description: "Task-first Best AI guides for coding, writing, image generation, PDFs, and YouTube workflows, with working 7labs tools linked before paid AI decisions.",
  alternates: {
    canonical: `${siteUrl}/best`
  },
  openGraph: {
    title: "Best AI Guides | 7labs.org",
    description: "Task-first Best AI guides tied to working tools and practical workflows.",
    url: `${siteUrl}/best`,
    type: "website",
    images: [siteImage]
  },
  twitter: {
    card: "summary_large_image",
    title: "Best AI Guides | 7labs.org",
    description: "Task-first Best AI guides tied to working tools and practical workflows.",
    images: [siteImage]
  }
};

export default function BestHubPage() {
  const pageUrl = absoluteUrl("/best");
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Best AI guides", url: pageUrl }
  ]);
  const listSchema = itemListJsonLd({
    url: pageUrl,
    name: "Best AI guides",
    items: bestPages.map((page) => ({
      name: page.title,
      url: absoluteUrl(`/best/${page.slug}`),
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
        <div className="kicker">Best AI Guides</div>
        <h1>Choose AI tools by task, not brand hype.</h1>
        <p>Each guide starts from the work to be done, links to a usable 7labs tool, and keeps caveats visible when prices, limits, or model behavior may change.</p>
      </section>

      <section className="section">
        <div className="tool-grid">
          {bestPages.map((page) => (
            <Link className="content-card" href={`/best/${page.slug}`} key={page.slug}>
              <span className="pill pill-blue">Best AI guide</span>
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
