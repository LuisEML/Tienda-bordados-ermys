"use client";

import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import CarritoDrawer from './CartDrawer';

export default function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // Para el efecto de scroll

  const { items } = useCart();
  const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0);

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Nosotros", href: "/nosotros" },
    { name: "Catálogo", href: "/productos" },
    { name: "Contacto", href: "/contacto" },
  ];

  // Escuchamos el scroll para activar el efecto de vidrio esmerilado
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* CAMBIO CLAVE: 
        - Usamos backdrop-blur-md (vidrio esmerilado).
        - Si el usuario hace scroll, el fondo se vuelve ligeramente transparente (bg-crema/80) y la sombra cambia.
      */}
      <nav className={`sticky top-0 z-40 flex items-center justify-between px-6 py-5 transition-all duration-300 ${
        isScrolled 
          ? "bg-crema/80 backdrop-blur-md border-b border-stone-200/50 shadow-xs" 
          : "bg-crema border-b border-stone-200"
      }`}>
        
        {/* --- MENÚ HAMBURGUESA (MÓVIL) --- */}
        <div className="md:hidden z-50">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-stone-800 p-1 focus:outline-none cursor-pointer"
            aria-label="Menú de navegación"
          >
            <motion.div key={isMenuOpen ? "open" : "closed"} animate={{ rotate: isMenuOpen ? 90 : 0 }}>
              {isMenuOpen ? <X size={24} className="text-stone-800" /> : <Menu size={24} className="text-tierra" />}
            </motion.div>
          </button>
        </div>

        {/* --- NAVEGACIÓN DESKTOP (MEJORADA) --- */}
        <div className="hidden md:flex gap-8 text-xs uppercase tracking-[0.2em] font-sans font-semibold text-stone-500">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="relative py-1 text-stone-600 hover:text-tierra transition-colors duration-300 group"
            >
              {link.name}
              {/* Línea animada inferior (Underline Reveal) */}
              <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-tierra scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out" />
            </Link>
          ))}
        </div>

        {/* --- LOGO CENTRAL --- */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/">
            {/* Un pequeño efecto de opacidad suave al pasar el mouse por el logo */}
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-tierra tracking-tighter cursor-pointer hover:opacity-80 transition-opacity">
              ERMY’S
            </h1>
          </Link>
        </div>

        {/* --- ICONO DEL CARRITO (MEJORADO) --- */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="relative p-2 group cursor-pointer"
          aria-label="Ver carrito"
        >
          {/* El icono gira sutilmente 5 grados al pasar el mouse simulating balanceo */}
          <ShoppingBag className="w-6 h-6 text-stone-800 group-hover:text-tierra group-hover:-rotate-6 transition-all duration-300" />
          
          <AnimatePresence>
            {cantidadTotal > 0 && (
              <motion.span
                key={cantidadTotal}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="absolute -top-1 -right-1 bg-tierra text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-xs"
              >
                {cantidadTotal}
                
                {/* Efecto de pulso sutil parpadeante detrás del número */}
                <span className="absolute inset-0 rounded-full bg-tierra/40 animate-ping z-[-1]" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* --- MENÚ DESPLEGABLE MÓVIL (Se mantiene igual de hermoso) --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-stone-50 z-35 p-8 pt-24 shadow-2xl md:hidden flex flex-col justify-between"
            >
              <div className="flex flex-col gap-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-2">Navegación</p>
                {navLinks.map((link, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={link.href}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-2xl font-serif italic text-stone-800 hover:text-tierra transition-colors block py-2"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-stone-200 pt-6">
                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">San Gabriel Chilac</p>
                <p className="text-xs text-stone-500 italic">Confecciones y Bordados</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CarritoDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>    
  );
}