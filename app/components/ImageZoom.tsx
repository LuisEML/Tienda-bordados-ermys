"use client";

import { useState, MouseEvent } from "react";
import { ZoomIn, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageZoomProps {
  src: string;
  alt?: string;
}

export default function ImageZoom({ src, alt = "Imagen del producto" }: ImageZoomProps) {
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <>
      <div
        className="relative w-full aspect-[4/5] bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-xs cursor-zoom-in group select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Imagen Base */}
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Capa de Lupa enfocada en el cursor */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none bg-no-repeat"
            style={{
              backgroundImage: `url(${src})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: "250%",
            }}
          />
        )}

        {/* Ícono de Lupa (Esquina inferior derecha) */}
        {!isHovered && (
          <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md p-2.5 rounded-full shadow-sm text-stone-600 transition-transform group-hover:scale-110 pointer-events-none">
            <ZoomIn size={18} />
          </div>
        )}

        {/* BOTÓN PANTALLA COMPLETA / MODAL (Esquina superior derecha) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // Evita interferencias con el hover
            setIsModalOpen(true);
          }}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white backdrop-blur-md p-2.5 rounded-full shadow-sm text-stone-700 hover:text-stone-900 transition-all hover:scale-110 cursor-pointer focus:outline-none"
          title="Ver pantalla completa"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* MODAL DE IMAGEN COMPLETA */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            {/* Fondo Oscuro / Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs cursor-pointer"
            />

            {/* Contenido del Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative z-10 max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
            >
              {/* Botón de Cerrar */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-12 right-0 md:top-2 md:right-2 z-20 bg-black/50 hover:bg-black/80 text-white p-2.5 rounded-full transition-all cursor-pointer focus:outline-none"
              >
                <X size={20} />
              </button>

              {/* Imagen Grande en Alta Resolución */}
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}