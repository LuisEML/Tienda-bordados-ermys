"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface FiltrosProps {
  isOpen: boolean;
  onClose: () => void;
  talla: string;
  setTalla: (val: string) => void;
  color: string;
  setColor: (val: string) => void;
  precioMax: number;
  setPrecioMax: (val: number) => void;
  opcionesTallas: string[];
  // Recibe la lista completa de objetos de variaciones unicas {color_nombre, color_hex, talla}
  opcionesColores: { color_nombre: string; color_hex: string; talla?: string }[];
  limpiarFiltros: () => void;
}

export default function ModalFiltros({ 
  isOpen, onClose, 
  talla, setTalla, 
  color, setColor, 
  precioMax, setPrecioMax, 
  opcionesTallas, opcionesColores,
  limpiarFiltros 
}: FiltrosProps) {

  // Estado local para controlar si expandimos la lista gigante de colores
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // 1. FILTRADO INTERDEPENDIENTE: Si hay una talla seleccionada, filtramos los colores
  const coloresFiltrados = talla
    ? opcionesColores.filter((c) => c.talla === talla || !c.talla) 
    : opcionesColores;

  // 2. LIMITACIÓN VISUAL: Si 'mostrarTodos' es false, solo cortamos los primeros 6 colores
  const coloresVisibles = mostrarTodos ? coloresFiltrados : coloresFiltrados.slice(0, 6);

  // Al cerrar o limpiar, es buena práctica resetear el botón de "Ver más"
  const alCerrarModal = () => {
    setMostrarTodos(false);
    onClose();
  };

  const alLimpiarTodo = () => {
    setMostrarTodos(false);
    limpiarFiltros();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo oscuro (Overlay) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={alCerrarModal}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[60]"
          />

          {/* Panel Lateral (Drawer) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-xs bg-[#FDFBF7] shadow-2xl z-[70] p-6 flex flex-col justify-between overflow-y-auto"
          >
            {/* CONTENEDOR SUPERIOR */}
            <div className="space-y-8 flex-1">
              
              {/* Encabezado */}
              <div className="flex justify-between items-center border-b border-stone-200/60 pb-4">
                <h2 className="font-serif text-2xl italic text-stone-800">Filtrar Piezas</h2>
                <button onClick={alCerrarModal} className="p-2 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer">
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              {/* RANGO DE PRECIO */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
                  Presupuesto Máximo
                </p>
                <div className="space-y-4">
                  <input 
                    type="range"
                    min="0"
                    max="5000" // Sincronizado con el estado de tu page.tsx
                    step="100"
                    value={precioMax}
                    onChange={(e) => setPrecioMax(parseInt(e.target.value))}
                    className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
                  />
                  <div className="flex justify-between items-center text-stone-600">
                    <span className="text-xs font-medium text-stone-400">$0</span>
                    <span className="text-xs font-bold tracking-wider uppercase text-stone-800 bg-stone-200/60 px-2.5 py-1 rounded-full">
                      Hasta ${precioMax}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE TALLAS */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
                  Talla en Existencia
                </p>
                <div className="flex flex-wrap gap-2">
                  {opcionesTallas.length > 0 ? (
                    opcionesTallas.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTalla(talla === t ? "" : t);
                          setColor(""); // Resetea el color seleccionado si cambian de talla para evitar errores
                        }}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${
                          talla === t 
                            ? "bg-stone-800 text-white border-stone-800 shadow-xs" 
                            : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
                        }`}
                      >
                        {t}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs italic text-stone-400">No hay tallas disponibles</p>
                  )}
                </div>
              </div>

              {/* SECCIÓN DE COLORES FILTRADOS Y LIMITADOS */}
              <div className="space-y-3">
  <div className="flex justify-between items-baseline">
    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
      Colores Disponibles
    </p>
    {talla && (
      <span className="text-[9px] text-stone-400 italic">
        para talla {talla}
      </span>
    )}
  </div>

  {coloresFiltrados.length > 0 ? (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-y-6 gap-x-2 pt-2 justify-items-center"> {/* 💡 Ajustamos gap-y-6 para dar espacio al tooltip y justify-items-center para centrar los círculos */}
        {coloresVisibles.map((c) => (
          <button
            key={c.color_nombre}
            onClick={() => setColor(color === c.color_nombre ? "" : c.color_nombre)}
            // 💡 Agregamos "relative" para posicionar el tooltip y cambiamos "flex-col" a solo centrado
            className="group relative flex items-center justify-center cursor-pointer w-fit focus:outline-none"
          >
            {/* El Círculo de Color */}
            <div 
              className={`w-9 h-9 rounded-full border transition-all duration-300 shadow-2xs ${
                color === c.color_nombre 
                  ? 'scale-105 border-stone-800 ring-4 ring-stone-800/10' 
                  : 'border-stone-200 group-hover:scale-105 group-hover:shadow-xs'
              }`}
              style={{ backgroundColor: c.color_hex }}
            />
            
            {/* 💡 EL TOOLTIP FLOTANTE (Reemplaza al span anterior) */}
            <div className="absolute bottom-full mb-2.5 pointer-events-none flex flex-col items-center
                            opacity-0 scale-95 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 
                            transition-all duration-200 ease-out z-50">
              
              {/* Globito con el nombre */}
              <span className="bg-stone-900 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md whitespace-nowrap">
                {c.color_nombre}
              </span>
              
              {/* Flechita decorativa hacia abajo */}
              <div className="w-1.5 h-1.5 bg-stone-900 rotate-45 -mt-0.5" />
            </div>
          </button>
        ))}
      </div>

      {/* BOTÓN MÁS COLORES */}
      {coloresFiltrados.length > 6 && (
        <button
          onClick={() => setMostrarTodos(!mostrarTodos)}
          className="text-[9px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-800 transition-colors w-full text-center pt-1 block cursor-pointer"
        >
          {mostrarTodos ? "— Ver menos colores" : `+ Ver más colores (${coloresFiltrados.length - 6})`}
        </button>
      )}
    </div>
  ) : (
    <p className="text-xs italic text-stone-400 pt-1">No hay colores para esta selección</p>
  )}
</div>

            </div>

            {/* BOTONES DE ACCIÓN (FIJOS ABAJO) */}
            <div className="pt-6 border-t border-stone-200 space-y-2 bg-[#FDFBF7]">
              <button 
                onClick={alLimpiarTodo}
                className="w-full py-2.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
              >
                Limpiar Filtros
              </button>
              <button 
                onClick={alCerrarModal}
                className="w-full bg-stone-800 text-white py-3.5 rounded-xl text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-stone-700 active:scale-98 transition-all shadow-sm cursor-pointer"
              >
                Ver Resultados
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}