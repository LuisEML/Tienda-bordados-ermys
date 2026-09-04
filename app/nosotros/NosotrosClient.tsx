// app/nosotros/page.tsx
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { RevealOnScroll } from "../components/RevealOnScroll";
import { Typewriter } from "../components/Typewriter";
// Fuerza a Next.js a obtener datos frescos de Supabase en cada visita
export const revalidate = 0;

export default async function NosotrosPage() {
  // 1. CONSULTA A SUPABASE
  const { data: configData } = await supabase
    .from("configuracion_web")
    .select("contenido")
    .eq("id", "pagina_nosotros")
    .single();

  const contenido = configData?.contenido || {};

  // 2. EXTRAER VALORES CON FALLBACKS EDITORIALES
  const heroSubtitulo = contenido.hero?.subtitulo || "Desde San Gabriel Chilac, Puebla";
  const heroTitulo = contenido.hero?.titulo || "Nuestra Historia";
  const heroLema = contenido.hero?.lema || "Hecho a mano, dictado por el corazón";

  const quienesSomosTitulo = contenido.quienes_somos?.titulo || "¿Quiénes somos?";
  const quienesSomosTexto = contenido.quienes_somos?.descripcion || 
    "Confecciones y Bordados ERMY’S es más que una empresa textil; somos guardianes de una tradición que se ha tejido con hilos de historia y pasión. Desde 2016, hemos dedicado nuestra experiencia y creatividad a la confección de ropa artesanal que refleja la riqueza cultural de San Gabriel Chilac, Puebla.";
  const quienesSomosImagen = contenido.quienes_somos?.imagen_url || "https://bordadosermi.com.mx/wp-content/uploads/2025/11/1000010990-Photoroom.png";

  const legadoTitulo = contenido.legado?.titulo || "Nuestro Legado";
  const legadoTexto = contenido.legado?.descripcion || "Nacimos de una tradición familiar, en la que cada prenda se confeccionaba a mano con dedicación y esmero. Ofreciendo prendas de alta calidad con el sello inconfundible del bordado artesanal.";
  const legadoImagen = contenido.legado?.imagen_url || "https://bordadosermi.com.mx/wp-content/uploads/2025/11/Diseno-sin-titulo-edited.png";
  
  // Números destacados
  const num1Val = contenido.legado?.num1_val || "2016";
  const num1Tag = contenido.legado?.num1_tag || "Fundación";
  const num2Val = contenido.legado?.num2_val || "+50";
  const num2Tag = contenido.legado?.num2_tag || "Artesanos";
  const num3Val = contenido.legado?.num3_val || "100%";
  const num3Tag = contenido.legado?.num3_tag || "A Mano";

  const misionTexto = contenido.mision?.descripcion || "Empoderar a comunidades de artesanas mexicanas ofreciendo piezas de alta calidad al mundo, garantizando un comercio justo y la preservación de técnicas ancestrales.";
  const visionTexto = contenido.vision?.descripcion || "Ser el referente global de la moda artesanal mexicana, donde la elegancia moderna y la tradición indígena coexisten en perfecta armonía.";

  const mencionCita = contenido.cierre?.cita || "En Confecciones y Bordados ERMY’S, cada prenda es un puente entre el pasado y el presente, una expresión de cultura y arte hecha para trascender.";

  return (
    <main className="bg-[#FDFBF7] min-h-screen text-stone-900 overflow-hidden">
      
      {/* SECCIÓN 1: HERO */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-stone-950 text-white">
        <div className="absolute inset-0 bg-[url('/textura-tela.jpg')] opacity-15 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-stone-950/30 to-stone-950/80" />
        
        <RevealOnScroll>
          <div className="z-10 text-center px-6 max-w-4xl mx-auto space-y-4">
            <span className="uppercase tracking-[0.4em] text-[10px] md:text-xs font-semibold text-stone-300 block">
              <Typewriter text={heroSubtitulo} speed={70} delay={100} showCursor={false}/>
              {/* {heroSubtitulo} */}
            </span>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl italic tracking-wide text-stone-100">
              <Typewriter text={heroTitulo} speed={90} delay={2500} showCursor={false}/>
              {/* {heroTitulo} */}
            </h1>
            <div className="h-px bg-stone-500/40 w-20 mx-auto my-6" />
            <p className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-medium text-stone-300">
              <Typewriter text={heroLema} speed={70} delay={3800} showCursor={false}/>
              {/* {heroLema} */}
            </p>
          </div>
        </RevealOnScroll>
      </section>

      {/* SECCIÓN 2: ¿QUIÉNES SOMOS? */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
          
          {/* Imagen Sangrada Izquierda */}
          <div className="md:col-span-7">
            <RevealOnScroll delay={0}>
              <div className="relative h-[450px] md:h-[600px] w-full rounded-2xl overflow-hidden shadow-xl group">
                <Image 
                  src={quienesSomosImagen} 
                  alt={quienesSomosTitulo}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  priority
                />
              </div>
            </RevealOnScroll>
          </div>

          {/* Contenedor de Texto Derecha */}
          <div className="md:col-span-5">
            <RevealOnScroll delay={150}>
              <div className="space-y-6">
                <span className="text-stone-400 text-[10px] uppercase tracking-[0.3em] block font-bold">
                  Identidad Colectiva
                </span>
                <h2 className="font-serif text-4xl md:text-5xl italic text-stone-900 leading-tight">
                  {quienesSomosTitulo}
                </h2>
                <p className="text-stone-600 leading-relaxed text-sm md:text-base font-sans">
                  {quienesSomosTexto}
                </p>
              </div>
            </RevealOnScroll>
          </div>

        </div>
      </section>

      {/* SECCIÓN 3: NUESTRO LEGADO & NÚMEROS */}
      <section className="max-w-7xl mx-auto py-28 px-6 grid md:grid-cols-12 gap-12 md:gap-16 items-start">
        
        {/* Texto e Impacto a la izquierda */}
        <div className="md:col-span-5 md:sticky md:top-28">
          <RevealOnScroll delay={0}>
            <div className="space-y-10">
              <div className="space-y-6">
                <span className="text-stone-400 text-[10px] uppercase tracking-[0.3em] block font-bold">
                  La Evolución
                </span>
                <h2 className="font-serif text-4xl md:text-5xl italic text-stone-900">
                  {legadoTitulo}
                </h2>
                <p className="text-stone-600 leading-relaxed text-sm md:text-base font-sans">
                  {legadoTexto}
                </p>
              </div>

              {/* Bloque de Números Premium */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200">
                <div>
                  <span className="font-serif text-3xl md:text-4xl text-stone-900 block mb-1">{num1Val}</span>
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">{num1Tag}</span>
                </div>
                <div>
                  <span className="font-serif text-3xl md:text-4xl text-stone-900 block mb-1">{num2Val}</span>
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">{num2Tag}</span>
                </div>
                <div>
                  <span className="font-serif text-3xl md:text-4xl text-stone-900 block mb-1">{num3Val}</span>
                  <span className="text-[9px] uppercase tracking-wider text-stone-400 block font-bold">{num3Tag}</span>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        {/* Imagen a la derecha */}
        <div className="md:col-span-7 w-full">
          <RevealOnScroll delay={150}>
            <div className="relative h-[500px] md:h-[650px] w-full overflow-hidden rounded-2xl shadow-md group">
              <Image 
                src={legadoImagen} 
                alt={legadoTitulo}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* SECCIÓN 4: MISIÓN Y VISIÓN */}
      <section className="bg-[#F5F2EB] py-28 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Tarjeta 01: Misión */}
          <RevealOnScroll delay={0}>
            <div className="bg-white p-10 md:p-14 rounded-2xl shadow-xs border border-stone-200/50 hover:-translate-y-2 transition-transform duration-500">
              <span className="text-stone-300 font-serif italic text-6xl block mb-2 font-light">01</span>
              <h3 className="font-serif text-2xl md:text-3xl text-stone-900 mb-4 italic">Misión</h3>
              <p className="text-stone-600 text-sm md:text-base leading-relaxed font-sans">
                {misionTexto}
              </p>
            </div>
          </RevealOnScroll>

          {/* Tarjeta 02: Visión */}
          <RevealOnScroll delay={150}>
            <div className="bg-white p-10 md:p-14 rounded-2xl shadow-xs border border-stone-200/50 md:translate-y-12 hover:-translate-y-2 transition-transform duration-500">
              <span className="text-stone-300 font-serif italic text-6xl block mb-2 font-light">02</span>
              <h3 className="font-serif text-2xl md:text-3xl text-stone-900 mb-4 italic">Visión</h3>
              <p className="text-stone-600 text-sm md:text-base leading-relaxed font-sans">
                {visionTexto}
              </p>
            </div>
          </RevealOnScroll>

        </div>
      </section>

      {/* SECCIÓN 5: CITA EDITORIAL Y MANIFIESTO */}
      <section className="max-w-4xl mx-auto py-28 px-6 text-center">
        <RevealOnScroll>
          <span className="text-stone-400 text-[10px] uppercase tracking-[0.3em] block font-bold mb-6">
            Manifiesto ERMY’S
          </span>
          <blockquote className="font-serif text-2xl md:text-4xl italic text-stone-800 leading-relaxed mb-8">
            "{mencionCita}"
          </blockquote>
          <div className="h-px bg-stone-300 w-16 mx-auto" />
        </RevealOnScroll>
      </section>

      {/* SECCIÓN 6: VALORES */}
      <section className="bg-[#F5F2EB] py-24 text-center border-t border-stone-200/60 px-6">
        <RevealOnScroll>
          <span className="text-stone-400 text-[10px] uppercase tracking-[0.3em] block font-bold mb-2">Fundamentos</span>
          <h2 className="font-serif text-3xl md:text-4xl italic mb-16 text-stone-900">Nuestros Pilares</h2>
        </RevealOnScroll>

        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {["Autenticidad", "Comercio Justo", "Paciencia", "Identidad"].map((valor, i) => (
            <RevealOnScroll key={i} delay={i * 100}>
              <div className="space-y-3 group cursor-default">
                <div className="h-px bg-stone-300 w-8 mx-auto group-hover:w-16 transition-all duration-500" />
                <p className="uppercase text-[11px] tracking-[0.25em] font-bold text-stone-700 group-hover:text-stone-900 transition-colors">
                  {valor}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

    </main>
  );
}