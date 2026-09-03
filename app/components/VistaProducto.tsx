"use client";

import { useState, useEffect, useRef } from "react";
import DetalleCompra from "./DetalleCompra";
import ImageZoom from "./ImageZoom";

export default function VistaProducto({ producto }: { producto: any }) {
  const [colorActivo, setColorActivo] = useState(
    producto.variaciones?.[0]?.color_nombre || ""
  );

  // Obtener la variación actual para conocer el color_hex activo
  const variacionActual = producto.variaciones?.find(
    (v: any) => v.color_nombre === colorActivo
  );

  // --- LÓGICA DE OBTENCIÓN DE MINIATURAS ---
  const obtenerImagenesDelColor = (): string[] => {
    const lista: string[] = [];

    // 1. Siempre incluir la imagen principal del producto si existe
    if (producto.imagen_principal_url) {
      lista.push(producto.imagen_principal_url);
    }

    // 2. Extraer imágenes de la nueva tabla 'imagenes_producto'
    if (Array.isArray(producto.imagenes_producto)) {
      producto.imagenes_producto.forEach((imgObj: any) => {
        // Incluimos si coincide con el color_hex activo O si no tiene color_hex asignado (general)
        if (
          !imgObj.color_hex || 
          (variacionActual && imgObj.color_hex === variacionActual.color_hex)
        ) {
          if (imgObj.imagen_url && !lista.includes(imgObj.imagen_url)) {
            lista.push(imgObj.imagen_url);
          }
        }
      });
    }

    // 3. Respaldo opcional: Si la variación tiene array de imágenes, incluirlo también
    if (Array.isArray(variacionActual?.imagenes)) {
      variacionActual.imagenes.forEach((url: string) => {
        if (url && !lista.includes(url)) {
          lista.push(url);
        }
      });
    }

    return lista.length > 0 ? lista : ["/placeholder.jpg"];
  };

  const imagenesDelColor = obtenerImagenesDelColor();

  const [imagenGrande, setImagenGrande] = useState(imagenesDelColor[0]);

  // MEMORIA DE COLOR: Cambiar la foto grande solo si el color activo cambia realmente
  const colorAnterior = useRef(colorActivo);

  useEffect(() => {
    if (colorAnterior.current !== colorActivo) {
      const nuevasFotos = obtenerImagenesDelColor();
      if (nuevasFotos.length > 0) {
        setImagenGrande(nuevasFotos[0]);
      }
      colorAnterior.current = colorActivo;
    }
  }, [colorActivo]);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
      
      {/* COLUMNA IZQUIERDA: IMÁGENES */}
      <div className="md:col-span-7 flex flex-col-reverse md:flex-row gap-4 items-start">
        
        {/* Tira de Miniaturas Verticales */}
        <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 w-full md:w-20 flex-shrink-0">
          {imagenesDelColor.map((img: string, idx: number) => {
            if (!img || img.trim() === "") return null;

            return (
              <button
                key={idx}
                onClick={() => setImagenGrande(img)}
                className={`w-14 h-14 md:w-20 md:h-20 rounded-xl overflow-hidden bg-stone-50 border transition-all flex-shrink-0 cursor-pointer ${
                  imagenGrande === img 
                    ? "border-stone-800 scale-95 shadow-sm" 
                    : "border-stone-200 hover:border-stone-400"
                }`}
              >
                <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>

        {/* Imagen Principal Grande con Efecto Lupa */}
        <div className="w-full flex-1">
          <ImageZoom 
            src={imagenGrande} 
            alt={producto.nombre} 
          />
        </div>
      </div>

      {/* COLUMNA DERECHA: INFORMACIÓN */}
      <div className="md:col-span-5 flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.4em] text-stone-400 font-bold mb-2">
          {producto.categorias?.nombre || "Artesanía"}
        </span>
        
        <h1 className="font-serif text-4xl mb-6 text-stone-800 italic">
          {producto.nombre}
        </h1>

        <DetalleCompra 
          producto={producto} 
          colorActivo={colorActivo}
          setColorActivo={setColorActivo}
          imagenActual={imagenGrande}
        />
        
        <div className="border-t border-stone-200 pt-6 mt-8">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-3">Descripción</h3>
          <p className="text-stone-600 leading-relaxed font-serif text-sm whitespace-pre-line">
            {producto.descripcion || "Esta pieza única ha sido elaborada manualmente con técnicas tradicionales de bordado."}
          </p>
        </div>
      </div>

    </div>
  );
}