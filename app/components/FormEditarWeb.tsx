"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { Save, ChevronDown, ChevronUp, Loader2, Play, Quote, FileText, Image as ImageIcon, Upload,Video } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function FormEditarWebCompleto() {
  // Copia de los datos guardados en Supabase para comparar
  const [datosOriginales, setDatosOriginales] = useState<string>("");
  // Indica si el usuario modificó algún campo respecto a lo que hay en Supabase
  // const [hayCambios, setHayCambios] = useState(false);

  // Snapshots para comparar individualmente cada pestaña
  const [datosOrigInicio, setDatosOrigInicio] = useState<string>("");
  const [datosOrigNosotros, setDatosOrigNosotros] = useState<string>("");

  // Estados de cambios por pestaña
  const [hayCambiosInicio, setHayCambiosInicio] = useState(false);
  const [hayCambiosNosotros, setHayCambiosNosotros] = useState(false);

  // Hay cambios globales si cualquiera de las dos tiene cambios
  const hayCambios = hayCambiosInicio || hayCambiosNosotros;


  const [loading, setLoading] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false); // Estado exclusivo para la carga de la imagen
  
  // Estados para controlar qué video se está subiendo actualmente
  const [subiendoVideo, setSubiendoVideo] = useState<{ [key: number]: boolean }>({
    1: false,
    2: false,
    3: false
  });
  
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>("hero");
  const [pestanaActiva, setPestanaActiva] = useState<"inicio" | "nosotros">("inicio");
  
  // Controla qué sección está abierta en la pestaña "Nosotros"
  // Inicia con la primera sección ("hero") abierta por defecto
  const [seccionAbiertaNosotros, setSeccionAbiertaNosotros] = useState<string | null>("hero");




  // =========================================================
  // ESTADOS DEL CONTENIDO (Reflejando la estructura del JSON)
  // =========================================================
  
  // --- PÁGINA DE INICIO ---
  // Hero
  const [heroTitulo, setHeroTitulo] = useState("");
  const [heroSubtitulo, setHeroSubtitulo] = useState("");
  const [heroImagen, setHeroImagen] = useState(""); // Aquí guardaremos la URL de la imagen de portada

  // Videos (URLs y Textos Editables para cada uno)
  // Titulo
  const [videoTituloPrincipal,setVideoTituloPrincipal] = useState("");
  const [videoSubtitulo,setVideoSubtitulo] = useState("");

  const [video1Url, setVideo1Url] = useState("");
  const [video1Titulo, setVideo1Titulo] = useState("");

  const [video2Url, setVideo2Url] = useState("");
  const [video2Titulo, setVideo2Titulo] = useState("");

  const [video3Url, setVideo3Url] = useState("");
  const [video3Titulo, setVideo3Titulo] = useState("");

  // Sección Creaciones Únicas
  const [creacionesTitulo, setCreacionesTitulo] = useState("");
  const [creacionesDesc, setCreacionesDesc] = useState("");
  const [creacionesImagen, setCreacionesImagen] = useState("");
  const [subiendoImgCreaciones, setSubiendoImgCreaciones] = useState(false);

  const [badge1Titulo, setBadge1Titulo] = useState("");
  const [badge1Subtitulo, setBadge1Subtitulo] = useState("");
  const [badge2Titulo, setBadge2Titulo] = useState("");
  const [badge2Subtitulo, setBadge2Subtitulo] = useState("");

  // Experiencias (Testimonios)
  const [testimonio1Nombre, setTestimonio1Nombre] = useState("");
  const [testimonio1Comentario, setTestimonio1Comentario] = useState("");
  const [testimonio2Nombre, setTestimonio2Nombre] = useState("");
  const [testimonio2Comentario, setTestimonio2Comentario] = useState("");
  const [testimonio3Nombre, setTestimonio3Nombre] = useState("");
  const [testimonio3Comentario, setTestimonio3Comentario] = useState("");

  // --- PÁGINA DE NOSOTROS ---
  // --- ESTADOS SECCIÓN NOSOTROS ---
    const [nosotrosHeroSub, setNosotrosHeroSub] = useState("");
    const [nosotrosHeroTitulo, setNosotrosHeroTitulo] = useState("");
    const [nosotrosHeroLema, setNosotrosHeroLema] = useState("");

    const [quienesSomosTitulo, setQuienesSomosTitulo] = useState("");
    const [quienesSomosDesc, setQuienesSomosDesc] = useState("");
    const [quienesSomosImagen, setQuienesSomosImagen] = useState("");
    const [subiendoImgQuienes, setSubiendoImgQuienes] = useState(false);

    const [legadoTitulo, setLegadoTitulo] = useState("");
    const [legadoDesc, setLegadoDesc] = useState("");
    const [legadoImagen, setLegadoImagen] = useState("");
    const [subiendoImgLegado, setSubiendoImgLegado] = useState(false);

    const [num1Val, setNum1Val] = useState("");
    const [num1Tag, setNum1Tag] = useState("");
    const [num2Val, setNum2Val] = useState("");
    const [num2Tag, setNum2Tag] = useState("");
    const [num3Val, setNum3Val] = useState("");
    const [num3Tag, setNum3Tag] = useState("");

    const [misionDesc, setMisionDesc] = useState("");
    const [visionDesc, setVisionDesc] = useState("");
    const [cierreCita, setCierreCita] = useState("");



     // Función helper para generar la "foto" (snapshot) del estado actual
  // const obtenerSnapshot = () => {
  //   return JSON.stringify({
  //     heroTitulo, heroSubtitulo, heroImagen,
  //     video1Url, video1Titulo, video2Url, video2Titulo, video3Url, video3Titulo,
  //     creacionesTitulo, creacionesDesc, creacionesImagen, badge1Titulo, badge1Subtitulo, badge2Titulo, badge2Subtitulo,
  //     testimonio1Nombre, testimonio1Comentario, testimonio2Nombre, testimonio2Comentario, testimonio3Nombre, testimonio3Comentario,
  //     nosotrosHeroSub, nosotrosHeroTitulo, nosotrosHeroLema,
  //     quienesSomosTitulo, quienesSomosDesc, quienesSomosImagen,
  //     legadoTitulo, legadoDesc, legadoImagen, num1Val, num1Tag, num2Val, num2Tag, num3Val, num3Tag,
  //     misionDesc, visionDesc, cierreCita
  //   });
  // };


  // Helpers para generar snapshot de cada sección
  const obtenerSnapshotInicio = () => JSON.stringify({
    heroTitulo, heroSubtitulo, heroImagen,
    videoTituloPrincipal, videoSubtitulo,
    video1Url, video1Titulo, video2Url, video2Titulo, video3Url, video3Titulo,
    creacionesTitulo, creacionesDesc, creacionesImagen, badge1Titulo, badge1Subtitulo, badge2Titulo, badge2Subtitulo,
    testimonio1Nombre, testimonio1Comentario, testimonio2Nombre, testimonio2Comentario, testimonio3Nombre, testimonio3Comentario,
  });

  const obtenerSnapshotNosotros = () => JSON.stringify({
    nosotrosHeroSub, nosotrosHeroTitulo, nosotrosHeroLema,
    quienesSomosTitulo, quienesSomosDesc, quienesSomosImagen,
    legadoTitulo, legadoDesc, legadoImagen, num1Val, num1Tag, num2Val, num2Tag, num3Val, num3Tag,
    misionDesc, visionDesc, cierreCita
  });


  // =========================================================
  // PASO 2: ADVERTENCIA AL INTENTAR SALIR DE LA PÁGINA
  // =========================================================
  // 1. Cierre de Pestaña / Recarga (Nivel Navegador)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hayCambios) return;
      e.preventDefault();
      // Nota: Los navegadores modernos muestran un mensaje estándar por seguridad,
      // pero asignar returnValue es obligatorio para activar la alerta.
      e.returnValue = "Tienes cambios sin guardar. ¿Seguro que quieres salir?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hayCambios]);

  // 2. Interceptar Clics en Enlaces Internos de Next.js / Navegación
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      if (!hayCambios) return;

      const target = (e.target as HTMLElement).closest("a");
      if (target && target.href && !target.href.startsWith("javascript:")) {
        const confirmar = window.confirm(
          "Tienes cambios pendientes sin guardar. Si sales ahora, perderás las modificaciones.\n\n¿Deseas salir de todas formas?"
        );
        if (!confirmar) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => document.removeEventListener("click", handleAnchorClick, true);
  }, [hayCambios]);
  

  // =========================================================
  // CARGAR DATOS DESDE SUPABASE AL INICIAR
  // =========================================================
  useEffect(() => {
    const cargarTodoElContenido = async () => {
      try {
        // Cargar Inicio
        const { data: inicioData } = await supabase
          .from("configuracion_web")
          .select("contenido")
          .eq("id", "pagina_inicio")
          .single();

        if (inicioData?.contenido) {
          const c = inicioData.contenido;
          setHeroTitulo(c.hero?.titulo || "");
          setHeroSubtitulo(c.hero?.subtitulo || "");
          setHeroImagen(c.hero?.imagen_url || ""); // Cargamos la imagen guardada
          
          // Cargar videos y sus títulos correspondientes
          setVideoTituloPrincipal(c.seccion_videos?.titulo || "");
          setVideoSubtitulo(c.seccion_videos?.subtitulo || "");

          setVideo1Url(c.seccion_videos?.videos?.[0]?.url || "");
          setVideo1Titulo(c.seccion_videos?.videos?.[0]?.titulo || "Selección de Fibras");

          setVideo2Url(c.seccion_videos?.videos?.[1]?.url || "");
          setVideo2Titulo(c.seccion_videos?.videos?.[1]?.titulo || "El Arte de la Aguja");

          setVideo3Url(c.seccion_videos?.videos?.[2]?.url || "");
          setVideo3Titulo(c.seccion_videos?.videos?.[2]?.titulo || "Acabados de Alta Costura");
          
          setCreacionesTitulo(c.creaciones_unicas?.titulo || "");
          setCreacionesDesc(c.creaciones_unicas?.descripcion || "");
          setCreacionesImagen(c.creaciones_unicas?.imagen_url || "");
          setTestimonio1Nombre(c.testimonios?.[0]?.nombre || "");
          setTestimonio1Comentario(c.testimonios?.[0]?.comentario || "");
          setTestimonio2Nombre(c.testimonios?.[1]?.nombre || "");
          setTestimonio2Comentario(c.testimonios?.[1]?.comentario || "");
          setTestimonio3Nombre(c.testimonios?.[2]?.nombre || "");
          setTestimonio3Comentario(c.testimonios?.[2]?.comentario || "");
        }

        // Cargar Nosotros
        const { data: nosotrosData } = await supabase
          .from("configuracion_web")
          .select("contenido")
          .eq("id", "pagina_nosotros")
          .single();

        if (nosotrosData?.contenido) {

          // Cargar datos en los estados
          const c = nosotrosData?.contenido || {};

          setNosotrosHeroSub(c.hero?.subtitulo || "Desde San Gabriel Chilac, Puebla");
          setNosotrosHeroTitulo(c.hero?.titulo || "Nuestra Historia");
          setNosotrosHeroLema(c.hero?.lema || "Hecho a mano, dictado por el corazón");

          setQuienesSomosTitulo(c.quienes_somos?.titulo || "¿Quiénes somos?");
          setQuienesSomosDesc(c.quienes_somos?.descripcion || "");
          setQuienesSomosImagen(c.quienes_somos?.imagen_url || "");

          setLegadoTitulo(c.legado?.titulo || "Nuestro Legado");
          setLegadoDesc(c.legado?.descripcion || "");
          setLegadoImagen(c.legado?.imagen_url || "");

          setNum1Val(c.legado?.num1_val || "2016");
          setNum1Tag(c.legado?.num1_tag || "Fundación");
          setNum2Val(c.legado?.num2_val || "+50");
          setNum2Tag(c.legado?.num2_tag || "Artesanos");
          setNum3Val(c.legado?.num3_val || "100%");
          setNum3Tag(c.legado?.num3_tag || "A Mano");

          setMisionDesc(c.mision?.descripcion || "");
          setVisionDesc(c.vision?.descripcion || "");
          setCierreCita(c.cierre?.cita || "");
        }

        // 🟢 AGREGA ESTAS LÍNEAS JUSTO AQUÍ AL FINAL DEL TRY:
        setTimeout(() => {
          setDatosOrigInicio(obtenerSnapshotInicio());
          setDatosOrigNosotros(obtenerSnapshotNosotros());
          setHayCambiosInicio(false);
          setHayCambiosNosotros(false);
        }, 100);

      } catch (err) {
        console.error("Error al cargar configuraciones:", err);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarTodoElContenido();
  }, []);


  // // Detector automático de cambios
  // useEffect(() => {
  //   // Si aún no hemos tomado la foto inicial de Supabase, no comparamos
  //   if (!datosOriginales) return;

  //   const snapshotActual = obtenerSnapshot();
  //   setHayCambios(snapshotActual !== datosOriginales);
  // }, [
  //   // Pestaña Inicio
  //   heroTitulo, heroSubtitulo, heroImagen,
  //   videoTituloPrincipal, videoSubtitulo, // 👈 Se agregaron estas dos que faltaban
  //   video1Url, video1Titulo, video2Url, video2Titulo, video3Url, video3Titulo,
  //   creacionesTitulo, creacionesDesc, creacionesImagen, badge1Titulo, badge1Subtitulo, badge2Titulo, badge2Subtitulo,
  //   testimonio1Nombre, testimonio1Comentario, testimonio2Nombre, testimonio2Comentario, testimonio3Nombre, testimonio3Comentario,
  //   // Pestaña Nosotros
  //   nosotrosHeroSub, nosotrosHeroTitulo, nosotrosHeroLema,
  //   quienesSomosTitulo, quienesSomosDesc, quienesSomosImagen,
  //   legadoTitulo, legadoDesc, legadoImagen, num1Val, num1Tag, num2Val, num2Tag, num3Val, num3Tag,
  //   misionDesc, visionDesc, cierreCita,
  //   // Estado de referencia
  //   datosOriginales
  // ]);


  // Detección de cambios en INICIO
  useEffect(() => {
    if (!datosOrigInicio) return;
    setHayCambiosInicio(obtenerSnapshotInicio() !== datosOrigInicio);
  }, [
    heroTitulo, heroSubtitulo, heroImagen,
    videoTituloPrincipal, videoSubtitulo,
    video1Url, video1Titulo, video2Url, video2Titulo, video3Url, video3Titulo,
    creacionesTitulo, creacionesDesc, creacionesImagen, badge1Titulo, badge1Subtitulo, badge2Titulo, badge2Subtitulo,
    testimonio1Nombre, testimonio1Comentario, testimonio2Nombre, testimonio2Comentario, testimonio3Nombre, testimonio3Comentario,
    datosOrigInicio
  ]);

  // Detección de cambios en NOSOTROS
  useEffect(() => {
    if (!datosOrigNosotros) return;
    setHayCambiosNosotros(obtenerSnapshotNosotros() !== datosOrigNosotros);
  }, [
    nosotrosHeroSub, nosotrosHeroTitulo, nosotrosHeroLema,
    quienesSomosTitulo, quienesSomosDesc, quienesSomosImagen,
    legadoTitulo, legadoDesc, legadoImagen, num1Val, num1Tag, num2Val, num2Tag, num3Val, num3Tag,
    misionDesc, visionDesc, cierreCita,
    datosOrigNosotros
  ]);


  // =========================================================
  // FUNCIÓN PARA SUBIR LA IMAGEN DEL HERO AL STORAGE
  // =========================================================
  const handleSubirImagenHero = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoImagen(true);
    try {
      // 1. Definimos un nombre único para el archivo usando la fecha actual
      const fileExt = file.name.split(".").pop();
      const fileName = `hero-portada-${Date.now()}.${fileExt}`;
      
      // 2. Subimos el archivo a tu bucket de fotos de productos
      const { error: uploadError } = await supabase.storage
        .from("fotos-productos") // Asegúrate de usar el nombre correcto de tu bucket
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 3. Obtenemos la URL pública del archivo subido
      const { data: { publicUrl } } = supabase.storage
        .from("fotos-productos")
        .getPublicUrl(fileName);

      // 4. Guardamos la URL pública en el estado local para previsualizarla
      setHeroImagen(publicUrl);
      toast.success("¡Imagen de portada cargada con éxito!", {
         description: "Recuerda guardar los cambios finales abajo",
      });
    } catch (err: any) {
      toast.error("Error al subir la imagen", {
        description: err.message,
      });
    } finally {
      setSubiendoImagen(false);
    }
  };


  // =========================================================
  // FUNCIÓN GENÉRICA PARA SUBIR VIDEOS AL STORAGE
  // =========================================================
  const handleSubirVideo = async (e: ChangeEvent<HTMLInputElement>, videoNumero: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación del formato para asegurar que solo suban videos
    if (!file.type.startsWith("video/")) {
      toast.error("Por favor, selecciona un archivo de video válido (MP4, WebM, etc.)")
      // alert("Por favor, selecciona un archivo de video válido (MP4, WebM, etc.)");
      return;
    }

    setSubiendoVideo(prev => ({ ...prev, [videoNumero]: true }));
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `promo-video-${videoNumero}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("fotos-productos") // Reutilizamos tu bucket para archivos multimedia
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("fotos-productos")
        .getPublicUrl(fileName);

      // Asignamos la URL obtenida al estado del video correspondiente
      if (videoNumero === 1) setVideo1Url(publicUrl);
      if (videoNumero === 2) setVideo2Url(publicUrl);
      if (videoNumero === 3) setVideo3Url(publicUrl);

      toast.success(`¡Video ${videoNumero} subido con éxito!`)
      // alert(`¡Video ${videoNumero} subido con éxito!`);
    } catch (err: any) {
      toast.error("Error al subir el video:", {
        description: err.message,
      });
      // alert("Error al subir el video: " + err.message);
    } finally {
      setSubiendoVideo(prev => ({ ...prev, [videoNumero]: false }));
    }
  };


  // --- FUNCIÓN PARA SUBIR LA IMAGEN DE ESTA SECCIÓN ---
  const handleSubirImagenCreaciones = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setSubiendoImgCreaciones(true);
  try {
    const fileName = `inicio/creaciones_${Date.now()}.${file.name.split('.').pop()}`;
    const { data, error } = await supabase.storage.from('fotos-productos').upload(fileName, file);

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage.from('fotos-productos').getPublicUrl(fileName);
    setCreacionesImagen(publicUrlData.publicUrl);
    toast.success("Imagen subida correctamente");
  } catch (err: any) {
    toast.error("Error al subir la imagen: " + err.message);
  } finally {
    setSubiendoImgCreaciones(false);
  }
  };



    
  // =========================================================
  // GUARDAR TODO EL CONTENIDO EN LA BASE DE DATOS
  // =========================================================
  const guardarConfiguracion = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  // Usamos toast.promise para la retroalimentación visual en tiempo real
  toast.promise(
    async () => {
      if (pestanaActiva === "inicio") {
        // 1. Armamos la estructura de inicio
        const payloadInicio = {
          hero: { 
            titulo: heroTitulo, 
            subtitulo: heroSubtitulo, 
            imagen_url: heroImagen 
          },
          seccion_videos: { 
            videos: [
              { url: video1Url, titulo: video1Titulo },
              { url: video2Url, titulo: video2Titulo },
              { url: video3Url, titulo: video3Titulo }
            ] 
          },
          creaciones_unicas: { 
            titulo: creacionesTitulo, 
            descripcion: creacionesDesc,
            imagen_url: creacionesImagen,
            badge1_titulo: badge1Titulo,
            badge1_subtitulo: badge1Subtitulo,
            badge2_titulo: badge2Titulo,
            badge2_subtitulo: badge2Subtitulo
          },
          testimonios: [
            { nombre: testimonio1Nombre, comentario: testimonio1Comentario },
            { nombre: testimonio2Nombre, comentario: testimonio2Comentario },
            { nombre: testimonio3Nombre, comentario: testimonio3Comentario },
          ]
        };

        // 2. Guardamos en Supabase
        const { error } = await supabase.from("configuracion_web").upsert({
          id: "pagina_inicio",
          pagina: "inicio",
          seccion: "general",
          contenido: payloadInicio,
          updated_at: new Date().toISOString()
        });

        if (error) throw error;

      } else {
        // Pestaña Nosotros...
        const payloadNosotros = {
          hero: {
            subtitulo: nosotrosHeroSub,
            titulo: nosotrosHeroTitulo,
            lema: nosotrosHeroLema
          },
          quienes_somos: {
            titulo: quienesSomosTitulo,
            descripcion: quienesSomosDesc,
            imagen_url: quienesSomosImagen
          },
          legado: {
            titulo: legadoTitulo,
            descripcion: legadoDesc,
            imagen_url: legadoImagen,
            num1_val: num1Val,
            num1_tag: num1Tag,
            num2_val: num2Val,
            num2_tag: num2Tag,
            num3_val: num3Val,
            num3_tag: num3Tag
          },
          mision: {
            descripcion: misionDesc
          },
          vision: {
            descripcion: visionDesc
          },
          cierre: {
            cita: cierreCita
          }
        };

        const { error } = await supabase.from("configuracion_web").upsert({
          id: "pagina_nosotros",
          pagina: "nosotros",
          seccion: "general",
          contenido: payloadNosotros,
          updated_at: new Date().toISOString()
        });

        if (error) throw error;
      }

      // ----------------------------------------------------
      // PASO 4: ACTUALIZAMOS LA FOTO Y DESACTIVAMOS EL BOTÓN
      // ----------------------------------------------------
      // Si guardaste Inicio:
      setDatosOrigInicio(obtenerSnapshotInicio());
      setHayCambiosInicio(false);

      // Si guardaste Nosotros:
      setDatosOrigNosotros(obtenerSnapshotNosotros());
      setHayCambiosNosotros(false);
    },
    {
      loading: 'Guardando cambios en el servidor...',
      success: `¡Sección ${pestanaActiva === "inicio" ? "Inicio" : "Nosotros"} guardada con éxito!`,
      error: (err: any) => `Error al guardar: ${err.message || 'Ocurrió un problema'}`,
    }
  );

  setLoading(false);
  };

  
  const toggleSeccion = (seccion: string) => {
    setSeccionAbierta(seccionAbierta === seccion ? null : seccion);
  };

  // Función para abrir y cerrar secciones de Nosotros
  const toggleSeccionNosotros = (seccion: string) => {
    setSeccionAbiertaNosotros(prev => prev === seccion ? null : seccion);
  };

  // Comprobar si hay alguna carga en progreso para deshabilitar botones
  const algunVideoSubiendo = Object.values(subiendoVideo).some(v => v);



  return (
    <form onSubmit={guardarConfiguracion} className="space-y-6">
      
      {/* Selector superior de Página */}
      <div className="flex border-b border-stone-200">
        <button
          type="button"
          onClick={() => { setPestanaActiva("inicio"); setSeccionAbierta("hero"); }}
          className={`relative px-6 py-3 font-serif text-lg italic border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            pestanaActiva === "inicio" ? "border-stone-800 text-stone-800 font-bold" : "border-transparent text-stone-400"
          }`}
        >
          <span>Editar Página de Inicio</span>
          {/* Indicador visual de cambios pendientes */}
          {hayCambiosInicio && (
            <span 
              className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-xs" 
              title="Tienes cambios pendientes en Inicio" 
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => { setPestanaActiva("nosotros"); setSeccionAbiertaNosotros("hero"); }}
          className={`relative px-6 py-3 font-serif text-lg italic border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            pestanaActiva === "nosotros" ? "border-stone-800 text-stone-800 font-bold" : "border-transparent text-stone-400"
          }`}
        >
          <span>Editar Página Nosotros</span>
          {/* Indicador visual de cambios pendientes */}
          {hayCambiosNosotros && (
            <span 
              className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-xs" 
              title="Tienes cambios pendientes en Nosotros" 
            />
          )}
        </button>
      </div>

      {/* CONTENIDO DE PÁGINA DE INICIO */}
      {pestanaActiva === "inicio" && (
        <div className="space-y-4">
          
          {/* SECCIÓN 1: HERO (PORTADA) */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => toggleSeccion("hero")}
              className="w-full flex justify-between items-center p-5 bg-stone-50 hover:bg-stone-100/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-stone-500" />
                <span className="font-serif italic text-stone-800 text-lg">Sección Hero (Portada Principal)</span>
              </div>
              {seccionAbierta === "hero" ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {seccionAbierta === "hero" && (
              <div className="p-6 space-y-6 border-t border-stone-100">
                {/* INPUTS DE TEXTO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Título Principal</label>
                    <input value={heroTitulo} onChange={(e) => setHeroTitulo(e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg text-sm font-semibold" placeholder="Ej. Confecciones y Bordados Ermy's" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Subtítulo</label>
                    <input value={heroSubtitulo} onChange={(e) => setHeroSubtitulo(e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg text-sm font-semibold" placeholder="Ej. Tradición hecha a mano" />
                  </div>
                </div>

                {/* CONTROL Y PREVISUALIZACIÓN DE LA IMAGEN */}
                <div className="space-y-3">
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400">Imagen de Portada Principal</label>
                  <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 flex flex-col md:flex-row items-center gap-6">
                    {/* Caja de Previsualización */}
                    <div className="relative w-full md:w-48 aspect-video rounded-lg overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center">
                      {heroImagen ? (
                        <img src={heroImagen} className="w-full h-full object-cover" alt="Previsualización Hero" />
                      ) : (
                        <div className="flex flex-col items-center text-stone-300">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span className="text-[10px] font-bold">Sin Imagen</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Botón de Carga */}
                    <div className="flex-1 space-y-2">
                      <p className="text-xs text-stone-500">Sube una imagen de alta calidad para el fondo de la pantalla de bienvenida. Se recomiendan dimensiones panorámicas.</p>
                      <label className="inline-flex items-center gap-2 cursor-pointer bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm">
                        {subiendoImagen ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-stone-500" /> Subiendo archivo...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-stone-500" /> Seleccionar Imagen
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*" 
                          disabled={subiendoImagen} 
                          className="hidden" 
                          onChange={handleSubirImagenHero} 
                        />
                      </label>
                    </div>
                  </div>
                </div>
                {/* ---- */}
              </div>
            )}
          </div>

          {/* SECCIÓN 2: LOS 3 VIDEOS CON TEXTO EDITABLE Y UPLOAD DIRECTO */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => toggleSeccion("videos")}
              className="w-full flex justify-between items-center p-5 bg-stone-50 hover:bg-stone-100/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Play className="w-5 h-5 text-stone-500" />
                <span className="font-serif italic text-stone-800 text-lg">Sección de Videos Promocionales</span>
              </div>
              {seccionAbierta === "videos" ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {seccionAbierta === "videos" && (
              <div className="p-6 space-y-8 border-t border-stone-100">
                <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Título Principal</label>
                    <input value={videoTituloPrincipal} onChange={(e) => setVideoTituloPrincipal(e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg text-sm font-semibold" placeholder="Ej. Confecciones y Bordados Ermy's" />
                </div>
                <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Subtitulo</label>
                    <textarea value={videoSubtitulo} onChange={(e) => setVideoSubtitulo(e.target.value)} rows={2} className="w-full p-3 border border-stone-200 bg-white rounded-lg text-sm resize-none" placeholder="Subtitulo..." />
                </div>
                {/* VIDEO 1 */}
                <div className="p-4 bg-stone-50 rounded-xl space-y-4 border border-stone-200/60">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Bloque de Video 1</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Título / Leyenda del Video</label>
                      <input value={video1Titulo} onChange={(e) => setVideo1Titulo(e.target.value)} className="w-full p-3 border border-stone-200 bg-white rounded-lg text-sm font-semibold" placeholder="Ej. Selección de Fibras" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Archivo de Video (Directo o URL)</label>
                      <div className="flex gap-2">
                        <input value={video1Url} onChange={(e) => setVideo1Url(e.target.value)} className="flex-1 p-3 border border-stone-200 bg-white rounded-lg text-sm" placeholder="O pega un enlace de video..." />
                        <label className="flex items-center justify-center bg-stone-900 hover:bg-stone-800 text-white p-3 rounded-lg cursor-pointer transition-all">
                          {subiendoVideo[1] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                          <input type="file" accept="video/*" disabled={subiendoVideo[1]} className="hidden" onChange={(e) => handleSubirVideo(e, 1)} />
                        </label>
                      </div>
                    </div>
                  </div>
                  {video1Url && (
                    <div className="w-full max-w-xs aspect-video bg-black rounded-lg overflow-hidden border border-stone-200">
                      <video src={video1Url} controls className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* VIDEO 2 */}
                <div className="p-4 bg-stone-50 rounded-xl space-y-4 border border-stone-200/60">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Bloque de Video 2</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Título / Leyenda del Video</label>
                      <input value={video2Titulo} onChange={(e) => setVideo2Titulo(e.target.value)} className="w-full p-3 border border-stone-200 bg-white rounded-lg text-sm font-semibold" placeholder="Ej. El Arte de la Aguja" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Archivo de Video (Directo o URL)</label>
                      <div className="flex gap-2">
                        <input value={video2Url} onChange={(e) => setVideo2Url(e.target.value)} className="flex-1 p-3 border border-stone-200 bg-white rounded-lg text-sm" placeholder="O pega un enlace de video..." />
                        <label className="flex items-center justify-center bg-stone-900 hover:bg-stone-800 text-white p-3 rounded-lg cursor-pointer transition-all">
                          {subiendoVideo[2] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                          <input type="file" accept="video/*" disabled={subiendoVideo[2]} className="hidden" onChange={(e) => handleSubirVideo(e, 2)} />
                        </label>
                      </div>
                    </div>
                  </div>
                  {video2Url && (
                    <div className="w-full max-w-xs aspect-video bg-black rounded-lg overflow-hidden border border-stone-200">
                      <video src={video2Url} controls className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* VIDEO 3 */}
                <div className="p-4 bg-stone-50 rounded-xl space-y-4 border border-stone-200/60">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Bloque de Video 3</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Título / Leyenda del Video</label>
                      <input value={video3Titulo} onChange={(e) => setVideo3Titulo(e.target.value)} className="w-full p-3 border border-stone-200 bg-white rounded-lg text-sm font-semibold" placeholder="Ej. Acabados de Alta Costura" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Archivo de Video (Directo o URL)</label>
                      <div className="flex gap-2">
                        <input value={video3Url} onChange={(e) => setVideo3Url(e.target.value)} className="flex-1 p-3 border border-stone-200 bg-white rounded-lg text-sm" placeholder="O pega un enlace de video..." />
                        <label className="flex items-center justify-center bg-stone-900 hover:bg-stone-800 text-white p-3 rounded-lg cursor-pointer transition-all">
                          {subiendoVideo[3] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                          <input type="file" accept="video/*" disabled={subiendoVideo[3]} className="hidden" onChange={(e) => handleSubirVideo(e, 3)} />
                        </label>
                      </div>
                    </div>
                  </div>
                  {video3Url && (
                    <div className="w-full max-w-xs aspect-video bg-black rounded-lg overflow-hidden border border-stone-200">
                      <video src={video3Url} controls className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* SECCIÓN 3: CREACIONES ÚNICAS */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => toggleSeccion("creaciones")}
              className="w-full flex justify-between items-center p-5 bg-stone-50 hover:bg-stone-100/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-stone-500" />
                <span className="font-serif italic text-stone-800 text-lg">Sección "Creaciones Únicas"</span>
              </div>
              {seccionAbierta === "creaciones" ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {seccionAbierta === "creaciones" && (
              <div className="p-6 space-y-6 border-t border-stone-100">
                
                {/* Título y Descripción */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Título de la Sección</label>
                    <input 
                      value={creacionesTitulo} 
                      onChange={(e) => setCreacionesTitulo(e.target.value)} 
                      className="w-full p-3 border border-stone-200 rounded-lg text-sm font-semibold" 
                      placeholder="CREACIONES ÚNICAS" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Descripción Detallada</label>
                    <textarea 
                      value={creacionesDesc} 
                      onChange={(e) => setCreacionesDesc(e.target.value)} 
                      rows={4} 
                      className="w-full p-3 border border-stone-200 rounded-lg text-sm resize-none" 
                    />
                  </div>
                </div>

                {/* Carga e Previsualización de la Imagen */}
                {/* IMAGEN DE CREACIONES ÚNICAS (Estilo Hero) */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400">
                    Imagen Lateral Destacada
                  </label>

                  <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-200/80 flex flex-col md:flex-row items-center gap-6">
                    {/* Miniatura de la Imagen */}
                    <div className="relative w-full md:w-48 h-32 bg-stone-200 rounded-xl overflow-hidden shrink-0 border border-stone-300/60 shadow-inner">
                      {creacionesImagen ? (
                        <img
                          src={creacionesImagen}
                          alt="Vista previa Creaciones Únicas"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 text-xs text-center p-2">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span>Sin imagen</span>
                        </div>
                      )}
                    </div>

                    {/* Descripción y Botón de Subida */}
                    <div className="space-y-3 flex-1 text-center md:text-left">
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Sube una imagen de alta calidad para destacar la artesanía. Se recomiendan formatos verticales o cuadrados.
                      </p>

                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <label className="cursor-pointer bg-white text-stone-800 border border-stone-200 hover:bg-stone-50 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-2">
                          <svg className="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          {subiendoImgCreaciones ? "Subiendo..." : "Seleccionar Imagen"}
                          
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleSubirImagenCreaciones}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Input opcional por si prefieres pegar una URL directa */}
                  <input 
                    type="text"
                    value={creacionesImagen} 
                    onChange={(e) => setCreacionesImagen(e.target.value)} 
                    placeholder="O pega la URL de la imagen aquí..."
                    className="w-full p-2.5 border border-stone-200 rounded-lg text-xs text-stone-600 focus:outline-none focus:border-stone-400 mt-2" 
                  />
                </div>

                {/* Insignias / Badges Inferiores */}
                <div className="pt-2 border-t border-stone-100">
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-3">Insignias Destacadas (Pie de sección)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Badge 1 */}
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
                      <span className="text-[10px] font-bold text-stone-500 block">Insignia 1</span>
                      <input value={badge1Titulo} onChange={(e) => setBadge1Titulo(e.target.value)} className="w-full p-2 border border-stone-200 rounded bg-white text-xs font-bold" placeholder="Ej. 100%" />
                      <input value={badge1Subtitulo} onChange={(e) => setBadge1Subtitulo(e.target.value)} className="w-full p-2 border border-stone-200 rounded bg-white text-xs" placeholder="Ej. HECHO A MANO" />
                    </div>

                    {/* Badge 2 */}
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2">
                      <span className="text-[10px] font-bold text-stone-500 block">Insignia 2</span>
                      <input value={badge2Titulo} onChange={(e) => setBadge2Titulo(e.target.value)} className="w-full p-2 border border-stone-200 rounded bg-white text-xs font-bold" placeholder="Ej. Sustentable" />
                      <input value={badge2Subtitulo} onChange={(e) => setBadge2Subtitulo(e.target.value)} className="w-full p-2 border border-stone-200 rounded bg-white text-xs" placeholder="Ej. FIBRAS NATURALES" />
                    </div>

                  </div>
                </div>

              </div>
            )}
          </div>

          {/* SECCIÓN 4: EXPERIENCIAS DE LAS CLIENTAS */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => toggleSeccion("testimonios")}
              className="w-full flex justify-between items-center p-5 bg-stone-50 hover:bg-stone-100/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Quote className="w-5 h-5 text-stone-500" />
                <span className="font-serif italic text-stone-800 text-lg">Sección "Experiencias de Clientas"</span>
              </div>
              {seccionAbierta === "testimonios" ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {seccionAbierta === "testimonios" && (
              <div className="p-6 space-y-6 border-t border-stone-100">
                <div className="p-4 bg-stone-50 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Testimonio 1</span>
                  <input value={testimonio1Nombre} onChange={(e) => setTestimonio1Nombre(e.target.value)} className="w-full p-3 border border-stone-200 bg-white rounded-lg text-sm" placeholder="Nombre de la clienta" />
                  <textarea value={testimonio1Comentario} onChange={(e) => setTestimonio1Comentario(e.target.value)} rows={2} className="w-full p-3 border border-stone-200 bg-white rounded-lg text-sm resize-none" placeholder="Su comentario..." />
                </div>
                <div className="p-4 bg-stone-50 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Testimonio 2</span>
                  <input value={testimonio2Nombre} onChange={(e) => setTestimonio2Nombre(e.target.value)} className="w-full p-3 border border-stone-200 bg-white rounded-lg text-sm" placeholder="Nombre de la clienta" />
                  <textarea value={testimonio2Comentario} onChange={(e) => setTestimonio2Comentario(e.target.value)} rows={2} className="w-full p-3 border border-stone-200 bg-white rounded-lg text-sm resize-none" placeholder="Su comentario..." />
                </div>
                <div className="p-4 bg-stone-50 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Testimonio 3</span>
                  <input value={testimonio3Nombre} onChange={(e) => setTestimonio3Nombre(e.target.value)} className="w-full p-3 border border-stone-200 bg-white rounded-lg text-sm" placeholder="Nombre de la clienta" />
                  <textarea value={testimonio3Comentario} onChange={(e) => setTestimonio3Comentario(e.target.value)} rows={2} className="w-full p-3 border border-stone-200 bg-white rounded-lg text-sm resize-none" placeholder="Su comentario..." />
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* CONTENIDO DE PÁGINA DE NOSOTROS */}
      {pestanaActiva === "nosotros" && (
        <div className="space-y-4">

          {/* 1. SECCIÓN HERO (PORTADA NOSOTROS) */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSeccionNosotros("hero")}
              className="w-full p-5 flex items-center justify-between bg-white hover:bg-stone-50/80 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="font-serif italic text-stone-800 text-lg">
                  1. Sección Hero (Encabezado Principal)
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${
                  seccionAbiertaNosotros === "hero" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {seccionAbiertaNosotros === "hero" && (
              <div className="p-6 pt-2 border-t border-stone-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                      Subtítulo Superior
                    </label>
                    <input
                      type="text"
                      value={nosotrosHeroSub}
                      onChange={(e) => setNosotrosHeroSub(e.target.value)}
                      placeholder="Ej. NUESTRO ORIGEN Y PASIÓN"
                      className="w-full p-3 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                      Título Principal
                    </label>
                    <input
                      type="text"
                      value={nosotrosHeroTitulo}
                      onChange={(e) => setNosotrosHeroTitulo(e.target.value)}
                      placeholder="Ej. Bordados Ermy"
                      className="w-full p-3 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-stone-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                    Lema / Frase Destacada
                  </label>
                  <textarea
                    rows={2}
                    value={nosotrosHeroLema}
                    onChange={(e) => setNosotrosHeroLema(e.target.value)}
                    placeholder="Ej. Arte textil hecho a mano con tradición de Chilac..."
                    className="w-full p-3 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. SECCIÓN ¿QUIÉNES SOMOS? */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSeccionNosotros("quienes_somos")}
              className="w-full p-5 flex items-center justify-between bg-white hover:bg-stone-50/80 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="font-serif italic text-lg text-stone-800">
                  2. Sección "¿Quiénes Somos?"
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${
                  seccionAbiertaNosotros === "quienes_somos" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {seccionAbiertaNosotros === "quienes_somos" && (
              <div className="p-6 pt-2 border-t border-stone-100 space-y-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                    Título de la Sección
                  </label>
                  <input
                    type="text"
                    value={quienesSomosTitulo}
                    onChange={(e) => setQuienesSomosTitulo(e.target.value)}
                    className="w-full p-3 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                    Descripción Corta
                  </label>
                  <textarea
                    rows={3}
                    value={quienesSomosDesc}
                    onChange={(e) => setQuienesSomosDesc(e.target.value)}
                    className="w-full p-3 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-stone-400"
                  />
                </div>

                {/* Carga de Imagen de Quiénes Somos (Estilo Tarjeta) */}
                <div className="space-y-2 pt-2">
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400">
                    Imagen Ilustrativa
                  </label>
                  <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-200/80 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-full md:w-48 h-32 bg-stone-200 rounded-xl overflow-hidden shrink-0 border border-stone-300/60 shadow-inner">
                      {quienesSomosImagen ? (
                        <img src={quienesSomosImagen} alt="Quiénes Somos" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 text-xs text-center p-2">
                          <span>Sin imagen</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 flex-1 text-center md:text-left">
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Sube una foto del equipo o del taller.
                      </p>
                      <label className="cursor-pointer bg-white text-stone-800 border border-stone-200 hover:bg-stone-50 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-2">
                        <svg className="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {subiendoImgQuienes ? "Subiendo..." : "Seleccionar Imagen"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setSubiendoImgQuienes(true);
                            const fileName = `nosotros/quienes_${Date.now()}.${file.name.split('.').pop()}`;
                            const { data, error } = await supabase.storage.from('fotos-productos').upload(fileName, file);
                            if (!error && data) {
                              const { data: publicUrlData } = supabase.storage.from('fotos-productos').getPublicUrl(fileName);
                              setQuienesSomosImagen(publicUrlData.publicUrl);
                              toast.success("Imagen actualizada");
                            } else if (error) {
                              toast.error("Error al subir: " + error.message);
                            }
                            setSubiendoImgQuienes(false);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={quienesSomosImagen} 
                    onChange={(e) => setQuienesSomosImagen(e.target.value)} 
                    placeholder="O pega la URL de la imagen..."
                    className="w-full p-2.5 border border-stone-200 rounded-lg text-xs text-stone-600 focus:outline-none focus:border-stone-400" 
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. SECCIÓN NUESTRO LEGADO Y MÉTRICAS */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSeccionNosotros("legado")}
              className="w-full p-5 flex items-center justify-between bg-white hover:bg-stone-50/80 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="font-serif italic text-lg text-stone-800">
                  3. Sección "Nuestro Legado y Métricas"
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${
                  seccionAbiertaNosotros === "legado" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {seccionAbiertaNosotros === "legado" && (
              <div className="p-6 pt-2 border-t border-stone-100 space-y-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                    Título de Legado
                  </label>
                  <input
                    type="text"
                    value={legadoTitulo}
                    onChange={(e) => setLegadoTitulo(e.target.value)}
                    className="w-full p-3 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                    Historia / Historia de Legado
                  </label>
                  <textarea
                    rows={4}
                    value={legadoDesc}
                    onChange={(e) => setLegadoDesc(e.target.value)}
                    className="w-full p-3 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-stone-400"
                  />
                </div>

                {/* Imagen de Legado */}
                <div className="space-y-2 pt-2">
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400">
                    Imagen de Legado
                  </label>
                  <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-200/80 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-full md:w-48 h-32 bg-stone-200 rounded-xl overflow-hidden shrink-0 border border-stone-300/60 shadow-inner">
                      {legadoImagen ? (
                        <img src={legadoImagen} alt="Legado" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 text-xs text-center p-2">
                          <span>Sin imagen</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 flex-1 text-center md:text-left">
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Sube una foto representativa de la historia o proceso artesanal.
                      </p>
                      <label className="cursor-pointer bg-white text-stone-800 border border-stone-200 hover:bg-stone-50 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-2">
                        <svg className="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {subiendoImgLegado ? "Subiendo..." : "Seleccionar Imagen"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setSubiendoImgLegado(true);
                            const fileName = `nosotros/legado_${Date.now()}.${file.name.split('.').pop()}`;
                            const { data, error } = await supabase.storage.from('fotos-productos').upload(fileName, file);
                            if (!error && data) {
                              const { data: publicUrlData } = supabase.storage.from('fotos-productos').getPublicUrl(fileName);
                              setLegadoImagen(publicUrlData.publicUrl);
                              toast.success("Imagen de Legado actualizada");
                            } else if (error) {
                              toast.error("Error al subir: " + error.message);
                            }
                            setSubiendoImgLegado(false);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    value={legadoImagen} 
                    onChange={(e) => setLegadoImagen(e.target.value)} 
                    placeholder="O pega la URL de la imagen..."
                    className="w-full p-2.5 border border-stone-200 rounded-lg text-xs text-stone-600 focus:outline-none focus:border-stone-400" 
                  />
                </div>

                {/* Contadores / Números Destacados */}
                <div className="pt-4 border-t border-stone-100">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-3">
                    Métricas / Números de Impacto
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 space-y-2">
                      <input
                        type="text"
                        value={num1Val}
                        onChange={(e) => setNum1Val(e.target.value)}
                        placeholder="Ej. +15"
                        className="w-full p-2 border border-stone-200 rounded-lg text-xs font-bold text-stone-800"
                      />
                      <input
                        type="text"
                        value={num1Tag}
                        onChange={(e) => setNum1Tag(e.target.value)}
                        placeholder="Ej. Años de Experiencia"
                        className="w-full p-2 border border-stone-200 rounded-lg text-xs text-stone-600"
                      />
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 space-y-2">
                      <input
                        type="text"
                        value={num2Val}
                        onChange={(e) => setNum2Val(e.target.value)}
                        placeholder="Ej. 100%"
                        className="w-full p-2 border border-stone-200 rounded-lg text-xs font-bold text-stone-800"
                      />
                      <input
                        type="text"
                        value={num2Tag}
                        onChange={(e) => setNum2Tag(e.target.value)}
                        placeholder="Ej. Artesanal y Hecho a Mano"
                        className="w-full p-2 border border-stone-200 rounded-lg text-xs text-stone-600"
                      />
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 space-y-2">
                      <input
                        type="text"
                        value={num3Val}
                        onChange={(e) => setNum3Val(e.target.value)}
                        placeholder="Ej. +1000"
                        className="w-full p-2 border border-stone-200 rounded-lg text-xs font-bold text-stone-800"
                      />
                      <input
                        type="text"
                        value={num3Tag}
                        onChange={(e) => setNum3Tag(e.target.value)}
                        placeholder="Ej. Prendas Bordadas"
                        className="w-full p-2 border border-stone-200 rounded-lg text-xs text-stone-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. SECCIÓN MISIÓN Y VISIÓN */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSeccionNosotros("mision_vision")}
              className="w-full p-5 flex items-center justify-between bg-white hover:bg-stone-50/80 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="font-serif italic text-lg text-stone-800">
                  4. Misión y Visión
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${
                  seccionAbiertaNosotros === "mision_vision" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {seccionAbiertaNosotros === "mision_vision" && (
              <div className="p-6 pt-2 border-t border-stone-100 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                      Misión
                    </label>
                    <textarea
                      rows={4}
                      value={misionDesc}
                      onChange={(e) => setMisionDesc(e.target.value)}
                      placeholder="Preservar y difundir el arte textil..."
                      className="w-full p-3 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                      Visión
                    </label>
                    <textarea
                      rows={4}
                      value={visionDesc}
                      onChange={(e) => setVisionDesc(e.target.value)}
                      placeholder="Ser reconocidos a nivel nacional e internacional..."
                      className="w-full p-3 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-stone-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. SECCIÓN CITA / FRASE DE CIERRE */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSeccionNosotros("cierre")}
              className="w-full p-5 flex items-center justify-between bg-white hover:bg-stone-50/80 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="font-serif italic text-lg text-stone-800">
                  5. Frase de Cierre (Cita Final)
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${
                  seccionAbiertaNosotros === "cierre" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {seccionAbiertaNosotros === "cierre" && (
              <div className="p-6 pt-2 border-t border-stone-100 space-y-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                    Cita o Frase Emblemática
                  </label>
                  <textarea
                    rows={3}
                    value={cierreCita}
                    onChange={(e) => setCierreCita(e.target.value)}
                    placeholder='Ej. "Cada puntada cuenta una historia de nuestra identidad."'
                    className="w-full p-3 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:border-stone-400 font-serif italic text-base"
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* BOTÓN GENERAL DE GUARDADO */}
      <button
          type="submit"
          disabled={!hayCambios || loading}
          className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer ${
            hayCambios && !loading
              ? "bg-stone-900 text-white hover:bg-stone-800 shadow-md transform active:scale-95"
              : "bg-stone-200 text-stone-400 cursor-not-allowed opacity-70"
          }`}
      >
          {loading ? "Guardando..." : hayCambios ? "Guardar Cambios" : "Sin Cambios Pendientes"}
      </button>

    </form>
  );
}