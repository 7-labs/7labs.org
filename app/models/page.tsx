import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://7labs.org").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "AI Model Routing Strategy",
  description: "Model routing and cost controls for 7labs.org: local rules, lightweight models, premium models, document workflows, and image generation limits.",
  alternates: {
    canonical: `${siteUrl}/models`
  }
};

const rows = [
  { task: "Prompt generation", model: "Local templates or lightweight text model", reason: "High volume, low risk, easy to cache" },
  { task: "Developer error explanation", model: "Rules plus lightweight LLM", reason: "Needs structured output but must stay cost-efficient" },
  { task: "PDF and long documents", model: "Long-context model plus retrieval", reason: "Needs citations, chunking, and reliable summaries" },
  { task: "Image generation", model: "Per-image paid model", reason: "Requires credits, rate limits, and abuse controls" },
  { task: "AI tool search", model: "Owned database plus scheduled refresh", reason: "Avoid live-search costs on every request" }
];

export default function ModelsPage() {
  return (
    <div className="container">
      <section className="page-hero">
        <div className="kicker">Model Router</div>
        <h1>The best model is the one routed to the right task.</h1>
        <p>7labs does not call external APIs by default. Start with local tools, measure demand, then attach lightweight or premium models only to the highest-value workflows.</p>
      </section>
      <article className="article-card">
        <h2>Recommended routing</h2>
        <table className="table-lite">
          <thead><tr><th>Task</th><th>Model strategy</th><th>Reason</th></tr></thead>
          <tbody>
            {rows.map((row) => <tr key={row.task}><td>{row.task}</td><td>{row.model}</td><td>{row.reason}</td></tr>)}
          </tbody>
        </table>
        <h2>Production cost controls</h2>
        <ul className="list">
          <li>IP rate limits, logged-in quotas, and a credits system.</li>
          <li>Cache identical inputs and reusable prompt templates.</li>
          <li>Charge long documents by page, token, or file size.</li>
          <li>Never offer unlimited free image generation.</li>
          <li>Reserve premium models for paid users or high-value workflows.</li>
        </ul>
      </article>
    </div>
  );
}
