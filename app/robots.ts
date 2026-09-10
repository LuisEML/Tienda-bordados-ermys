import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
const baseUrl = process.env.APP_URL || "https://ropatipicaermys.com.mx";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"], // Protege el panel y los endpoints internos
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}