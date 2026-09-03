"use client";

import { useState,useEffect } from "react";
import { ShoppingBag, Ruler, Check, Truck, ShieldCheck, Heart, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";     // El navegador de Next.js
import { toast } from "sonner";
import EnviosModal from "./EnviosModal";

interface DetalleCompraProps {
  producto: any;
  colorActivo: string;
  setColorActivo: (color: string) => void;
  imagenActual: string; // 👈 Agregamos esto
}

export default function DetalleCompra({ producto, colorActivo, setColorActivo, imagenActual }: DetalleCompraProps) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const { agregarProducto } = useCart();
  const router = useRouter();            // Activamos el enrutador

  // ESTADOS LOCALES
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");
  const [cantidad, setCantidad] = useState(1); // 👈 Nuevo estado para el contador
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agregadoAnimacion, setAgregadoAnimacion] = useState(false);

  

  // ✅ AHORA: 
  // 1. Obtenemos solo las variaciones que sí tienen existencia (stock > 0)
  const variacionesConStock = producto.variaciones.filter((v: any) => v.stock > 0);

  // 2. Extraemos los colores únicos a partir de las variaciones disponibles
  const coloresUnicos = variacionesConStock.filter((v: any, index: number, self: any) =>
    index === self.findIndex((t: any) => t.color_nombre === v.color_nombre)
  );

  // Si el color activo actual se quedó sin stock, cambiar automáticamente al primer color con existencia
  useEffect(() => {
    if (coloresUnicos.length > 0) {
      const existeEnDisponibles = coloresUnicos.some((v: any) => v.color_nombre === colorActivo);
      if (!existeEnDisponibles) {
        setColorActivo(coloresUnicos[0].color_nombre);
        setTallaSeleccionada("");
      }
    }
  }, [coloresUnicos, colorActivo]);

  const variacionSeleccionada = producto.variaciones.find(
    (v: any) => v.color_nombre === colorActivo && v.talla === tallaSeleccionada
  );

  const tallasDisponibles = producto.variaciones.filter(
    (v: any) => v.color_nombre === colorActivo && v.stock > 0
  );

  // Funciones para el contador
  const incrementar = () => {
    const maxStock = variacionSeleccionada ? variacionSeleccionada.stock : 10;
    if (cantidad < maxStock) setCantidad(cantidad + 1);
  };

  const decrementar = () => {
    if (cantidad > 1) setCantidad(cantidad - 1);
  };

  const handleComprarAhora = () => {
    // 1. Validamos que el cliente haya elegido una talla
    if (!tallaSeleccionada) {
      toast.error("Por favor, selecciona una talla antes de comprar ahora", {
        style: {
          background: "#ffffff",
          color: "#1c1917",
          borderRadius: "12px",
          border: "1px solid #e7e5e4",
          fontFamily: "ui-serif, Georgia, Cambria, serif",
          fontSize: "12px",
        }
      });
      return;
    }

    if (variacionSeleccionada) {
      // 2. Formateamos el producto con TODAS las propiedades requeridas para mayoreo
      const productoFormateado = {
        id: variacionSeleccionada.id,
        nombre: producto.nombre,
        precio: Number(producto.precio_menudeo || 0),
        precio_mayoreo: Number(producto.precio_mayoreo || 0), // 👈 IMPORTANTE
        cantidad_minima_mayoreo: Number(producto.cantidad_minima_mayoreo || 12), // 👈 IMPORTANTE
        color: colorActivo,
        talla: tallaSeleccionada,
        imagen_url: imagenActual,
        cantidad: cantidad,
        stock: variacionSeleccionada.stock, // 👈 IMPORTANTE
        producto_id_principal: producto.id // 👈 IMPORTANTE
      };

      // 3. Lo agregamos al estado global del carrito
      agregarProducto(productoFormateado);
      
      // 4. Redirigimos al checkout
      router.push(`/checkout?id=${producto.id}`);
    }
  };

  const handleAgregarCarrito = () => {
    if (!tallaSeleccionada) {
      toast.error("Por favor, selecciona una talla antes de agregar al carrito", {
      // Le damos estilos para que combine con tu estética minimalista "stone"
      style: {
        background: "#ffffff",
        color: "#1c1917", // stone-900
        borderRadius: "12px",
        border: "1px solid #e7e5e4", // stone-200
        fontFamily: "ui-serif, Georgia, Cambria, serif", // Tu fuente Serif elegante
        fontSize: "12px",
      }
    });
    return; // Detiene la función para que no se agregue vacío
    }

    if (variacionSeleccionada) {
      // const imagenProducto = variacionSeleccionada.imagenes?.[0] || producto.imagen_principal_url || "";

      agregarProducto({
        // id: variacionSeleccionada.id,
        // nombre: producto.nombre,
        // precio: producto.precio_menudeo,
        // precio_mayoreo: Number(producto.precio_mayoreo || 0), // 👈 IMPORTANTE
        // cantidad_minima_mayoreo: Number(producto.cantidad_minima_mayoreo || 12), // 👈 IMPORTANT
        // color: colorActivo,
        // talla: tallaSeleccionada,
        // imagen_url: imagenActual, // 👈 ¡MAGIA! Ahora toma la foto exacta de la pantalla grande        cantidad: cantidad // 👈 Pasamos la cantidad seleccionada
        // stock: variacionSeleccionada.stock ,// 👈 ¡ESTA LÍNEA ES CLAVE!
        
        // // 💡 AQUÍ ESTÁ EL TRUCO: Guardamos el ID de la tabla productos
        // producto_id_principal: producto.id
        id: variacionSeleccionada.id,
        nombre: producto.nombre,
        precio: Number(producto.precio_menudeo || 0),
        precio_mayoreo: Number(producto.precio_mayoreo || 0), // 👈 IMPORTANTE
        cantidad_minima_mayoreo: Number(producto.cantidad_minima_mayoreo || 12), // 👈 IMPORTANTE
        color: colorActivo,
        talla: tallaSeleccionada,
        imagen_url: imagenActual,
        cantidad: cantidad,
        stock: variacionSeleccionada.stock,
        producto_id_principal: producto.id
      });

      setAgregadoAnimacion(true);
      setTimeout(() => setAgregadoAnimacion(false), 2000);
      toast.success("Prenda añadida al carrito");
    }
  };



  // 💡 LÓGICA DE ALERTA UX DE MAYOREO
  const minimoMayoreo = Number(producto.cantidad_minima_mayoreo || 12);
  const tienePrecioMayoreoConfigurado = Number(producto.precio_mayoreo) > 0;
  const faltanParaMayoreo = Math.max(0, minimoMayoreo - cantidad);
  const alcanzoMayoreo = cantidad >= minimoMayoreo && tienePrecioMayoreoConfigurado;

  

  return (
    <div className="space-y-6">
      {/* PRECIO */}
      <div className="flex flex-col gap-0.5">
        <p className="text-3xl font-light text-stone-900">
          ${producto.precio_menudeo} <span className="text-sm font-sans text-stone-400">MXN</span>
        </p>
        <p className="text-xs text-tierra font-medium">
          Precio Mayoreo: ${producto.precio_mayoreo} <span className="text-stone-400 font-normal">(desde {producto.cantidad_minima_mayoreo || 12} pzas)</span>
        </p>
      </div>

      {/* SELECTOR DE COLOR */}
      <div className="border-t border-stone-100 pt-4">
        <span className="text-[9px] uppercase font-bold text-stone-400 tracking-[0.2em] block mb-3">
          Color Actual: <span className="text-stone-800">{colorActivo}</span>
        </span>
        <div className="flex gap-2.5">
          {coloresUnicos.map((v: any, index: number) => (
          <button
            key={v.id || v.color_nombre || `color-${index}`} // <-- Solución aquí
            onClick={() => {
              setColorActivo(v.color_nombre);
              setTallaSeleccionada(""); 
              setCantidad(1); // Reiniciar cantidad
            }}
            className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
              colorActivo === v.color_nombre ? 'border-stone-800 scale-105 shadow-2xs' : 'border-stone-200/40 hover:scale-105'
            }`}
            style={{ backgroundColor: v.color_hex }}
          >
            {colorActivo === v.color_nombre && (
              <Check size={12} className={v.color_nombre === "Blanco" || v.color_hex === "#ffffff" ? "text-stone-900" : "text-white"} />
            )}
          </button>
          ))}
        </div>
      </div>

      {/* SELECTOR DE TALLA */}
      <div className="border-t border-stone-100 pt-4">
        <div className="flex justify-between items-baseline">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
              Selecciona tu talla
            </p>
            
            {/* 💡 BOTÓN DE GUÍA DE TALLAS */}
            {/* 💡 BOTÓN DE GUÍA DE TALLAS */}
            { (
              producto.categorias?.guia_tallas_hombre_url ||
              producto.categorias?.guia_tallas_mujer_url ||
              producto.categorias?.guia_tallas_ninos_url ||
              producto.categorias?.guia_tallas_ninas_url
            ) && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-800 transition-colors border-b border-dashed border-stone-400 hover:border-stone-800 pb-0.5 cursor-pointer focus:outline-none"
              >
                📏 Guía de tallas
              </button>
            )}
        </div>

        {/* setIsModalOpen */}
        
        <div className="flex flex-wrap gap-2">
          {tallasDisponibles.map((v: any, index: number) => (
            <button
              key={v.id || v.talla || `talla-${index}`} // <-- Solución aquí
              onClick={() => {
                setTallaSeleccionada(v.talla);
                setCantidad(1); // Reset de seguridad
              }}
              className={`px-4 py-2 text-xs font-bold border rounded-xl transition-all tracking-wider cursor-pointer ${
                tallaSeleccionada === v.talla 
                  ? 'bg-stone-900 text-white border-stone-900' 
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              {v.talla}
            </button>
          ))}
        </div>

        {/* Alerta de Stock Bajo */}
        {variacionSeleccionada && variacionSeleccionada.stock <= 3 && (
          <p className="text-[11px] text-amber-600 font-medium mt-2 animate-pulse">
            ¡Solo quedan {variacionSeleccionada.stock} piezas disponibles en esta talla!
          </p>
        )}
      </div>

      {/* NEW: SELECTOR DE CANTIDAD (+ y -) */}
      <div className="border-t border-stone-100 pt-4">
        <span className="text-[9px] uppercase font-bold text-stone-400 tracking-[0.2em] block mb-2.5">
          Cantidad
        </span>
        <div className="flex items-center w-32 border border-stone-200 rounded-xl bg-stone-50/50">
          <button 
            onClick={decrementar}
            disabled={!tallaSeleccionada}
            className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-800 disabled:opacity-30 cursor-pointer"
          >
            <Minus size={14} />
          </button>
          <span className="flex-1 text-center font-sans text-sm font-bold text-stone-800">
            {tallaSeleccionada ? cantidad : 1}
          </span>
          <button 
            onClick={incrementar}
            disabled={!tallaSeleccionada}
            className="w-10 h-10 flex items-center justify-center text-stone-500 hover:text-stone-800 disabled:opacity-30 cursor-pointer"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* BOTONES DE COMPRA */}
        {/* 💡 INDICADOR UX EN TIEMPO REAL (MAYOREO) */}
      {tienePrecioMayoreoConfigurado && (
        <div className="pt-2">
          {alcanzoMayoreo ? (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-2.5 transition-all">
              <span className="text-base">✨</span>
              <p className="text-[11px] font-medium text-emerald-900 leading-snug">
                <span className="font-bold uppercase tracking-wider">¡Aplica Precio Mayoreo!</span> 
                <br />
                Pagarás <span className="font-bold">${producto.precio_mayoreo} MXN</span> por pieza.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-3 flex items-center gap-2.5 transition-all">
              <span className="text-base">💡</span>
              <p className="text-[11px] font-medium text-amber-900 leading-snug">
                Agrega <span className="font-bold text-amber-950 underline decoration-amber-400">{faltanParaMayoreo} pieza{faltanParaMayoreo > 1 ? "s" : ""} más</span> para desbloquear la tarifa de Mayoreo a <span className="font-bold">${producto.precio_mayoreo} MXN</span> c/u.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2.5 pt-4 border-t border-stone-100">
        <button 
          onClick={handleAgregarCarrito}
          className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all cursor-pointer ${
            agregadoAnimacion 
              ? "bg-emerald-600 text-white" 
              : "bg-white text-stone-800 border border-stone-800 hover:bg-stone-900 hover:text-white"
          }`}
        >
          {agregadoAnimacion ? <><Check size={14}/> ¡Agregado! </> : <><ShoppingBag size={14}/> Agregar al Carrito</>}
        </button>
        
        <button onClick={handleComprarAhora} className="w-full bg-tierra text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-tierra/90 transition-all cursor-pointer">
          Comprar Ahora
        </button>
      </div>

      {/* SECCIÓN DE GARANTÍAS Y ENVÍO (Aporta mucha confianza) */}
      <div className="pt-4 border-t border-stone-100 space-y-2.5">
         <div className="flex items-center gap-3 text-stone-600">
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-3 text-xs text-stone-600 hover:text-stone-900 mt-3 cursor-pointer"
          >
            <Truck size={16} className="text-stone-400" />
            <span>Ver tiempos de envío y políticas de devolución</span>
          </button>
        </div>
        <div className="flex items-center gap-3 text-stone-600">
          <Truck size={16} className="text-stone-400" />
          <p className="text-xs">Envíos express garantizados a todo México.</p>
        </div>
        <div className="flex items-center gap-3 text-stone-600">
          <ShieldCheck size={16} className="text-stone-400" />
          <p className="text-xs">Garantía de confección artesanal de alta calidad.</p>
        </div>
      </div>

           {/* MODAL DE GUÍA DE TALLAS */}
      <AnimatePresence>
        {isModalOpen && (
          <div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 max-w-md w-full bg-white z-55 p-6 shadow-2xl overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b border-stone-100 pb-4 mb-5">
                  <h3 className="font-serif text-lg font-bold text-stone-800">Guía de Medidas</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600 text-xs font-bold uppercase cursor-pointer">Cerrar</button>
                </div>
                <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-50 aspect-[3/4]">
                  <div className="space-y-4">
                        {/* Guía Hombre */}
                        {producto.categorias?.guia_tallas_hombre_url && (
                          <div>
                            <p className="text-[10px]  font-bold uppercase tracking-wider text-stone-500 m-8">Hombre</p>
                            <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                              <img
                                src={producto.categorias.guia_tallas_hombre_url}
                                alt={`Guía Hombre - ${producto.categorias?.nombre}`}
                                className="w-full object-contain p-2"
                              />
                            </div>
                          </div>
                        )}

                        {/* Guía Mujer */}
                        {producto.categorias?.guia_tallas_mujer_url && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 m-8">Mujer</p>
                            <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                              <img
                                src={producto.categorias.guia_tallas_mujer_url}
                                alt={`Guía Mujer - ${producto.categorias?.nombre}`}
                                className="w-full object-contain p-2"
                              />
                            </div>
                          </div>
                        )}

                        {/* Guía Niños */}
                        {producto.categorias?.guia_tallas_ninos_url && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 m-8">Niños</p>
                            <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                              <img
                                src={producto.categorias.guia_tallas_ninos_url}
                                alt={`Guía Niños - ${producto.categorias?.nombre}`}
                                className="w-full object-contain p-2"
                              />
                            </div>
                          </div>
                        )}

                        {/* Guía Niñas */}
                        {producto.categorias?.guia_tallas_ninas_url && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 m-8">Niñas</p>
                            <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                              <img
                                src={producto.categorias.guia_tallas_ninas_url}
                                alt={`Guía Niñas - ${producto.categorias?.nombre}`}
                                className="w-full object-contain p-2"
                              />
                            </div>
                          </div>
                        )}
                  </div>
                </div>
              </div>        
            </motion.div>
          </div>
        )}
      </AnimatePresence>    
      {/* Render del Modal */}
              <EnviosModal
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
              />  
    </div>
  );
}