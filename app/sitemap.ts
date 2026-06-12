import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { bestPages } from "@/lib/bestPages";
import { comparePages } from "@/lib/comparePages";
import { promptPages } from "@/lib/promptPages";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://7labs.org").replace(/\/$/, "");
  const fallbackLastModified = new Date("2026-05-31");
  const staticRoutes = ["", "/tools", "/best", "/compare", "/prompts", "/models", "/roadmap", "/privacy", "/terms"];
  return [
    ...staticRoutes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: fallbackLastModified })),
    ...tools.map((tool) => ({ url: `${baseUrl}/tools/${tool.slug}`, lastModified: new Date(tool.lastReviewed || "2026-05-31") })),
    ...bestPages.map((page) => ({ url: `${baseUrl}/best/${page.slug}`, lastModified: new Date(page.lastReviewed || "2026-05-31") })),
    ...comparePages.map((page) => ({ url: `${baseUrl}/compare/${page.slug}`, lastModified: new Date(page.lastReviewed || "2026-05-31") })),
    ...promptPages.map((page) => ({ url: `${baseUrl}/prompts/${page.slug}`, lastModified: new Date(page.lastReviewed || "2026-05-31") }))
  ];
}
