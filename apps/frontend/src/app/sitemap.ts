import { MetadataRoute } from "next";
import { getDoctors } from "@/lib/db/doctors";
import { getVisibleBulletins } from "@/lib/db/bulletins";

const siteUrl = "https://jantamedicare.com";
const locales = ["en", "hi"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // 1. Static Routes
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

  // 2. Dynamic Doctors
  const doctors = await getDoctors();
  for (const doctor of doctors) {
    for (const locale of locales) {
      entries.push({
        url: `${siteUrl}/${locale}/doctors/${doctor.id}`,
        lastModified: new Date(doctor.updated_at || doctor.created_at || new Date()),
        changeFrequency: "monthly",
        priority: 0.9,
      });
    }
  }

  // 3. Dynamic Bulletins (Offers, Products, Camps)
  const bulletins = await getVisibleBulletins(100);
  for (const bulletin of bulletins) {
    for (const locale of locales) {
      entries.push({
        url: `${siteUrl}/${locale}/bulletins/${bulletin.id}`,
        lastModified: new Date(bulletin.created_at),
        changeFrequency: bulletin.kind === "offer" ? "daily" : "monthly",
        priority: bulletin.kind === "offer" ? 0.9 : 0.7,
      });
    }
  }

  return entries;
}
