"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Truck, RotateCcw, ShieldCheck, Clock } from "lucide-react";

interface EnviosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnviosModal({ isOpen, onClose }: EnviosModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[80]"
          />

          {/* Contenedor del Modal */}
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-100 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Cabecera */}
              <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/60">
                <div>
                  <h3 className="font-serif text-lg text-stone-900 font-bold">
                    Políticas de Envío y Devoluciones
                  </h3>
                  <p className="text-[11px] text-stone-500 font-sans">
                    Todo lo que necesitas saber sobre tu compra
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer text-stone-500 hover:text-stone-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Contenido scrolleable */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-600 leading-relaxed">
                
                {/* Sección Envíos */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-stone-900 font-bold uppercase tracking-wider text-[11px]">
                    <Truck size={16} className="text-tierra" />
                    <span>Información de Envíos</span>
                  </div>
                  <ul className="space-y-2 pl-6 list-disc marker:text-tierra">
                    <li>
                      <strong className="text-stone-800">Tiempos de entrega:</strong> De 3 a 5 días hábiles a todo México tras procesar el pedido.
                    </li>
                    <li>
                      <strong className="text-stone-800">Procesamiento:</strong> Los pedidos se preparan en 24 a 48 horas hábiles.
                    </li>
                    <li>
                      <strong className="text-stone-800">Rastreo:</strong> Recibirás un correo electrónico con tu número de guía en cuanto el paquete sea despachado.
                    </li>
                    <li>
                      <strong className="text-stone-800">Costo:</strong> Envío GRATIS en compras mayores al umbral aplicable.
                    </li>
                  </ul>
                </div>

                <hr className="border-stone-100" />

                {/* Sección Devoluciones */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-stone-900 font-bold uppercase tracking-wider text-[11px]">
                    <RotateCcw size={16} className="text-tierra" />
                    <span>Cambios y Devoluciones</span>
                  </div>
                  <ul className="space-y-2 pl-6 list-disc marker:text-tierra">
                    <li>
                      Tienes hasta <strong className="text-stone-800">7 días naturales</strong> a partir de la recepción para solicitar un cambio de talla o modelo.
                    </li>
                    <li>
                      Las prendas deben estar <strong className="text-stone-800">sin usar, sin lavar y con sus etiquetas originales</strong> intactas.
                    </li>
                    <li>
                      Si el cambio es por defecto o error nuestro, nosotros cubrimos el costo de envío. Si es cambio por preferencia de talla, el envío corre por cuenta del cliente.
                    </li>
                  </ul>
                </div>

                {/* Garantía rápida */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/60 flex items-center gap-3">
                  <ShieldCheck size={24} className="text-emerald-600 flex-shrink-0" />
                  <p className="text-[11px] text-stone-600">
                    ¿Tienes dudas con tu pedido? Contáctanos directamente a nuestro soporte o WhatsApp y te ayudaremos a gestionarlo de inmediato.
                  </p>
                </div>

              </div>

              {/* Botón Inferior */}
              <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-tierra text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}