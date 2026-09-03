"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface ProductoCarrito {
  id: string;
  nombre: string;
  precio: number;
  precio_mayoreo?: number; // 👈 NUEVO: Precio al mayoreo
  cantidad_minima_mayoreo?: number; // 👈 NUEVO: Mínimo de piezas
  imagen_url: string;
  cantidad: number;
  stock?: number;
  color?: string;
  talla?: string;
  producto_id_principal?: string;
}

interface CarritoContextType {
  items: ProductoCarrito[];
  agregarProducto: (producto: any) => void;
  eliminarProducto: (id: string) => void;
  vaciarCarrito: () => void;
  incrementarCantidad: (id: string) => void;
  decrementarCantidad: (id: string) => void;
  total: number;
  obtenerPrecioAplicado: (item: ProductoCarrito) => number; // 👈 NUEVO
  esMayoreoAplicado: (item: ProductoCarrito) => boolean; // 👈 NUEVO
  isDrawerOpen: boolean;
  abrirCarrito: () => void;
  cerrarCarrito: () => void;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ProductoCarrito[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const abrirCarrito = () => setIsDrawerOpen(true);
  const cerrarCarrito = () => setIsDrawerOpen(false);

  useEffect(() => {
    const carritoGuardado = localStorage.getItem("carrito-ermy");
    if (carritoGuardado) setItems(JSON.parse(carritoGuardado));
  }, []);

  useEffect(() => {
    localStorage.setItem("carrito-ermy", JSON.stringify(items));
  }, [items]);

  const agregarProducto = (producto: any) => {
    setItems((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      
      const nuevoProducto = {
        ...producto,
        id_referencia: producto.id 
      };

      if (existe) {
        const maxStock = producto.stock ?? 10;
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: Math.min(item.cantidad + (producto.cantidad || 1), maxStock) }
            : item
        );
      }
      
      return [...prev, { ...nuevoProducto, cantidad: producto.cantidad || 1 }];
    });
  };  

  const eliminarProducto = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const vaciarCarrito = () => {
    setItems([]);
    localStorage.removeItem("carrito-ermy");
  };

  const incrementarCantidad = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const maxStock = item.stock ?? 10; 
          if (item.cantidad < maxStock) {
            return { ...item, cantidad: item.cantidad + 1 };
          } else {
            alert(`Lo sentimos, solo quedan ${maxStock} piezas disponibles de este modelo.`);
          }
        }
        return item;
      })
    );
  };

  const decrementarCantidad = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id && item.cantidad > 1) {
          return { ...item, cantidad: item.cantidad - 1 };
        }
        return item;
      })
    );
  };

  // 🔥 LÓGICA DE MAYOREO POR PRODUCTO INDIVIDUAL
  // 1. Sumamos cuántas piezas en TOTAL hay acumuladas de cada producto_id_principal
  const conteoPorProducto = items.reduce((acc, item) => {
    const claveProducto = item.producto_id_principal || item.id;
    acc[claveProducto] = (acc[claveProducto] || 0) + item.cantidad;
    return acc;
  }, {} as Record<string, number>);

  // 2. Comprobar si un ítem califica a Mayoreo
  const esMayoreoAplicado = (item: ProductoCarrito): boolean => {
    if (!item.precio_mayoreo) return false;
    const claveProducto = item.producto_id_principal || item.id;
    const piezasTotales = conteoPorProducto[claveProducto] || 0;
    const minimoMayoreo = item.cantidad_minima_mayoreo || 12;
    return piezasTotales >= minimoMayoreo;
  };

  // 3. Obtener el precio final por unidad según corresponda
  const obtenerPrecioAplicado = (item: ProductoCarrito): number => {
    return esMayoreoAplicado(item) ? (item.precio_mayoreo || item.precio) : item.precio;
  };

  // 4. Calcular el subtotal usando el precio dinámico de cada ítem
  const total = items.reduce((acc, item) => {
    const precioUnitario = obtenerPrecioAplicado(item);
    return acc + precioUnitario * item.cantidad;
  }, 0);

  return (
    <CarritoContext.Provider 
      value={{ 
        items, agregarProducto, eliminarProducto, vaciarCarrito, 
        incrementarCantidad, decrementarCantidad, 
        total, obtenerPrecioAplicado, esMayoreoAplicado,
        isDrawerOpen, abrirCarrito, cerrarCarrito 
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error("useCarrito debe usarse dentro de un CarritoProvider");
  return context;
};