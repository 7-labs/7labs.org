export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://7labs.org").replace(/\/$/, "");
export const siteName = "7labs.org";
export const siteImage = `${siteUrl}/opengraph-image.png`;
export const defaultReviewedDate = "2026-05-31";

export type BreadcrumbJsonLdItem = {
  name: string;
  url: string;
};

type ArticleJsonLdInput = {
  url: string;
  title: string;
  description: string;
  lastReviewed: string;
  type?: "Article" | "TechArticle";
};

type ItemListJsonLdInput = {
  url: string;
  name: string;
  items: { name: string; url?: string; description?: string }[];
};

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function breadcrumbJsonLd(items: BreadcrumbJsonLdItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function articleJsonLd({ url, title, description, lastReviewed, type = "Article" }: ArticleJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    datePublished: lastReviewed,
    dateModified: lastReviewed,
    image: siteImage,
    author: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/favicon.svg")
      }
    }
  };
}

export function itemListJsonLd({ url, name, items }: ItemListJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
      description: item.description
    }))
  };
}
