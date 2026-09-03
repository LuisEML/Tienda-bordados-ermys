"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  const { vaciarCarrito } = useCart();

  // Al cargar la página de éxito, vaciamos automáticamente la bolsa de compras
  useEffect(() => {
    if (vaciarCarrito) {
      vaciarCarrito();
    }
  }, []);

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center bg-stone-50/50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-2xl border border-stone-100 shadow-xl text-center space-y-6">
        
        {/* Ícono de éxito animado */}
        <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 animate-bounce">
          <CheckCircle size={40} strokeWidth={1.5} />
        </div>

        {/* Mensajes principales */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-stone-900 italic">¡Gracias por tu compra!</h1>
          <p className="text-sm text-stone-500">
            Tu pago ha sido procesado de forma segura. Tu pieza artesanal ya se está preparando para su envío.
          </p>
        </div>

        {/* Detalles informativos */}
        <div className="bg-stone-50 rounded-xl p-4 text-left border border-stone-100 space-y-2">
          <div className="flex justify-between text-xs font-medium text-stone-500">
            <span>Estado del Pago</span>
            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px]">Aprobado</span>
          </div>
          <div className="flex justify-between text-xs font-medium text-stone-500 pt-2 border-t border-stone-200/60">
            <span>Tiempo estimado de entrega</span>
            <span className="text-stone-800 font-bold">3 a 5 días hábiles</span>
          </div>
        </div>

        <p className="text-[11px] text-stone-400 italic">
          Hemos enviado un correo electrónico con el resumen detallado de tu orden y el número de guía para el rastreo.
        </p>

        {/* Botones de acción */}
        <div className="pt-4 space-y-3">
          <Link 
            href="/" 
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-[10px] transition-all duration-300 shadow-md flex items-center justify-center gap-2"
          >
            Seguir Explorando la Tienda <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </main>
  );
}