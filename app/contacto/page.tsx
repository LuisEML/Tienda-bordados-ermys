"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react"; 
import { FaInstagram, FaFacebookF, FaWhatsapp, FaEnvelope, FaMapPin } from "react-icons/fa6";
import { Typewriter } from "../components/Typewriter";


export default function ContactoMejorado() {
  // --- ESTADO DEL FORMULARIO ---
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    interes: "Pedido Personalizado",
    metodoContacto: "WhatsApp",
    mensaje: ""
  });

  const [telefonoError, setTelefonoError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nombreError, setNombreError] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // --- MANEJADOR DE CAMBIOS ---
  // 2. Modifica el handleChange para filtrar la entrada del teléfono en tiempo real
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;


    // Limpiar error de nombre al escribir
    if (name === "nombre") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (value.trim().length > 0) setNombreError("");
      return;
    }

    // Limpiar error de mensaje al escribir
    if (name === "mensaje") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (value.trim().length > 0) setMensajeError("");
      return;
    }

    if (name === "telefono") {
      // Expresión regular que permite SOLO números
      const soloNumeros = value.replace(/\D/g, "");
      
      // Limitamos a un máximo de 10 dígitos
      if (soloNumeros.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: soloNumeros }));
      }
      
      // Limpiamos el error si el usuario ya completó los 10 dígitos
      if (soloNumeros.length === 10) {
        setTelefonoError("");
      }
      return;
    }

    // NUEVO: Limpiar el error del email en tiempo real si el formato ya es correcto
    if (name === "email") {
      // Eliminamos espacios internos o accidentales para la evaluación limpia
      const valorLimpio = value.replace(/\s/g, "");
      setFormData((prev) => ({ ...prev, [name]: valorLimpio }));      
      
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailRegex.test(valorLimpio)) {
        setEmailError(""); // Quita el color rojo si ya es válido
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- FUNCIÓN DE ENVÍO ---
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Limpiamos errores previos
  setNombreError("");
  setEmailError("");
  setTelefonoError("");
  setMensajeError("");

  // A) VALIDACIÓN DEL NOMBRE (NUEVA)
  if (!formData.nombre.trim()) {
    setNombreError("Por favor, ingresa tu nombre completo.");
    document.getElementById("nombre-field")?.scrollIntoView({ behavior: "smooth" });
    return; // Detiene el envío
  }
  
  // Validamos que tenga exactamente 10 dígitos
  if (formData.telefono.length !== 10) {
    setTelefonoError("El número telefónico debe tener exactamente 10 dígitos.");
    // Hacemos scroll sutil hacia el campo del error para que el usuario lo note
    document.getElementById("telefono-field")?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // D) VALIDACIÓN DEL MENSAJE / HISTORIA (NUEVA)
  if (!formData.mensaje.trim()) {
    setMensajeError("Cuéntanos un poco sobre la idea o pieza que tienes en mente.");
    document.getElementById("mensaje-field")?.scrollIntoView({ behavior: "smooth" });
    return;
  }

  // NUEVO: VALIDACIÓN DE CORREO ELECTRÓNICO
  // Esta expresión regular verifica que tenga estructura de correo: texto + @ + texto + . + texto
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Limpiamos espacios que el usuario o el autocorrector pongan al inicio/final
  const correoLimpio = formData.email.trim();

  if (!emailRegex.test(correoLimpio)) {
    setEmailError("Por favor, ingresa un correo electrónico válido."); 
    // Hace que la pantalla baje suavemente al input del correo para que lo corrijan
    document.getElementById("email-field")?.scrollIntoView({ behavior: "smooth" });
    return; // 🛑 ¡CRUCIAL! Este return detiene por completo la ejecución. Si falta, el formulario se envía.
  }
   

  setIsSubmitting(true);
  setStatus("idle");

  try {
    const res = await fetch("/api/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error("Error en el servidor");

    setStatus("success");
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      interes: "Pedido Personalizado",
      metodoContacto: "WhatsApp",
      mensaje: ""
    });
  } catch (error) {
    console.error(error);
    setStatus("error");
  } finally {
    setIsSubmitting(false);
  }
};

const prevenirEnter = (e: React.KeyboardEvent) => {
  // Si la tecla presionada es Enter, bloqueamos su comportamiento predeterminado
  if (e.key === "Enter") {
    e.preventDefault();
  }
};

  // --- ANIMACIONES ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  // Tipamos la variable explícitamente como Variants
const fadeInVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.7, 
      ease: "easeOut" // Ahora TypeScript sabe que es un tipo Easing válido
    } 
  }
};


  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 py-24 px-4 md:px-16">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* --- CABECERA CLARA --- */}
        <motion.header variants={fadeInVariants} className="mb-20 px-2">
          <h1 className="font-serif text-5xl md:text-8xl italic text-stone-800 leading-none tracking-tight">
            <Typewriter text="Próximo" speed={80} delay={200} showCursor={false}/>
            <br />
            <span className="text-stone-900 not-italic font-sans font-bold"><Typewriter text="bordado." speed={80} delay={1000} showCursor={false} /></span>
          </h1>
          <p className="text-stone-500 max-w-lg mt-6 text-sm leading-relaxed">
            <Typewriter text="¿Tienes una idea en mente para una pieza única? Estaremos encantados de escucharte y darle vida a tu visión en nuestro taller." speed={70} delay={1800} showCursor={false}/>            
          </p>
        </motion.header>

        <div className="grid md:grid-cols-12 gap-12 md:gap-20">
          
          {/* --- INFO LATERAL --- */}
          <motion.aside variants={containerVariants} className="md:col-span-4 space-y-8">
            
            {/* Redes Sociales */}
            <div className="bg-white p-8 rounded-2xl border border-stone-200/60 shadow-xs">
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-6">Contáctanos en Redes</p>
              <div className="flex gap-4 items-center">
                <a href="#" className="hover:scale-105 hover:bg-stone-900 hover:text-white transition-all p-3 bg-stone-100 rounded-xl text-stone-600" aria-label="Instagram">
                  <FaInstagram size={18} />
                </a>
                <a href="#" className="hover:scale-105 hover:bg-stone-900 hover:text-white transition-all p-3 bg-stone-100 rounded-xl text-stone-600" aria-label="Facebook">
                  <FaFacebookF size={16} />
                </a>
                <a href="#" className="hover:scale-105 hover:bg-stone-900 hover:text-white transition-all p-3 bg-stone-100 rounded-xl text-stone-600" aria-label="WhatsApp">
                  <FaWhatsapp size={18} />
                </a>
              </div>
            </div>

            {/* Ubicación */}
            <div className="bg-white p-8 rounded-2xl border border-stone-200/60 shadow-xs flex items-start gap-4">
              <FaMapPin className="text-stone-700 w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">El Taller</p>
                <p className="text-sm font-serif text-stone-800 leading-relaxed">
                  C. Reforma 51, Segunda, 75883 <br /> San Gabriel Chilac, Pue.​
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 text-stone-400 pt-4 px-2">
              <FaEnvelope size={13} />
              <p className="text-xs font-medium italic tracking-wide text-stone-500">hola@bordadosermy.com</p>
            </div>
          </motion.aside>

          {/* --- EL FORMULARIO (Manejado por estados) --- */}
          <motion.div variants={containerVariants} className="md:col-span-8">
            <form onSubmit={handleSubmit} noValidate onKeyDown={prevenirEnter} className="space-y-6">
              
              {/* Mensaje de éxito */}
              {status === "success" && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-xs"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="text-sm font-medium">¡Solicitud enviada con éxito! Nos pondremos en contacto contigo muy pronto.</p>
                </motion.div>
              )}

              {/* Mensaje de error */}
              {status === "error" && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-medium"
                >
                  Hubo un error al enviar tu mensaje. Por favor, vuelve a intentarlo o escríbenos directamente por redes.
                </motion.div>
              )}
              
              {/* 01. Nombre */}
              {/* 01. Nombre Completo con Validación */}
            <div 
              id="nombre-field"
              className={`p-5 bg-white rounded-2xl border transition-all shadow-2xs ${
                nombreError 
                  ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/5" 
                  : "border-stone-200/60 focus-within:border-stone-800 focus-within:ring-4 focus-within:ring-stone-800/5"
              }`}
            >
              <label className={`block text-[9px] uppercase tracking-[0.25em] font-bold mb-1.5 transition-colors ${
                nombreError ? "text-rose-500" : "text-stone-400"
              }`}>
                01. Nombre completo
              </label>
              <input 
                type="text" 
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full bg-transparent p-0 text-lg font-medium focus:outline-none text-stone-800 font-serif placeholder:text-stone-300"
                placeholder="Tu nombre y apellido..."
              />
              <AnimatePresence>
                {nombreError && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[11px] text-rose-600 font-medium mt-2 italic"
                  >
                    {nombreError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

              {/* Fila de Email y Teléfono */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* 02. Email */}
                {/* 02. Correo Electrónico con Validación en Rojo */}
              <div 
                  id="email-field"
                  className={`p-5 bg-white rounded-2xl border transition-all shadow-2xs ${
                    emailError 
                      ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/5" 
                      : "border-stone-200/60 focus-within:border-stone-800 focus-within:ring-4 focus-within:ring-stone-800/5"
                  }`}
                >
                  <label className={`block text-[9px] uppercase tracking-[0.25em] font-bold mb-1.5 transition-colors ${
                    emailError ? "text-rose-500" : "text-stone-400"
                  }`}>
                    02. Correo Electrónico
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent p-0 text-base font-medium focus:outline-none text-stone-800 placeholder:text-stone-300"
                    placeholder="ejemplo@correo.com"
                  />
                  
                  {/* Mensaje de error animado debajo del input */}
                  <AnimatePresence>
                    {emailError && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[11px] text-rose-600 font-medium mt-2 italic"
                      >
                        {emailError}
                      </motion.p>
                    )}
                  </AnimatePresence>
              </div>

                {/* 03. Teléfono / WhatsApp (NUEVO) */}
                {/* 03. Teléfono / WhatsApp con Validación */}
                <div 
                  id="telefono-field"
                  className={`p-5 bg-white rounded-2xl border transition-all shadow-2xs ${
                    telefonoError 
                      ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500/5" 
                      : "border-stone-200/60 focus-within:border-stone-800 focus-within:ring-stone-800/5"
                  }`}
                >
                  <label className={`block text-[9px] uppercase tracking-[0.25em] font-bold mb-1.5 transition-colors ${telefonoError ? "text-rose-500" : "text-stone-400"}`}>
                    03. Teléfono / WhatsApp
                  </label>
                  <input 
                    type="text" // Usamos text para controlar mejor el filtrado de caracteres
                    inputMode="numeric" // Abre el teclado numérico en celulares
                    name="telefono"
                    required
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full bg-transparent p-0 text-base font-medium focus:outline-none text-stone-800 placeholder:text-stone-300"
                    placeholder="Ej. 2381234567"
                  />
                  
                  {/* Mensaje de error dinámico */}
                  <AnimatePresence>
                    {telefonoError && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[11px] text-rose-600 font-medium mt-2 italic"
                      >
                        {telefonoError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Fila de Interés y Método de contacto */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* 04. ¿Qué buscas? */}
                <div className="p-5 bg-white rounded-2xl border border-stone-200/60 focus-within:border-stone-800 focus-within:ring-4 focus-within:ring-stone-800/5 transition-all shadow-2xs">
                  <label className="block text-[9px] uppercase tracking-[0.25em] text-stone-400 font-bold mb-1.5">
                    04. ¿Qué buscas?
                  </label>
                  <select 
                    name="interes"
                    value={formData.interes}
                    onChange={handleChange}
                    className="w-full bg-transparent p-0 text-base font-medium focus:outline-none text-stone-700 cursor-pointer"
                  >
                    <option value="Pedido Personalizado">Pedido Personalizado</option>
                    <option value="Catálogo Mayorista">Catálogo Mayorista</option>
                    <option value="Duda General">Duda General</option>
                  </select>
                </div>

                {/* 05. Preferencia de contacto (NUEVO) */}
                <div className="p-5 bg-white rounded-2xl border border-stone-200/60 focus-within:border-stone-800 focus-within:ring-4 focus-within:ring-stone-800/5 transition-all shadow-2xs">
                  <label className="block text-[9px] uppercase tracking-[0.25em] text-stone-400 font-bold mb-1.5">
                    05. ¿Cómo prefieres que te contactemos?
                  </label>
                  <select 
                    name="metodoContacto"
                    value={formData.metodoContacto}
                    onChange={handleChange}
                    className="w-full bg-transparent p-0 text-base font-medium focus:outline-none text-stone-700 cursor-pointer"
                  >
                    <option value="WhatsApp">Prefiero WhatsApp</option>
                    <option value="Llamada">Prefiero Llamada telefónica</option>
                    <option value="Email">Prefiero Correo Electrónico</option>
                  </select>
                </div>
              </div>

              {/* 06. Mensaje */}
              {/* 06. Tu historia / idea con Validación */}
              <div 
                id="mensaje-field"
                className={`p-5 bg-white rounded-2xl border transition-all shadow-2xs ${
                  mensajeError 
                    ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/5" 
                    : "border-stone-200/60 focus-within:border-stone-800 focus-within:ring-4 focus-within:ring-stone-800/5"
                }`}
              >
                <label className={`block text-[9px] uppercase tracking-[0.25em] font-bold mb-1.5 transition-colors ${
                  mensajeError ? "text-rose-500" : "text-stone-400"
                }`}>
                  06. Tu historia / idea
                </label>
                <textarea 
                  name="mensaje"
                  rows={4}
                  required
                  value={formData.mensaje}
                  onChange={handleChange}
                  className="w-full bg-transparent p-0 text-base font-medium focus:outline-none text-stone-800 resize-none placeholder:text-stone-300"
                  placeholder="Cuéntanos los detalles de tu próximo bordado (colores, prendas, cantidades)..."
                />
                <AnimatePresence>
                  {mensajeError && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[11px] text-rose-600 font-medium mt-2 italic"
                    >
                      {mensajeError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Botón de envío */}
              <div className="flex justify-end pt-4">
                <motion.button 
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.4em] font-bold bg-stone-800 text-white px-10 py-4.5 rounded-xl shadow-xs hover:bg-stone-700 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      Enviando hilos...
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      Enviar solicitud 
                      <ArrowRight size={14} />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}