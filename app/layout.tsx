import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { siteImage, siteName, siteUrl } from "@/lib/seo";

const displayFont = localFont({
  src: "../public/fonts/fraunces-700.woff2",
  weight: "700",
  style: "normal",
  variable: "--font-display",
  display: "swap"
});

const bodyFont = localFont({
  src: [
    { path: "../public/fonts/ibm-plex-sans-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/ibm-plex-sans-700.woff2", weight: "700", style: "normal" }
  ],
  variable: "--font-body",
  display: "swap",
  preload: false
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "7labs.org - AI Tools for Real Work",
    template: "%s | 7labs.org"
  },
  description: "7labs.org is an English-first AI tools workbench for real tasks: AI tool finder, developer utilities, prompt studio, document workflows, and creator tools.",
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: "7labs.org - AI Tools for Real Work",
    description: "Find the right AI tool, generate better prompts, debug code, summarize documents, and ship practical workflows.",
    url: siteUrl,
    siteName,
    type: "website",
    images: [siteImage]
  },
  twitter: {
    card: "summary_large_image",
    title: "7labs.org",
    description: "AI Tools for Real Work",
    images: [siteImage]
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION }
      : undefined
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cfBeaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl
  };
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`
  };

  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {cfBeaconToken ? (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: cfBeaconToken })}
          />
        ) : null}
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
