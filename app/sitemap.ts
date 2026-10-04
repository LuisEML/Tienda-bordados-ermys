import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
const baseUrl = process.env.APP_URL || "https://www.ropatipicaermys.com.mx";

 // 1. Obtener todos los productos de Supabase
  const { data: productos } = await supabase
    .from("productos")
    .select("id, updated_at");

  const rutasProductos: MetadataRoute.Sitemap =
    productos?.map((prod) => ({
      url: `${baseUrl}/productos/${prod.id}`,
      lastModified: prod.updated_at ? new Date(prod.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) || [];

  // 2. Rutas estáticas principales
  const rutasEstaticas: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalogo`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nosotros`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  return [...rutasEstaticas, ...rutasProductos];
}