// app/page.tsx
// Revalida la página cada 0 segundos (siempre obtiene datos frescos de la BD)
export const revalidate = 0;
import DestacadosGrid from './components/DestacadosGrid';
import Hero from './components/Hero';
import Historia from './components/Historia';
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Boletin from './components/Boletin';
import { RevealOnScroll } from './components/RevealOnScroll';

export default async function Home() {

  // 1. CONSULTA A SUPABASE: Traemos toda la configuración de la página de inicio
  const { data: configData } = await supabase
    .from("configuracion_web")
    .select("contenido")
    .eq("id", "pagina_inicio")
    .single();

  const contenido = configData?.contenido || {};

  
  // 2. VALORES POR DEFECTO
  const heroTitulo = contenido.hero?.titulo || "CONFECCIONES Y BORDADOS ERMY’S";
  const heroSubtitulo = contenido.hero?.subtitulo || "Tradición hecha a mano";
  const heroImagen = contenido.hero?.imagen_url || "https://cdn.pixabay.com/photo/2019/02/24/09/10/bulgarian-folk-costume-4017175_1280.jpg";

  // Videos dinámicos
  const TituloVideo = contenido.seccion_videos?.titulo || "EN CONFECCIONES Y BORDADOS ERMY’S…";
  const SubtituloVideo = contenido.seccion_videos?.subtitulo || "Utilizamos materiales de alta calidad y técnicas tradicionales combinadas con diseños innovadores, logrando un equilibrio entre cultura y modernidad.";

  const video1Url = contenido.seccion_videos?.videos?.[0]?.url || "https://cdn.pixabay.com/video/2016/10/26/6121-189135209_large.mp4";
  const video1Titulo = contenido.seccion_videos?.videos?.[0]?.titulo || "Selección de Fibras";

  const video2Url = contenido.seccion_videos?.videos?.[1]?.url || "https://cdn.pixabay.com/video/2017/05/29/9397-219552666_large.mp4";
  const video2Titulo = contenido.seccion_videos?.videos?.[1]?.titulo || "El Arte de la Aguja";

  const video3Url = contenido.seccion_videos?.videos?.[2]?.url || "https://cdn.pixabay.com/video/2021/09/04/87554-601149870_large.mp4";
  const video3Titulo = contenido.seccion_videos?.videos?.[2]?.titulo || "Acabados de Alta Costura";

  // Sección Creaciones Únicas / Historia dinámica
  const historiaTitulo = contenido.creaciones_unicas?.titulo || "CREACIONES ÚNICAS";
  const historiaDesc = contenido.creaciones_unicas?.descripcion || "Llevamos nuestra artesanía un paso más allá...";
  const historiaImagen = contenido.creaciones_unicas?.imagen_url || "https://cdn.pixabay.com/photo/2019/02/24/09/10/bulgarian-folk-costume-4017175_1280.jpg";

  const historiaBadge1Titulo = contenido.creaciones_unicas?.badge1_titulo || "100%";
  const historiaBadge1Subtitulo = contenido.creaciones_unicas?.badge1_subtitulo || "HECHO A MANO";
  const historiaBadge2Titulo = contenido.creaciones_unicas?.badge2_titulo || "Sustentable";
  const historiaBadge2Subtitulo = contenido.creaciones_unicas?.badge2_subtitulo || "FIBRAS NATURALES";

  // Testimonios dinámicos
  const testimonios = (contenido.testimonios && contenido.testimonios[0]?.nombre) 
    ? contenido.testimonios.map((t: any, index: number) => ({
        id: index + 1,
        texto: t.comentario,
        autor: t.nombre,
        origen: "Cliente Satisfecho"
      }))
    : [
        {
          id: 1,
          texto: "Mandé a confeccionar un vestido para una boda y superó todas mis expectativas. El nivel de detalle en el bordado es una obra de arte y el ajuste fue perfecto.",
          autor: "Mariana R.",
          origen: "Ciudad de México"
        },
        {
          id: 2,
          texto: "Las piezas únicas realmente hacen honor a su nombre. Se nota el amor y el tiempo invertido en cada puntada. Una atención al cliente impecable de principio a fin.",
          autor: "Alejandra G.",
          origen: "Oaxaca, México"
        },
        {
          id: 3,
          texto: "Es mi tercera compra en Ermy’s y la calidad de las fibras naturales es de otro nivel. Cómodo, elegante y con un orgullo cultural que se siente al vestirlo.",
          autor: "Sofía M.",
          origen: "Guadalajara"
        }
      ];

  // Consulta de productos destacados
  const { data: destacados, error } = await supabase
    .from("productos")
    .select('*, categorias(nombre), variaciones(*)')
    .eq('destacado', true)
    .limit(3); 

  if (error) {
    console.error("Error cargando destacados:", error);
  }


  // desde aqui
  // Estructura JSON-LD para Google Search
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": destacados?.map((prod, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": prod.nombre,
        "image": [prod.imagen_principal_url],
        "description": prod.descripcion || "Ropa y confección artesanal hecha a mano.",
        "brand": {
          "@type": "Brand",
          "name": "Confecciones y Bordados ERMY’S"
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "MXN",
          "price": prod.precio_menudeo,
          "availability": "https://schema.org/InStock"
        }
      }
    })) || []
  };

  //app/page.tsx
  return (
    <main className="bg-[#FDFBF7] min-h-screen">
      {/* Script Inyectado para Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* 1. SECCIÓN DE BIENVENIDA */}
      <Hero 
        titulo={heroTitulo} 
        subtitulo={heroSubtitulo} 
        imagenUrl={heroImagen} 
      />

      {/* 2. CINTILLA DE VALORES RÁPIDOS */}
      <div className="bg-[#1C1917] text-white py-8 border-t border-white/5 overflow-hidden w-full">
        <div className="relative w-full md:max-w-7xl md:mx-auto md:px-6 overflow-hidden">          
          {/* Móvil: Marquee */}
          <div className="md:hidden overflow-hidden w-full">
            <div className="flex w-max animate-marquee whitespace-nowrap gap-12 pr-12">
              <div className="flex gap-12 items-center text-[10px] uppercase tracking-[0.2em] font-bold">
                <span>• Envíos a todo México</span>
                <span>• Piezas Únicas</span>
                <span>• Calidad Premium</span>
                <span>• Bordado Tradicional</span>
              </div>              
              <div className="flex gap-12 items-center text-[10px] uppercase tracking-[0.2em] font-bold" aria-hidden="true">
                <span>• Envíos a todo México</span>
                <span>• Piezas Únicas</span>
                <span>• Calidad Premium</span>
                <span>• Bordado Tradicional</span>
              </div>
            </div>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-4 text-center text-xs uppercase tracking-[0.2em] font-bold opacity-90">
            <div className="flex items-center justify-center gap-2">
              <span className="text-stone-500">•</span> Envíos a todo México
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-stone-500">•</span> Piezas Únicas
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-stone-500">•</span> Calidad Premium
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-stone-500">•</span> Bordado Tradicional
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN DE VIDEOS */}
      <section className="py-24 md:py-28 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <RevealOnScroll>
            <header className="text-center mb-14 max-w-3xl mx-auto">
              <span className="text-stone-500 text-[12px] uppercase tracking-[0.3em] block mb-3 font-semibold">
                {TituloVideo}
              </span>
              <p className="text-stone-600 text-base md:text-lg font-sans leading-relaxed">
                {SubtituloVideo}
              </p>
            </header>
          </RevealOnScroll>
          
          {/* VIDEOS DINÁMICOS CON EFECTO STAGGER (CASCADA) */}
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 snap-x snap-mandatory scrollbar-none pb-4 md:pb-0">
            
            {/* VIDEO 1 (Delay 0ms) */}
            <RevealOnScroll delay={0} className="min-w-[80vw] sm:min-w-[40vw] md:min-w-0 snap-center">
              <div className="bg-stone-100 h-[400px] relative overflow-hidden rounded-2xl group shadow-xs">
                <video src={video1Url} autoPlay muted loop playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                  <p className="font-serif italic text-lg">{video1Titulo}</p>
                </div>
              </div>
            </RevealOnScroll>

            {/* VIDEO 2 (Delay 150ms) */}
            <RevealOnScroll delay={150} className="min-w-[80vw] sm:min-w-[40vw] md:min-w-0 snap-center">
              <div className="bg-stone-100 h-[400px] md:h-[430px] md:-translate-y-4 relative overflow-hidden rounded-2xl group shadow-xs">
                <video src={video2Url} autoPlay muted loop playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                  <p className="font-serif italic text-lg">{video2Titulo}</p>
                </div>
              </div>
            </RevealOnScroll>

            {/* VIDEO 3 (Delay 300ms) */}
            <RevealOnScroll delay={300} className="min-w-[80vw] sm:min-w-[40vw] md:min-w-0 snap-center">
              <div className="bg-stone-100 h-[400px] relative overflow-hidden rounded-2xl group shadow-xs">
                <video src={video3Url} autoPlay muted loop playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                  <p className="font-serif italic text-lg">{video3Titulo}</p>
                </div>
              </div>
            </RevealOnScroll>

          </div>
        </div>
      </section>

      {/* 4. NUESTROS PRODUCTOS DESTACADOS */}
      <section className="py-24 md:py-28 px-6 bg-[#FDFBF7]">
        <div className="max-w-6xl mx-auto">
          <RevealOnScroll>
            <header className="mb-16 text-center">
              <span className="text-stone-500 text-xs tracking-[0.3em] uppercase block mb-3 font-semibold">Selección Especial</span>
              <h2 className="font-serif text-3xl md:text-4xl italic text-stone-800">Piezas Destacadas</h2>
            </header>    
          </RevealOnScroll>

          <RevealOnScroll delay={150}>
            {destacados && destacados.length > 0 ? (
              <DestacadosGrid productos={destacados} />
            ) : (
              <p className="text-center italic text-stone-400 py-10">Próximamente nuevas piezas...</p>
            )}
          </RevealOnScroll>
        </div>
      </section>

      {/* 5. SECCIÓN DE HISTORIA / CREACIONES ÚNICAS */}
      <RevealOnScroll>
        <Historia
          titulo={historiaTitulo}
          descripcion={historiaDesc}
          imagenUrl={historiaImagen}
          badge1Titulo={historiaBadge1Titulo}
          badge1Subtitulo={historiaBadge1Subtitulo}
          badge2Titulo={historiaBadge2Titulo}
          badge2Subtitulo={historiaBadge2Subtitulo}
        />
      </RevealOnScroll>

      {/* 6. TESTIMONIOS DINÁMICOS */}
      <section className="py-24 md:py-28 bg-[#FDFBF7] border-t border-stone-200/60 overflow-hidden w-full">
        <div className="max-w-7xl mx-auto">
          <RevealOnScroll>
            <span className="text-stone-500 text-[10px] uppercase tracking-[0.3em] block text-center mb-2 font-semibold">
              Experiencias Ermy’s
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 italic text-center mb-16">
              Lo que Dicen Nuestras Clientas
            </h2>
          </RevealOnScroll>

          <RevealOnScroll delay={150}>
            <div className="relative w-full overflow-hidden">
              {/* Difuminados laterales */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#FDFBF7] to-transparent z-10 hidden md:block" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#FDFBF7] to-transparent z-10 hidden md:block" />

              <div className="flex w-max animate-marquee whitespace-nowrap gap-16" style={{ animationDuration: '40s' }}>
                <div className="flex gap-16 items-center">
                  {testimonios.map((item:any) => (
                    <div key={`b1-${item.id}`} className="w-[85vw] md:w-[550px] whitespace-normal bg-white border border-stone-100 p-8 md:p-10 rounded-2xl shadow-xs flex flex-col items-center text-center">
                      <div className="flex gap-1 text-amber-700/60 mb-4 text-xs">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                      </div>
                      <p className="font-serif text-base md:text-lg text-stone-800 italic leading-relaxed">
                        "{item.texto}"
                      </p>
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 block mt-5">
                        — {item.autor}, {item.origen}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-16 items-center" aria-hidden="true">
                  {testimonios.map((item:any) => (
                    <div key={`b2-${item.id}`} className="w-[85vw] md:w-[550px] whitespace-normal bg-white border border-stone-100 p-8 md:p-10 rounded-2xl shadow-xs flex flex-col items-center text-center">
                      <div className="flex gap-1 text-amber-700/60 mb-4 text-xs">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                      </div>
                      <p className="font-serif text-base md:text-lg text-stone-800 italic leading-relaxed">
                        "{item.texto}"
                      </p>
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 block mt-5">
                        — {item.autor}, {item.origen}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* 7. SECCIÓN BOLETÍN */}
      <section className="bg-stone-900 text-stone-100 py-16 px-6 border-t border-stone-800">
        <RevealOnScroll>
          <div className="max-w-xl mx-auto text-center space-y-4">
            <h2 className="font-serif text-2xl md:text-3xl italic">Únete a nuestra comunidad artesana</h2>
            <p className="text-xs md:text-sm text-stone-400 leading-relaxed">
              Recibe acceso anticipado a nuestras colecciones limitadas, historias sobre nuestros procesos de confección y promociones exclusivas.
            </p>
            <div className="pt-2 max-w-md mx-auto">
              <Boletin/>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <div className='border-t border-stone-700'></div>

    </main>
  );
}