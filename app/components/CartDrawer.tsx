"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { X, Trash2, Plus, Minus, ShoppingBag, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { calcularEnvio, CONFIG_ENVIO } from "@/lib/calculoEnvio";

export default function CarritoDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {

  // 1. Extraemos las funciones de mayoreo desde el contexto
  const { 
    items, 
    eliminarProducto, 
    total: subtotal, 
    incrementarCantidad, 
    decrementarCantidad,
    obtenerPrecioAplicado,
    esMayoreoAplicado 
  } = useCart();


  // Cálculos de envío
  const subtotalSeguro = subtotal || 0;
  const costoEnvio = calcularEnvio(subtotalSeguro);
  const faltaParaGratis = Math.max(0, CONFIG_ENVIO.UMBRAL_ENVIO_GRATIS - subtotalSeguro);
  const totalConEnvio = subtotalSeguro + costoEnvio;

  const router = useRouter();   

  const handleCheckout = () => {
      if (onClose) onClose(); 

      const productoEnCarrito = items[items.length - 1]; 

      if (productoEnCarrito && productoEnCarrito.producto_id_principal) {
          window.location.href = `/checkout?id=${productoEnCarrito.producto_id_principal}`;
      } else if (productoEnCarrito && productoEnCarrito.id) {
          window.location.href = `/checkout?id=${productoEnCarrito.id}`;
      } else {
          window.location.href = "/checkout";
      }
  };

  const handleRestar = (item: any) => {
    if (item.cantidad > 1) {  
        decrementarCantidad(item.id);
    } else {
      eliminarProducto(item.id);
    }
  };

  const handleSumar = (item: any) => {
    incrementarCantidad(item.id);
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
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[60]"
          />

          {/* Panel del Carrito */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
          >
            {/* Cabecera */}
            <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-stone-700" />
                <h2 className="font-serif text-xl text-stone-800 italic">Tu Selección</h2>
                <span className="bg-stone-200 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                  {items.reduce((acc, item) => acc + item.cantidad, 0)}
                </span>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer text-stone-500 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Productos */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 division-y division-stone-100">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center pb-12">
                  <ShoppingBag size={40} className="text-stone-300 mb-3 stroke-[1.2]" />
                  <p className="text-stone-500 font-serif italic text-sm">Tu bolsa de compras está vacía.</p>
                  <button 
                    onClick={onClose}
                    className="mt-4 text-xs uppercase tracking-widest font-bold text-tierra hover:text-stone-900 transition-colors cursor-pointer"
                  >
                    Volver a la tienda
                  </button>
                </div>
              ) : (
                items.map((item: any) => {
                const precioUnitario = obtenerPrecioAplicado(item);
                const tieneMayoreo = esMayoreoAplicado(item);
                let fotoProducto = item.imagen_url || item.imagen || item.imagen_principal_url;

                if (typeof fotoProducto === "string") {
                  fotoProducto = fotoProducto.replace(/[{}]/g, "").trim();
                }

                return (
                  <div key={item.id} className="flex gap-4 pt-4 first:pt-0">
                    <div className="relative w-20 h-24 bg-stone-50 rounded-xl overflow-hidden border border-stone-100 flex-shrink-0">
                      {fotoProducto ? (
                        <img src={fotoProducto} alt={item.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-100 text-[9px] text-stone-400 italic">Sin foto</div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between flex-1 py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-xs font-bold text-stone-800 tracking-wide line-clamp-1">{item.nombre}</h3>
                          <button onClick={() => eliminarProducto(item.id)} className="text-stone-400 hover:text-red-500 p-1 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-[10px] text-stone-400 font-sans mt-0.5 font-medium uppercase tracking-wider">
                          Talla: <span className="text-stone-700">{item.talla || "U"}</span> 
                          <span className="mx-1.5">•</span> 
                          Color: <span className="text-stone-700">{item.color || "Único"}</span>
                        </p>

                        {/* 💡 ETIQUETA VISUAL DE MAYOREO */}
                        {tieneMayoreo && (
                          <span className="inline-block mt-1 text-[8px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                            ✨ Tarifa Mayoreo
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-stone-900">
                            ${(precioUnitario * item.cantidad).toLocaleString("es-MX")} <span className="text-[10px] text-stone-400 font-normal">MXN</span>
                          </p>
                          {/* Muestra el precio regular tachado si aplicó mayoreo */}
                          {tieneMayoreo && (
                            <span className="text-[9px] text-stone-400 line-through">
                              ${(item.precio * item.cantidad).toLocaleString("es-MX")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50/50">
                          <button onClick={() => handleRestar(item)} className="p-1.5 text-stone-500 hover:text-stone-900 cursor-pointer">
                            <Minus size={11} />
                          </button>
                          <span className="px-2 text-xs font-bold text-stone-700 min-w-[18px] text-center">
                            {item.cantidad}
                          </span>
                          <button onClick={() => handleSumar(item)} className="p-1.5 text-stone-500 hover:text-stone-900 cursor-pointer">
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })
              )}
            </div>

            {/* Footer con Indicador de Envío Gratis y Totales */}
            {items.length > 0 && (
              <div className="p-5 border-t border-stone-200/60 bg-stone-50 space-y-4">
                
                {/* BARRA DE PROGRESO DE ENVÍO GRATIS */}
                <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-2xs">
                  {costoEnvio === 0 ? (
                    <p className="text-emerald-700 font-bold text-center text-xs flex items-center justify-center gap-1.5">
                      <span>🎉</span> ¡Tienes Envío Gratis en tu compra!
                    </p>
                  ) : (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Truck size={14} className="text-stone-600" />
                        <p className="text-stone-600 text-[11px]">
                          Agrega <span className="font-bold text-stone-900">${faltaParaGratis.toLocaleString("es-MX")} MXN</span> más para <span className="font-bold text-emerald-700">Envío GRATIS</span>
                        </p>
                      </div>
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden border border-stone-200/50">
                        <div 
                          className="bg-emerald-600 h-full transition-all duration-500 ease-out"
                          style={{ width: `${Math.min((subtotalSeguro / CONFIG_ENVIO.UMBRAL_ENVIO_GRATIS) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* DESGLOSE DE PRECIOS */}
                <div className="space-y-1.5 text-xs text-stone-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-stone-800">${subtotalSeguro.toLocaleString("es-MX")} MXN</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Envío estimado</span>
                    <span className="font-medium">
                      {costoEnvio === 0 ? (
                        <span className="text-emerald-700 font-bold uppercase text-[9px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Gratis
                        </span>
                      ) : (
                        `$${costoEnvio.toLocaleString("es-MX")} MXN`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-stone-200/80 pt-2.5 font-bold text-sm text-stone-900">
                    <span className="uppercase tracking-wider text-xs">Total Estimado</span>
                    <span className="text-lg font-serif text-tierra">${totalConEnvio.toLocaleString("es-MX")} <span className="text-xs font-sans font-normal text-stone-400">MXN</span></span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout} 
                  className="w-full bg-stone-900 text-white py-3.5 rounded-xl uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-tierra shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer text-center"
                >
                  Finalizar Compra
                </button>
                 {/* <p className="text-[10px] text-center text-stone-400 mt-3 font-serif italic">
                  Envíos y descuentos de mayoreo calculados al procesar el pago.
                </p> */}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}