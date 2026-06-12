import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://7labs.org").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for 7labs.org, including acceptable use, generated-output limits, third-party trademarks, and high-stakes review guidance.",
  alternates: {
    canonical: `${siteUrl}/terms`
  }
};

export default function TermsPage() {
  return (
    <div className="container">
      <section className="page-hero">
        <div className="kicker">Terms</div>
        <h1>Terms of Service</h1>
        <p>These launch terms explain how to use 7labs.org responsibly while the site runs local rule-based tools first and keeps provider-backed generation disabled by default.</p>
      </section>
      <article className="article-card">
        <h2>Use the tools responsibly</h2>
        <ul className="list">
          <li>Use 7labs.org for lawful work, research, drafting, and task support.</li>
          <li>Do not use the tools to create spam, malware, credential theft, deceptive impersonation, harassment, or illegal instructions.</li>
          <li>Do not try to bypass safety limits, overload the service, scrape the site aggressively, or interfere with the deployment.</li>
          <li>Do not submit secrets, passwords, private keys, regulated personal data, or confidential files unless a future feature explicitly supports that workflow with a clear policy.</li>
        </ul>

        <h2>Generated output needs review</h2>
        <ul className="list">
          <li>Outputs may be incomplete, outdated, inaccurate, or unsuitable for your exact situation.</li>
          <li>Review and test generated code, prompts, copy, summaries, and recommendations before relying on them.</li>
          <li>For resumes, hiring material, legal, medical, financial, safety-critical, or other high-stakes work, use qualified human review before taking action.</li>
          <li>7labs.org is provided as-is, without warranties that outputs will be correct, available, secure, or fit for a particular purpose.</li>
        </ul>

        <h2>Third-party products and trademarks</h2>
        <ul className="list">
          <li>Comparison pages and tool references may mention third-party products, providers, models, and trademarks.</li>
          <li>Those names belong to their respective owners. 7labs.org is not endorsed by or affiliated with those providers unless stated otherwise.</li>
          <li>Feature availability, pricing, limits, and model behavior can change. Verify provider details before making paid or production decisions.</li>
        </ul>

        <h2>Contact</h2>
        <p className="meta-line">For terms, safety, or content concerns, use the contact route listed by the site owner for this property. Keep sensitive credentials and private files out of support messages.</p>
      </article>
    </div>
  );
}
