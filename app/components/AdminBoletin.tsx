"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminBoletin() {
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [notificacion, setNotificacion] = useState<{
    tipo: "exito" | "error";
    texto: string;
  } | null>(null);

  const handleEnviarCampana = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!asunto.trim() || !mensaje.trim()) {
      setNotificacion({
        tipo: "error",
        texto: "Escribe un asunto y un mensaje antes de enviar.",
      });
      return;
    }

    const confirmar = confirm(
      `¿Estás seguro de enviar este correo a todos los suscriptores?`
    );
    if (!confirmar) return;

    setEnviando(true);
    setNotificacion(null);

    try {
      const res = await fetch("/api/campanas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asunto, mensaje }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotificacion({
          tipo: "exito",
          texto: `🎉 ¡Campaña enviada con éxito a ${data.totalEnviados} suscriptores!`,
        });
        setAsunto("");
        setMensaje("");
      } else {
        setNotificacion({
          tipo: "error",
          texto: data.error || "Ocurrió un error al enviar.",
        });
      }
    } catch (err) {
      setNotificacion({
        tipo: "error",
        texto: "Error de conexión con el servidor.",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-2xl text-stone-100 shadow-xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white tracking-wide">
          Enviar Campaña Promocional
        </h2>
        <p className="text-xs text-stone-400 mt-1">
          Redacta el mensaje que recibirán todos los usuarios registrados en el boletín.
        </p>
      </div>

      <form onSubmit={handleEnviarCampana} className="space-y-4">
        {/* Campo Asunto */}
        <div>
          <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
            Asunto del Correo
          </label>
          <input
            type="text"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="Ej: 🔥 20% de descuento en nueva colección"
            disabled={enviando}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-stone-400 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Campo Mensaje */}
        <div>
          <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
            Mensaje / Contenido
          </label>
          <textarea
            rows={6}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe aquí el contenido de la promoción o anuncio..."
            disabled={enviando}
            className="w-full bg-stone-800 border border-stone-700 rounded-xl p-4 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-stone-400 transition-colors resize-none disabled:opacity-50"
          />
        </div>

        {/* Mensajes de Notificación */}
        {notificacion && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              notificacion.tipo === "exito"
                ? "bg-emerald-950/60 border border-emerald-800 text-emerald-300"
                : "bg-red-950/60 border border-red-800 text-red-300"
            }`}
          >
            {notificacion.tipo === "exito" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{notificacion.texto}</span>
          </div>
        )}

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-stone-100 hover:bg-white text-stone-900 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {enviando ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Enviando correos...
            </>
          ) : (
            <>
              <Send size={15} />
              Enviar a todos los suscriptores
            </>
          )}
        </button>
      </form>
    </div>
  );
}