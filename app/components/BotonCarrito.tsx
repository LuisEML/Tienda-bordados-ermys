"use client";

import { useCart } from "@/context/CartContext";
import { Producto } from "@/data/productos";

export default function BotonCarrito({ producto }: { producto: Producto }) {
  const { agregarProducto, abrirCarrito } = useCart();

  const manejarClick = () => {
    agregarProducto(producto);
    abrirCarrito(); // <--- Esto hace que el panel salte solo
  }

  const handleAdd = (e: React.MouseEvent) => {
    // Esto detiene el clic para que no active enlaces que estén detrás o cerca
    e.preventDefault(); 
    e.stopPropagation(); 
    
    agregarProducto(producto);
  };

  return (
    <button 
      onClick={manejarClick}
      className="w-full bg-tierra text-crema py-4 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-artesano transition-all shadow-lg"
    >
      Añadir al Carrito
    </button>
  );
}