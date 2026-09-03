// app/components/Historia.tsx
import React from 'react';

  // 1. Definimos la interfaz TypeScript para las props
interface HistoriaProps {
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  badge1Titulo: string;
  badge1Subtitulo: string;
  badge2Titulo: string;
  badge2Subtitulo: string;
}


export default function Historia( {
  titulo,
  descripcion,
  imagenUrl,
  badge1Titulo,
  badge1Subtitulo,
  badge2Titulo,
  badge2Subtitulo,
}:HistoriaProps) {

  return (
    <section className="py-30 bg-crema px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        {/* Imagen con decoración */}
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-full h-full border border-artesano/30 rounded-lg"></div>
          <img 
            src={imagenUrl} 
            alt={titulo} 
            className="relative z-10 rounded-lg shadow-2xl object-cover aspect-[4/5]"
          />
        </div>

        {/* Texto */}
        <div className="space-y-8">
          <h2 className="text-4xl font-serif text-tierra leading-snug">
            {titulo}
          </h2>
          <p className="text-stone-600 font-sans leading-relaxed text-lg">
            {descripcion}
          </p>
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <h4 className="font-serif text-2xl text-tierra italic">{badge1Titulo} </h4>
              <p className="text-xs uppercase tracking-widest text-stone-400">{badge1Subtitulo} </p>
            </div>
            <div>
              <h4 className="font-serif text-2xl text-tierra italic">{badge2Titulo} </h4>
              <p className="text-xs uppercase tracking-widest text-stone-400">{badge2Subtitulo}  </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}