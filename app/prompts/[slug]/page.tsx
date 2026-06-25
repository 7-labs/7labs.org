import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PromptExampleList } from "@/components/PromptExampleList";
import { ToolRunner } from "@/components/ToolRunner";
import { getPromptPage, promptPages } from "@/lib/promptPages";
import { getTool } from "@/lib/tools";
import { getBestPage } from "@/lib/bestPages";
import { getComparePage } from "@/lib/comparePages";
import { absoluteUrl, articleJsonLd, breadcrumbJsonLd, itemListJsonLd, siteUrl } from "@/lib/seo";

type PromptPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return promptPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PromptPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getPromptPage(slug);
  if (!page) return {};
  const pageUrl = `${siteUrl}/prompts/${page.slug}`;
  const ogImage = `${pageUrl}/opengraph-image`;
  return {
    title: page.title,
    description: page.metaDescription,
    alternates: {
      canonical: pageUrl
    },
    openGraph: {
      title: `${page.title} | 7labs.org`,
      description: page.metaDescription,
      url: pageUrl,
      type: "article",
      images: [ogImage]
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} | 7labs.org`,
      description: page.metaDescription,
      images: [ogImage]
    }
  };
}

export default async function PromptLibraryPage({ params }: PromptPageProps) {
  const { slug } = await params;
  const page = getPromptPage(slug);
  if (!page) notFound();
  const tool = getTool(page.toolSlug);
  if (!tool) notFound();
  const pageUrl = absoluteUrl(`/prompts/${page.slug}`);
  const relatedPages = page.relatedSlugs.map(getPromptPage).filter((item): item is NonNullable<ReturnType<typeof getPromptPage>> => Boolean(item));
  const relatedBestPages = (page.relatedBestSlugs ?? []).map(getBestPage).filter((item): item is NonNullable<ReturnType<typeof getBestPage>> => Boolean(item));
  const relatedComparePages = (page.relatedCompareSlugs ?? []).map(getComparePage).filter((item): item is NonNullable<ReturnType<typeof getComparePage>> => Boolean(item));
  const sample = tool.exampleRuns[0];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Prompt Studio", url: absoluteUrl("/prompts") },
    { name: page.title, url: pageUrl }
  ]);
  const examplesSchema = itemListJsonLd({
    url: pageUrl,
    name: `${page.title} examples`,
    items: page.examples.map((example) => ({
      name: example.label,
      description: example.notes
    }))
  });
  const articleSchema = articleJsonLd({
    url: pageUrl,
    title: page.title,
    description: page.metaDescription,
    lastReviewed: page.lastReviewed,
    type: "Article"
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(examplesSchema) }}
      />
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Prompt Studio", href: "/prompts" },
        { label: page.title }
      ]} />
      <section className="page-hero">
        <div className="kicker">Prompt Library</div>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
        <p className="meta-line">Last reviewed: {page.lastReviewed}. This is a copy-ready prompt library: start from a curated example, then open the generator below when you need a fully custom prompt.</p>
        <div className="hero-actions">
          <a className="primary-button" href="#examples">Browse copy-ready examples</a>
          <a className="secondary-button" href="#try">Generate a custom prompt</a>
        </div>
      </section>

      <section className="section" id="examples">
        <div className="section-head">
          <div>
            <div className="section-kicker">Curated Examples</div>
            <h2>Copy-ready prompt examples</h2>
            <p>These examples are complete enough to paste into an image or video model, then tune for the exact provider. Copy one as a starting point before generating your own.</p>
          </div>
        </div>
        <PromptExampleList examples={page.examples} pageSlug={page.slug} />
      </section>

      <section className="section" id="try">
        <div className="section-head">
          <div>
            <div className="section-kicker">Generator</div>
            <h2>Need a custom prompt? Generate one</h2>
            <p>When the curated examples are close but you need your own subject, audience, platform, or shot constraints, run the generator to build a fresh prompt.</p>
          </div>
        </div>
        <ToolRunner tool={tool} />
      </section>

      <section className="section detail-grid">
        <article className="article-card">
          <div className="section-kicker">Sample input</div>
          <h2>Example generator input</h2>
          {sample ? (
            <dl className="sample-definition-list">
              {Object.entries(sample.values).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </article>
        <article className="article-card">
          <div className="section-kicker">Sample output</div>
          <h2>Expected output</h2>
          <p>{sample?.outputPreview ?? tool.sampleOutput}</p>
          <h3>Limitations</h3>
          <ul className="list">
            {tool.limitations.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      </section>

      <section className="section article-grid">
        <article className="article-card">
          <div className="section-kicker">Tips</div>
          <h2>Prompting tips</h2>
          <ul className="list">
            {page.tips.map((tip) => <li key={tip}>{tip}</li>)}
          </ul>
        </article>
        <article className="article-card">
          <div className="section-kicker">Related</div>
          <h2>Related prompt libraries</h2>
          <div className="link-row">
            <Link className="ghost-button" href={`/tools/${tool.slug}`}>{tool.name}</Link>
            {relatedPages.slice(0, 2).map((related) => (
              <Link className="ghost-button" href={`/prompts/${related.slug}`} key={related.slug}>{related.title}</Link>
            ))}
            <Link className="secondary-button" href="/prompts">Prompt Studio</Link>
          </div>
        </article>
      </section>

      {(relatedBestPages.length > 0 || relatedComparePages.length > 0) ? (
        <section className="section article-card">
          <div className="section-kicker">Decision Support</div>
          <h2>Related guides and comparisons</h2>
          <div className="link-row">
            {relatedBestPages.map((bestPage) => (
              <Link className="ghost-button" href={`/best/${bestPage.slug}`} key={bestPage.slug}>{bestPage.title}</Link>
            ))}
            {relatedComparePages.map((comparePage) => (
              <Link className="ghost-button" href={`/compare/${comparePage.slug}`} key={comparePage.slug}>{comparePage.title}</Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section article-card">
        <div className="section-kicker">FAQ</div>
        <h2>FAQ</h2>
        <div className="faq-list">
          {page.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
