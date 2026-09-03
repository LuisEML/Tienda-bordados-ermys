// app/productos/[id]/page.tsx

import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import VistaProducto from "@/app/components/VistaProducto"; 
import Link from "next/link";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

// 1. METADATOS DINÁMICOS PARA SEO Y REDES SOCIALES
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const { data: producto } = await supabase
    .from("productos")
    .select("nombre, descripcion, imagen_principal_url, precio_menudeo")
    .eq("id", id)
    .single();

  if (!producto) {
    return {
      title: "Producto no encontrado | ERMY’S",
    };
  }

  const titulo = `${producto.nombre} | Confecciones y Bordados ERMY’S`;
  const descripcion = producto.descripcion 
    ? `${producto.descripcion.slice(0, 150)}... - $${producto.precio_menudeo} MXN`
    : `Pieza artesanal única hecha a mano. Precio: $${producto.precio_menudeo} MXN.`;

  return {
    title: producto.nombre,
    description: descripcion,
    openGraph: {
      title: titulo,
      description: descripcion,
      url: `https://tu-dominio-oficial.com/productos/${id}`,
      siteName: "Confecciones y Bordados ERMY’S",
      images: [
        {
          url: producto.imagen_principal_url,
          alt: producto.nombre,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
      images: [producto.imagen_principal_url],
    },
  };
}

// 2. COMPONENTE PRINCIPAL
export default async function ProductoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Traemos el producto con sus relaciones (incluyendo imagenes_producto)
  const { data: producto, error } = await supabase
    .from("productos")
    .select(`
      *,
      categorias (nombre, guia_tallas_hombre_url, guia_tallas_mujer_url, guia_tallas_ninos_url, guia_tallas_ninas_url),
      variaciones (*),
      imagenes_producto (*) 
    `)
    .eq("id", id)
    .single();

  if (error || !producto) {
    notFound();
  }

  // Traemos prendas similares
  const { data: similaresData } = await supabase
    .from("productos")
    .select(`
      id,
      nombre,
      precio_menudeo,
      imagen_principal_url,
      categorias (nombre)
    `)
    .eq("categoria_id", producto.categoria_id)
    .neq("id", id)
    .limit(4);

  const prendasSimilares = (similaresData || []) as any[];

  return (
    <main className="min-h-screen bg-stone-50 py-12 md:py-20 px-6">
      <Link 
        href="/productos" 
        className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase font-bold text-stone-400 hover:text-stone-800 transition-colors mb-8 cursor-pointer group"
      >
        <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span> 
        Volver al catálogo
      </Link>
      <div className="max-w-7xl mx-auto">
        <VistaProducto producto={producto} />

        {prendasSimilares && prendasSimilares.length > 0 && (
          <section className="mt-24 pt-12 border-t border-stone-200/60">
            <h2 className="font-serif text-2xl italic text-stone-800 tracking-wide mb-8">
              También te puede interesar
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {prendasSimilares.map((item) => (
                <Link 
                  href={`/productos/${item.id}`} 
                  key={item.id}
                  className="group flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-100 mb-4 shadow-2xs">
                    <img
                      src={item.imagen_principal_url}
                      alt={item.nombre}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-103"
                    />
                  </div>

                  <div className="px-1">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 block mb-1">
                      {item.categorias?.nombre || "Bordado"}
                    </span>
                    <h3 className="font-serif text-base text-stone-800 tracking-wide line-clamp-1 group-hover:text-stone-600 transition-colors">
                      {item.nombre}
                    </h3>
                    <p className="font-serif text-lg text-stone-900 font-medium mt-1">
                      ${item.precio_menudeo}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}