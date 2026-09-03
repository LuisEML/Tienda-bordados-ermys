import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tu-dominio-oficial.com";

  // 1. Obtener todos los productos de Supabase
  const { data: productos } = await supabase
    .from("productos")
    .select("id, updated_at");

  const rutasProductos =
    productos?.map((prod) => ({
      url: `${baseUrl}/productos/${prod.id}`,
      lastModified: prod.updated_at ? new Date(prod.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) || [];

  // 2. Rutas estáticas principales
  const rutasEstaticas = [
    "",
    "/nosotros",
    "/contacto",
    "/catalogo",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1.0 : 0.7,
  }));

  return [...rutasEstaticas, ...rutasProductos];
}