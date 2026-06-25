import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>7labs.org</strong>
        <p>AI tools for real work. The MVP ships with local rule-based tools first, then optional LLM upgrades when usage proves demand.</p>
      </div>
      <div className="footer-links">
        <Link href="/tools">Tools</Link>
        <Link href="/best">Best AI</Link>
        <Link href="/compare">Compare</Link>
        <Link href="/prompts">Prompts</Link>
        <Link href="/models">Models</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/roadmap">Roadmap</Link>
      </div>
    </footer>
  );
}
