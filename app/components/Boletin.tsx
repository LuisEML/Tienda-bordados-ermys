"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Check, Loader2, Send } from "lucide-react";

export default function Boletin() {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  // Reemplaza el handleSubmit dentro de tu componente por este:
  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes("@")) return;

        setCargando(true);
        setMensaje(null);

        try {
            const res = await fetch("/api/boletin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
            setMensaje({ tipo: "exito", texto: "🎉 ¡Gracias por unirte! Revisa tu correo." });
            setEmail("");
            } else {
            setMensaje({ tipo: "error", texto: data.error || "Ocurrió un error." });
            }
        } catch (err) {
            setMensaje({ tipo: "error", texto: "Error de conexión." });
        } finally {
            setCargando(false);
        }
  };

  return (
    <div className="w-full">
      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 text-artesano">Boletín</h3>
      <p className="text-xs text-stone-400 mb-4 font-serif italic">Únete a nuestra comunidad artesana</p>

      {mensaje?.tipo === "exito" ? (
        <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-xl animate-fade-in">
          <Check size={16} />
          <span>{mensaje.texto}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative flex items-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={cargando}
              className="w-full bg-stone-800/80 border border-stone-700 text-stone-100 placeholder:text-stone-500 text-xs rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-stone-400 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={cargando}
              className="absolute right-2 p-1.5 bg-stone-200 text-stone-900 hover:bg-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              title="Unirse"
            >
              {cargando ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
          {mensaje?.tipo === "error" && (
            <p className="text-[11px] text-red-400 font-medium">⚠️ {mensaje.texto}</p>
          )}
        </form>
      )}
    </div>
  );
}