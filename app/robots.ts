import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://tu-dominio-oficial.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"], // Protege el panel y los endpoints internos
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}