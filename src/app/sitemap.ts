import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://bes114.com";
  const pages = [
    "",
    "/products/opening-ceremony",
    "/products/stage-lighting",
    "/products/event-planning",
    "/products/bartending",
    "/showgirl",
    "/cases",
    "/contact",
  ];

  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
