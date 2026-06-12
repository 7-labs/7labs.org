import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://7labs.org").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "90-Day Product Roadmap",
  description: "The 90-day execution plan for 7labs.org: English-first tool pages, SEO growth, document monetization, and product validation.",
  alternates: {
    canonical: `${siteUrl}/roadmap`
  }
};

const phases = [
  { title: "Weeks 1-2: Launch-grade surface", items: ["32 working tools, 5 Best AI pages, and 4 comparison pages", "Task-first homepage, breadcrumbs, visible FAQ, and schema hardening", "Static validation, OpenClaw build, and browser QA"] },
  { title: "Weeks 3-6: Measurement and depth", items: ["No-op analytics seam, feedback events, and copy/run tracking", "Deepen top 10 tool pages with examples, sample output, limitations, and upgrade path", "Search Console and Bing Webmaster Tools review"] },
  { title: "Weeks 7-10: Expansion candidates", items: ["Expand only pages with distinct working tools and useful examples", "Review external tool claims with source links and last-reviewed dates", "Choose newsletter provider after launch channel data exists"] },
  { title: "Weeks 11-12: Monetization decision", items: ["Identify 1-3 repeat-use workflows", "Decide whether Document Lab deserves login, credits, uploads, citations, and exports", "Keep paid model calls disabled until cost controls are ready"] }
];

export default function RoadmapPage() {
  return (
    <div className="container">
      <section className="page-hero">
        <div className="kicker">Roadmap</div>
        <h1>90-day launch plan for English users</h1>
        <p>The goal is not to build every AI feature at once. The goal is to validate search traffic, repeat usage, and paid document workflows with the lowest possible operating cost.</p>
      </section>
      <section className="section">
        <div className="tool-grid">
          {phases.map((phase) => (
            <div className="content-card" key={phase.title}>
              <span className="pill pill-purple">Phase</span>
              <h3>{phase.title}</h3>
              <ul className="list">
                {phase.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
