import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://jantamedicare.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/en/admin/", "/hi/admin/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
