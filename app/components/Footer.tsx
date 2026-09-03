"use client";

import Link from "next/link";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa6";
import { useState } from "react";
import EnviosModal from "./EnviosModal";
import Boletin from "./Boletin";

export default function Footer() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const anioActual = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-crema pt-20 pb-10 px-6 md:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* COLUMNA 1: MARCA Y MANIFIESTO */}
          <div className="md:col-span-1">
            <h2 className="font-serif text-3xl italic mb-6">Ermy’s</h2>
            <p className="text-stone-400 text-xs leading-relaxed max-w-xs">
              Preservando la herencia textil de Chilac a través de hilos, 
              historias y manos artesanas. Cada pieza es un tributo a nuestra identidad.
            </p>
          </div>

          {/* COLUMNA 2: NAVEGACIÓN (Importante para el usuario y SEO) */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-artesano">Explorar</h3>
            <ul className="space-y-4 text-sm text-stone-300">
              <li><Link href="/productos" className="hover:text-white transition-colors">Catálogo</Link></li>
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Nuestra Historia</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => setModalAbierto(true)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Envíos y Devoluciones
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMNA 3: CONTACTO RÁPIDO */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-artesano">Taller</h3>
            <p className="text-sm text-stone-300 mb-4">
              C. Reforma 51, Segunda, 75883 San Gabriel Chilac, Pue.​
            </p>
            <p className="text-sm text-stone-300 font-serif italic">hola@bordadosermy.com</p>
          </div>

          {/* COLUMNA 4: NEWSLETTER (Para fidelizar clientes) */}
          <div>
            {/* <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-artesano">Boletín</h3> */}
            <Boletin/>
          </div>
        </div>

        {/* BARRA INFERIOR: COPYRIGHT Y REDES */}
        <div className="border-t border-stone-800 pt-10 flex flex-col md:row justify-between items-center gap-6">
          <p className="text-[9px] uppercase tracking-widest text-stone-500">
            © {anioActual} Bordados Ermy. Hecho con paciencia en México.
          </p>
          
          <div className="flex gap-8">
            <a href="https://www.instagram.com/bordadosermys?igsh=MTBzeWhicHhkcGtjZg%3D%3D" target="_blank" className="text-stone-400 hover:text-white transition-colors"><FaInstagram size={18} /></a>
            <a href="https://www.facebook.com/people/Bordados-Ermys/pfbid029RnCJvng4VnPWgwTDM6kFmmWXrpGbVWA2NQjLfuRgMXbbGs54LZVSMCnuHtycZG7l/?mibextid=wwXlfr&rdid=VUYMZEtbr7NOf5nv&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F17J31V38kU%2F%3Fmibextid%3DwwXlfr"  target="_blank" className="text-stone-400 hover:text-white transition-colors"><FaFacebookF size={16} /></a>
            <a href="https://wa.me/2371144871?text=Hola, vengo de la tienda online de Bordados ERMY'S "target="_blank" className="text-stone-400 hover:text-white transition-colors"><FaWhatsapp size={18} /></a>
          </div>
        </div>
      </div>


      <EnviosModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
      />
    </footer>
  );
}