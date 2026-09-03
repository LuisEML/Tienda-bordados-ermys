"use client";
import Image from "next/image";
import Link from 'next/link';
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function DestacadosGrid({ productos }: { productos: any[] }) {
  // Si no hay productos aún, mostramos un estado de carga simple
  if (!productos || productos.length === 0) {
    return <div className="text-center py-20 italic text-stone-400">Cargando piezas exclusivas...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16 px-4 md:px-0">
      {productos.map((producto) => (
        <Link href={`/productos/${producto.id}`} key={producto.id} className="group">
          <motion.div 
            whileHover={{ y: -10 }}
            className="h-full flex flex-col"
          >
            {/* CONTENEDOR DE IMAGEN */}
            <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 rounded-2xl mb-6 shadow-sm border border-stone-100">
              <Image
                src={producto?.imagen_principal_url || "/placeholder.jpg"}
                alt={producto?.nombre || "Producto Bordado"}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* BADGE CATEGORÍA (Relación que agregamos) */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] tracking-[0.2em] uppercase font-bold text-stone-500 shadow-sm">
                {producto?.categorias?.nombre || "Artesanía"}
              </div>

              {/* BADGE DESTACADO */}
              <div className="absolute top-4 right-4 bg-stone-800 text-white px-3 py-1 rounded-full text-[8px] tracking-[0.2em] uppercase font-bold">
                Pieza Única
              </div>
            </div>

            {/* INFORMACIÓN */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif text-2xl italic text-stone-800 group-hover:text-tierra transition-colors">
                  {producto?.nombre}
                </h3>
                <ArrowUpRight className="w-5 h-5 text-stone-300 group-hover:text-tierra transition-colors" />
              </div>

              {/* BOLITAS DE COLORES (Dinamismo visual) */}
              <div className="flex gap-1.5 mb-4">
                {producto?.variaciones?.slice(0, 3).map((v: any, i: number) => (
                  <div 
                    key={i}
                    className="w-2.5 h-2.5 rounded-full border border-stone-200"
                    style={{ backgroundColor: v.color_hex }}
                  />
                ))}
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Desde</span>
                <p className="text-stone-900 font-medium tracking-tight">
                  ${producto?.precio_menudeo} <span className="text-[10px] text-stone-400">MXN</span>
                </p>
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}