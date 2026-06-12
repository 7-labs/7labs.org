import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://7labs.org").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Privacy and Safety Principles",
  description: "Privacy and safety principles for 7labs.org: no file training, deletion controls, sensitive-data warnings, and human review for high-risk outputs.",
  alternates: {
    canonical: `${siteUrl}/privacy`
  }
};

export default function PrivacyPage() {
  return (
    <div className="container">
      <section className="page-hero">
        <div className="kicker">Privacy</div>
        <h1>Privacy and safety principles</h1>
        <p>These are the launch safety principles for 7labs. Before paid document uploads or provider-backed generation, review the final policy against your company, hosting region, model providers, and target markets.</p>
      </section>
      <article className="article-card">
        <h2>Recommended commitments</h2>
        <ul className="list">
          <li>Do not use uploaded user files to train models.</li>
          <li>Delete free-user uploads automatically after a short retention window.</li>
          <li>Let paid users save, export, and delete their history.</li>
          <li>Warn users not to upload secrets, passwords, private keys, or sensitive IDs.</li>
          <li>Require human review for legal, medical, financial, and other high-risk use cases.</li>
          <li>Keep analytics disabled by default until an explicit provider is configured.</li>
          <li>Do not include generated tool output in event payloads.</li>
          <li>Keep newsletter capture hidden while <code>NEWSLETTER_PROVIDER=none</code>.</li>
        </ul>
      </article>
    </div>
  );
}
