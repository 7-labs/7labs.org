import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { bestPages, getBestPage } from "@/lib/bestPages";
import { getRelatedTools } from "@/lib/tools";
import { getComparePage } from "@/lib/comparePages";
import { ToolGrid } from "@/components/ToolGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { absoluteUrl, articleJsonLd, breadcrumbJsonLd, itemListJsonLd, siteUrl } from "@/lib/seo";

type BestPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return bestPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: BestPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getBestPage(slug);
  if (!page) return {};
  const pageUrl = `${siteUrl}/best/${page.slug}`;
  const ogImage = `${pageUrl}/opengraph-image`;
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: pageUrl
    },
    openGraph: {
      title: `${page.title} | 7labs.org`,
      description: page.description,
      url: pageUrl,
      type: "article",
      images: [ogImage]
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} | 7labs.org`,
      description: page.description,
      images: [ogImage]
    }
  };
}

export default async function BestPage({ params }: BestPageProps) {
  const { slug } = await params;
  const page = getBestPage(slug);
  if (!page) notFound();
  const related = getRelatedTools(page.relatedTools);
  const relatedComparisons = page.relatedComparisons.map(getComparePage).filter((item): item is NonNullable<ReturnType<typeof getComparePage>> => Boolean(item));
  const pageUrl = absoluteUrl(`/best/${page.slug}`);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Best AI guides", url: absoluteUrl("/best") },
    { name: page.title, url: pageUrl }
  ]);
  const articleSchema = articleJsonLd({
    url: pageUrl,
    title: page.title,
    description: page.description,
    lastReviewed: page.lastReviewed,
    type: "TechArticle"
  });
  const pickListSchema = itemListJsonLd({
    url: pageUrl,
    name: `${page.title} picks`,
    items: page.picks.map((pick) => ({
      name: pick.name,
      description: `${pick.bestFor}: ${pick.why}`
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pickListSchema) }}
      />
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Best AI guides", href: "/best" },
        { label: page.title }
      ]} />
      <section className="page-hero">
        <div className="kicker">Best AI for</div>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
        <p className="meta-line">Last reviewed: {page.lastReviewed}. Selection is task-first, not a universal ranking.</p>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-kicker">Run First</div>
            <h2>Validate the task with related tools first</h2>
            <p>Ranking pages should not stop at lists. Convert the task into executable inputs before choosing a primary AI tool.</p>
          </div>
          <Link className="ghost-button" href="/tools">All tools</Link>
        </div>
        <ToolGrid tools={related} trackingSource={page.slug} />
      </section>

      <article className="article-card">
        <p className="meta-line">Selection criteria: {page.selectionCriteria.join(", ")}.</p>
        <p className="meta-line">Source links checked: {page.sourceLastChecked ?? page.lastReviewed}. Update this guide when visible product limits, pricing, or workflow behavior materially change.</p>
        <h2>Search intent</h2>
        <p>{page.intent}</p>
        <h2>Selection criteria</h2>
        <ul className="list">
          {page.selectionCriteria.map((criterion) => <li key={criterion}>{criterion}</li>)}
        </ul>
        <h2>Recommended picks</h2>
        <div className="article-grid">
          {page.picks.map((pick) => (
            <div className="content-card" key={pick.name}>
              <span className="pill pill-blue">{pick.bestFor}</span>
              <h3>{pick.name}</h3>
              <p><strong>Why: </strong>{pick.why}</p>
              <p><strong>Caveat: </strong>{pick.caveat}</p>
            </div>
          ))}
        </div>
        <h2>Suggested workflow</h2>
        <ol className="list">
          {page.workflow.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <h2>Evidence notes</h2>
        <ul className="list">
          {page.evidenceNotes.map((note) => <li key={note}>{note}</li>)}
        </ul>
        {relatedComparisons.length > 0 ? (
          <>
            <h2>Related comparisons</h2>
            <div className="link-row">
              {relatedComparisons.map((comparison) => (
                <Link className="ghost-button" href={`/compare/${comparison.slug}`} key={comparison.slug}>{comparison.title}</Link>
              ))}
            </div>
          </>
        ) : null}
        {page.sources.length > 0 ? (
          <>
            <h2>Sources</h2>
            <div className="source-grid">
              {page.sources.map((source) => (
                <a className="source-card" href={source.url} key={source.url}>
                  <span className="pill pill-green">{source.type}</span>
                  <strong>{source.label}</strong>
                  <span>{source.purpose}</span>
                  <small>Checked {source.lastChecked}</small>
                </a>
              ))}
            </div>
          </>
        ) : null}
      </article>
    </div>
  );
}
