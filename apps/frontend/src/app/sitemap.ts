import { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://projectmedicare.roshhellwett.workers.dev";
const locales = ["en", "hi"];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/medicines",
    "/patient-rate-chart",
    "/locations",
    "/doctors",
    "/bulletins",
    "/gallery",
    "/careers",
    "/order",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    for (const locale of locales) {
      entries.push({
        url: `${siteUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1 : 0.8,
      });
    }
  }

  return entries;
}
