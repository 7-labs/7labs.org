import Link from "next/link";

const nav = [
  { href: "/tools", label: "Tools" },
  { href: "/best", label: "Best AI" },
  { href: "/compare", label: "Compare" },
  { href: "/prompts", label: "Prompts" },
  { href: "/models", label: "Models" }
];

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="7labs.org home">
        <span className="brand-mark">7</span>
        <span>
          <strong>7labs.org</strong>
          <em>AI Tools Lab</em>
        </span>
      </Link>
      <nav className="top-nav top-nav-desktop" aria-label="Main navigation">
        {nav.map((item) => (
          <Link key={item.href} href={item.href}>{item.label}</Link>
        ))}
      </nav>
      <details className="nav-menu">
        <summary aria-label="Toggle main navigation">Menu</summary>
        <nav className="top-nav top-nav-mobile" aria-label="Main navigation">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>
      </details>
    </header>
  );
}
