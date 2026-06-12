import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { bestPages } from "@/lib/bestPages";
import { comparePages, getComparePage } from "@/lib/comparePages";
import { getRelatedTools } from "@/lib/tools";
import { ToolGrid } from "@/components/ToolGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { absoluteUrl, articleJsonLd, breadcrumbJsonLd, itemListJsonLd, siteUrl } from "@/lib/seo";

type ComparePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return comparePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getComparePage(slug);
  if (!page) return {};
  const pageUrl = `${siteUrl}/compare/${page.slug}`;
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

export default async function ComparePage({ params }: ComparePageProps) {
  const { slug } = await params;
  const page = getComparePage(slug);
  if (!page) notFound();
  const related = getRelatedTools(page.relatedTools);
  const relatedBestPages = bestPages.filter((bestPage) => bestPage.relatedComparisons.includes(page.slug));
  const pageUrl = absoluteUrl(`/compare/${page.slug}`);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: "AI tool comparisons", url: absoluteUrl("/compare") },
    { name: page.title, url: pageUrl }
  ]);
  const articleSchema = articleJsonLd({
    url: pageUrl,
    title: page.title,
    description: page.description,
    lastReviewed: page.lastReviewed,
    type: "TechArticle"
  });
  const optionListSchema = itemListJsonLd({
    url: pageUrl,
    name: `${page.left} and ${page.right} comparison options`,
    items: [
      { name: page.left, description: page.bestForLeft },
      { name: page.right, description: page.bestForRight }
    ]
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(optionListSchema) }}
      />
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Compare", href: "/compare" },
        { label: page.title }
      ]} />
      <section className="page-hero">
        <div className="kicker">Compare</div>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
        <p className="meta-line">Last reviewed: {page.lastReviewed}. Use this as a workflow decision guide, not a permanent ranking.</p>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-kicker">Related Tools</div>
            <h2>Break down the task before choosing</h2>
            <p>Comparison pages should point to executable tools first, not only generic product opinions.</p>
          </div>
        </div>
        <ToolGrid tools={related} trackingSource={page.slug} />
      </section>

      {relatedBestPages.length > 0 ? (
        <section className="section article-card">
          <div className="section-kicker">Best Guides</div>
          <h2>Related best AI guides</h2>
          <div className="link-row">
            {relatedBestPages.map((bestPage) => (
              <Link className="ghost-button" href={`/best/${bestPage.slug}`} key={bestPage.slug}>{bestPage.title}</Link>
            ))}
          </div>
        </section>
      ) : null}

      <article className="article-card">
        <p className="meta-line">Comparison criteria: {page.selectionCriteria.join(", ")}.</p>
        <p className="meta-line">Source links checked: {page.sourceLastChecked ?? page.lastReviewed}. Re-test paid decisions when pricing, limits, or model defaults change.</p>
        <h2>Verdict</h2>
        <p>{page.verdict}</p>
        <div className="article-grid">
          <div className="content-card">
            <span className="pill pill-blue">Best for {page.left}</span>
            <p>{page.bestForLeft}</p>
          </div>
          <div className="content-card">
            <span className="pill pill-green">Best for {page.right}</span>
            <p>{page.bestForRight}</p>
          </div>
        </div>
        <h2>Decision rule</h2>
        <p>{page.decisionRule}</p>
        <table className="table-lite">
          <thead>
            <tr><th>Factor</th><th>{page.left}</th><th>{page.right}</th></tr>
          </thead>
          <tbody>
            {page.rows.map((row) => (
              <tr key={row.factor}>
                <td>{row.factor}</td>
                <td>{row.left}</td>
                <td>{row.right}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>Evidence notes</h2>
        <ul className="list">
          {page.evidenceNotes.map((note) => <li key={note}>{note}</li>)}
        </ul>
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
        <div className="link-row">
          <Link className="secondary-button" href="/tools/ai-tool-comparison-generator">Generate your own comparison</Link>
          <Link className="ghost-button" href="/tools/ai-tool-finder">Find a tool stack</Link>
        </div>
      </article>
    </div>
  );
}
