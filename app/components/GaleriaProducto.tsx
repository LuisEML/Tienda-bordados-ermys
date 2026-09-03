"use client"; // 1. IMPORTANTE: Esto le dice a Next.js que esta página es interactiva (tiene clics)

import { useState } from "react";
import Image from "next/image";

interface GaleriaProps {
  imagenes: string[]; // Recibe la lista de fotos del producto
}

export default function GaleriaProducto({ imagenes }: GaleriaProps) {
  // 2. Definimos el "Estado".
  // 'imagenPrincipal' guarda la foto grande. 
  // 'setImagenPrincipal' es la función para cambiarla.
  // Empezamos con la primera foto (índice 0).
  const [imagenPrincipal, setImagenPrincipal] = useState(imagenes[0]);

  return (
    <div className="flex flex-col md:flex-row-reverse gap-4">
      {/* 3. IMAGEN PRINCIPAL (La que cambia) */}
      <div className="relative aspect-[4/5] bg-white rounded-sm overflow-hidden flex-grow shadow-sm">
        <Image 
          src={imagenPrincipal} 
          alt="Vista del bordado"
          fill // Ocupa todo el espacio de su contenedor padre
          className="object-cover transition-opacity duration-300"
          sizes="(max-w-7xl) 50vw, 100vw"
          priority // Carga esta imagen primero (es la más importante)
        />
      </div>

      {/* 4. COLUMNA DE MINIATURAS (Los interruptores) */}
      <div className="flex flex-row md:flex-col gap-4 w-full md:w-24">
        {imagenes.map((img, index) => (
          <button 
            key={index}
            // 5. Al hacer CLIC, cambiamos el estado
            onClick={() => setImagenPrincipal(img)} 
            // 6. Si es la imagen seleccionada, le ponemos un borde de marca
            className={`relative aspect-square rounded-sm overflow-hidden border-2 transition-all w-16 h-16 md:w-full md:h-full
              ${imagenPrincipal === img ? 'border-artesano ring-2 ring-artesano/20' : 'border-stone-100 hover:border-stone-200'}`}
          >
            <Image 
              src={img} 
              alt={`Miniatura ${index + 1}`}
              fill
              className="object-cover"
              sizes="100px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}