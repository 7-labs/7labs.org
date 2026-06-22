import type { Metadata } from "next";
import Link from "next/link";
import { ToolGrid } from "@/components/ToolGrid";
import { NewsletterCapture } from "@/components/NewsletterCapture";
import { categories, tools } from "@/lib/tools";
import { bestPages } from "@/lib/bestPages";
import { comparePages } from "@/lib/comparePages";
import { siteImage, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "7labs.org - AI Tools for Real Work",
  description: "Pick the right AI workflow before you spend credits. 7labs.org helps creators, developers, operators, and document-heavy teams structure real AI tasks.",
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: "7labs.org - AI Tools for Real Work",
    description: "Pick the right AI workflow before you spend credits.",
    url: siteUrl,
    type: "website",
    images: [siteImage]
  },
  twitter: {
    card: "summary_large_image",
    title: "7labs.org - AI Tools for Real Work",
    description: "Pick the right AI workflow before you spend credits.",
    images: [siteImage]
  }
};

export default function HomePage() {
  const featured = tools.slice(0, 9);
  const taskLanes = [
    { title: "Choose an AI stack", href: "/tools/ai-tool-finder", copy: "Turn a task, budget, and workflow into a practical tool stack." },
    { title: "Debug developer work", href: "/tools/error-explainer", copy: "Explain errors, generate regex, draft SQL, and clean JSON faster." },
    { title: "Build creator assets", href: "/tools/youtube-thumbnail-prompt-generator", copy: "Move from YouTube idea to thumbnail prompt, script, and short-form hooks." },
    { title: "Summarize documents", href: "/tools/pdf-summarizer", copy: "Start with pasted text before investing in upload, citation, and export workflows." },
    { title: "Improve prompts", href: "/tools/prompt-optimizer", copy: "Add role, context, constraints, output format, and review criteria." }
  ];
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="kicker">English-first AI Tools Lab</div>
            <h1>Pick the right AI workflow before you spend credits.</h1>
            <p>
              <span className="desktop-copy">7labs.org is a launch-safe AI workbench for English-speaking creators, developers, operators, and document-heavy teams. Start with local rule-based tools, then upgrade only the workflows that prove repeat use.</span>
              <span className="mobile-copy">Start with local AI tools for creators, developers, operators, and document-heavy teams.</span>
            </p>
            <div className="hero-actions">
              <Link className="primary-button" href="/tools/ai-tool-finder">Find an AI tool</Link>
              <Link className="secondary-button" href="/tools">Browse all tools</Link>
            </div>
            <div className="trust-strip" aria-label="Launch safeguards">
              <span>No API key required</span>
              <span>{tools.length} working tools</span>
              <span>English-first SEO pages</span>
            </div>
          </div>
          <div className="hero-panel">
            <div className="hero-panel-head">
              <span className="section-kicker">Start With A Task</span>
              <p>Choose the lane closest to the work you need to finish.</p>
            </div>
            <div className="task-picker">
              {taskLanes.map((lane) => (
                <Link
                  className="task-link"
                  href={lane.href}
                  key={lane.href}
                >
                  <strong>{lane.title}</strong>
                  <span>{lane.copy}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container metric-strip">
          <div className="metric"><strong>{tools.length}</strong><span>launch tools</span></div>
          <div className="metric"><strong>{bestPages.length}</strong><span>best AI guides</span></div>
          <div className="metric"><strong>{comparePages.length}</strong><span>comparison pages</span></div>
          <div className="metric"><strong>none</strong><span>default AI provider</span></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-kicker">Featured Tools</div>
              <h2>High-demand tools for English users</h2>
              <p>Start with low-cost tools that people search for every day: AI tool recommendations, developer utilities, prompt generators, document summaries, and creator workflows.</p>
            </div>
            <Link className="ghost-button" href="/tools">All tools</Link>
          </div>
          <ToolGrid tools={featured} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-kicker">Labs</div>
              <h2>A domain structure built around tasks</h2>
              <p>7labs starts with focused work labs. The public launch prioritizes AI Finder, Developer Lab, Prompt Studio, and Document Lab because they combine search demand, repeat usage, and monetization potential.</p>
            </div>
          </div>
          <div className="tool-grid">
            {Object.entries(categories).map(([key, category]) => (
              <Link className="content-card" href={`/tools?category=${key}`} key={key}>
                <span className={`pill pill-${category.accent}`}>{category.name}</span>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-kicker">Guides</div>
              <h2>Task pages beat generic AI content</h2>
              <p>Every best-of page connects search intent to a working tool and a practical workflow. No empty directory pages, no generic AI news feed.</p>
            </div>
          </div>
          <div className="tool-grid">
            {bestPages.map((page) => (
              <Link className="content-card" href={`/best/${page.slug}`} key={page.slug}>
                <span className="pill pill-blue">Best AI for</span>
                <h3>{page.title}</h3>
                <p>{page.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="section-kicker">Comparisons</div>
              <h2>Decide between popular AI tools</h2>
              <p>Side-by-side comparisons that map each option to the workflow it actually fits, with a clear decision rule instead of a generic feature table.</p>
            </div>
            <Link className="ghost-button" href="/compare">All comparisons</Link>
          </div>
          <div className="tool-grid">
            {comparePages.map((page) => (
              <Link className="content-card" href={`/compare/${page.slug}`} key={page.slug}>
                <span className="pill pill-teal">Compare</span>
                <h3>{page.title}</h3>
                <p>{page.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container cta-band">
        <div>
          <h2>Launch order: tools → workflows → paid document features</h2>
          <p>Use free tools and prompt templates to earn traffic, then monetize document processing, exports, saved workflows, team spaces, and premium model calls.</p>
        </div>
        <Link className="secondary-button" href="/roadmap">View roadmap</Link>
      </section>

      <NewsletterCapture />
    </>
  );
}
