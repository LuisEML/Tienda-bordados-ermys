"use client"; // <--- ¡Vital para que las animaciones funcionen!

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { RevealOnScroll } from "./RevealOnScroll";
import { Typewriter } from "./Typewriter";

// 1. Definimos qué datos dinámicos puede recibir el Hero
interface HeroProps {
  titulo?: string;
  subtitulo?: string;
  imagenUrl?: string;
}

// 2. Pasamos las props y ponemos tus textos e imagen actuales como "respaldo" (fallback)[cite: 4]
export default function Hero({
  titulo = "CONFECCIONES Y BORDADOS ERMY’S",
  subtitulo = "Tradición hecha a mano",
  imagenUrl = "https://cdn.pixabay.com/photo/2019/02/24/09/10/bulgarian-folk-costume-4017175_1280.jpg"
}: HeroProps) {
  
  // Si en la base de datos se guardaron saltos de línea con "\n", los convertimos a etiquetas <br />
  const renderTitulo = () => {
    return titulo.split("\n").map((linea, index) => (
      <span key={index}>
        {linea}
        {index < titulo.split("\n").length - 1 && <br className="hidden md:block" />}
      </span>
    ));
  };

  return (
    <section className="relative h-[70vh] sm:h-[80vh] md:h-[90vh] w-full flex items-center justify-center overflow-hidden">
      
      {/* 1. CONTENEDOR DE IMAGEN CON OVERLAY INTELIGENTE */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={imagenUrl} // <-- Ahora es dinámico
          fill 
          className="object-cover object-center md:object-center" 
          alt="Texturas de bordados artesanales"
          priority
        />
        <div className="absolute inset-0 bg-stone-950/40 md:bg-stone-900/20" />
      </div>

      {/* 2. TEXTOS Y BOTONES (REESCALADOS PARA MÓVIL) */}
      <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl flex flex-col items-center">
        
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-[9px] md:text-xs uppercase tracking-[0.5em] font-bold mb-4 block"
        >
          <Typewriter text={subtitulo} speed={65} delay={150} showCursor={false}/>
          {/* {subtitulo} <-- Ahora es dinámico */}
        </motion.span>
        
        <motion.h1 
          className="font-serif text-4xl md:text-6xl text-white italic mb-10 tracking-wide leading-[1.2] md:leading-[1.1]"
        >
          <Typewriter text={titulo} speed={65} delay={1500}showCursor={false} />
          {/* {renderTitulo()} <-- Ahora es dinámico y respeta saltos de línea */}
        </motion.h1>
        
        {/* 3. BOTONES OPTIMIZADOS PARA TOUCH TARGETS */}
        <div className="flex flex-col md:flex-row gap-4 justify-center w-full max-w-[280px] md:max-w-none">
          
          <Link 
            href="/productos" 
            className="bg-white text-stone-900 px-8 py-3.5 md:py-4 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-tierra hover:text-white transition-all text-center"
          >
            Explorar Catálogo
          </Link>
          
          <Link 
            href="/nosotros" 
            className="backdrop-blur-md bg-white/10 border border-white/20 text-white px-8 py-3.5 md:py-4 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-stone-900 transition-all text-center"
          >
            Nuestra Historia
          </Link>
          
        </div>
      </div>
    </section>
  );
}