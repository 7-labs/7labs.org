import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ToolRunner } from "@/components/ToolRunner";
import { ToolGrid } from "@/components/ToolGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { categories, getRelatedTools, getTool, tools } from "@/lib/tools";
import { getBestPage } from "@/lib/bestPages";
import { getComparePage } from "@/lib/comparePages";
import { absoluteUrl, breadcrumbJsonLd, siteUrl } from "@/lib/seo";

type ToolPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  const toolUrl = `${siteUrl}/tools/${tool.slug}`;
  const ogImage = `${toolUrl}/opengraph-image`;
  return {
    title: `${tool.name} - Free Online AI Tool`,
    description: tool.description,
    keywords: tool.keywords,
    alternates: {
      canonical: toolUrl
    },
    openGraph: {
      title: `${tool.name} | 7labs.org`,
      description: tool.description,
      url: toolUrl,
      type: "website",
      images: [ogImage]
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} | 7labs.org`,
      description: tool.description,
      images: [ogImage]
    }
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const category = categories[tool.category];
  const related = getRelatedTools(tool.relatedSlugs);
  const relatedBestPages = tool.relatedBestSlugs.map(getBestPage).filter((page): page is NonNullable<ReturnType<typeof getBestPage>> => Boolean(page));
  const relatedComparePages = tool.relatedCompareSlugs.map(getComparePage).filter((page): page is NonNullable<ReturnType<typeof getComparePage>> => Boolean(page));
  const toolUrl = `${siteUrl}/tools/${tool.slug}`;
  const breadcrumbs = [
    { name: "Home", url: absoluteUrl("/") },
    { name: "Tools", url: absoluteUrl("/tools") },
    { name: tool.name, url: toolUrl }
  ];
  const faqItems = [
    {
      question: `Is ${tool.name} free?`,
      answer: tool.monetization === "free"
        ? "The current tool can be used for free and runs on local rules by default, so no API key is required."
        : "The current tool can be tried with basic features. Long inputs, history, batch export, and premium models are good candidates for a paid tier."
    },
    {
      question: "Does this tool call an external AI model?",
      answer: "Not by default. When AI_PROVIDER=none, the tool uses the local rule engine. Provider-backed generation should only be enabled after quotas, caching, rate limits, and spend controls are configured."
    },
    {
      question: "How should a production version improve this?",
      answer: "Use real usage data to upgrade the highest-frequency tools first, then add login, quotas, caching, and paid controls for long documents, long code, batch work, and premium models."
    }
  ];
  const webApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    url: toolUrl,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    description: tool.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
  const breadcrumbSchema = breadcrumbJsonLd(breadcrumbs);

  return (
    <div className="container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Tools", href: "/tools" },
        { label: tool.name }
      ]} />
      <section className="page-hero">
        <span className={`pill pill-${category.accent}`}>{category.name}</span>
        <h1>{tool.name}</h1>
        <p>{tool.description}</p>
        <p className="meta-line">Last reviewed: {tool.lastReviewed}. Default mode: local rules, no external model call.</p>
        <div className="hero-actions">
          <a className="primary-button" href="#try">Use this tool</a>
          <Link className="secondary-button" href="/tools">Back to tools</Link>
          <Link className="ghost-button" href={`/tools?category=${tool.category}`}>{category.name}</Link>
        </div>
      </section>

      <ToolRunner tool={tool} />

      <section className="section detail-grid">
        <article className="article-card">
          <div className="section-kicker">Example Run</div>
          <h2>Sample input</h2>
          {tool.exampleRuns.slice(0, 2).map((example) => (
            <div className="sample-panel" key={example.label}>
              <h3>{example.label}</h3>
              <dl>
                {Object.entries(example.values).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p><strong>Expected output: </strong>{example.outputPreview}</p>
            </div>
          ))}
        </article>
        <article className="article-card">
          <div className="section-kicker">Limits</div>
          <h2>What this tool can and cannot do</h2>
          <p>{tool.sampleOutput}</p>
          <ul className="list">
            {tool.limitations.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <h3>Upgrade path</h3>
          <p>{tool.upgradePath}</p>
        </article>
      </section>

      <section className="section article-grid">
        <article className="article-card">
          <div className="section-kicker">How it works</div>
          <h2>Tool logic</h2>
          <ol className="list">
            {tool.howItWorks.map((item) => <li key={item}>{item}</li>)}
          </ol>
        </article>
        <article className="article-card">
          <div className="section-kicker">Use Cases</div>
          <h2>Use cases</h2>
          <ul className="list">
            {tool.useCases.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      </section>

      {(relatedBestPages.length > 0 || relatedComparePages.length > 0) ? (
        <section className="section article-card">
          <div className="section-kicker">Decision Support</div>
          <h2>Related guides and comparisons</h2>
          <div className="link-row">
            {relatedBestPages.map((page) => (
              <Link className="ghost-button" href={`/best/${page.slug}`} key={page.slug}>{page.title}</Link>
            ))}
            {relatedComparePages.map((page) => (
              <Link className="ghost-button" href={`/compare/${page.slug}`} key={page.slug}>{page.title}</Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section article-card">
        <div className="section-kicker">FAQ</div>
        <h2>FAQ</h2>
        <div className="faq-list">
          {faqItems.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section">
          <div className="section-head">
            <div>
              <div className="section-kicker">Related</div>
              <h2>Related tools</h2>
            </div>
          </div>
          <ToolGrid tools={related} />
        </section>
      ) : null}
    </div>
  );
}
