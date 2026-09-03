"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Mail, Download, Trash2, Search, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Suscriptor {
  id: string;
  email: string;
  created_at: string;
}

export default function TablaSuscriptores() {
  const [suscriptores, setSuscriptores] = useState<Suscriptor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const cargarSuscriptores = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("suscriptores")
      .select("id, email, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar la lista de suscriptores");
    } else if (data) {
      setSuscriptores(data);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarSuscriptores();
  }, []);

  const eliminarSuscriptor = async (id: string) => {
    if (!confirm("¿Deseas eliminar este correo de la lista?")) return;

    const { error } = await supabase.from("suscriptores").delete().eq("id", id);

    if (error) {
      toast.error("No se pudo eliminar el suscriptor");
    } else {
      setSuscriptores((prev) => prev.filter((s) => s.id !== id));
      toast.success("Suscriptor eliminado correctamente");
    }
  };

  const exportarCSV = () => {
    if (suscriptores.length === 0) {
      toast.error("No hay suscriptores para exportar");
      return;
    }

    const headers = ["ID", "Email", "Fecha de Registro"];
    const filas = suscriptores.map((s) => [
      s.id,
      `"${s.email}"`,
      `"${new Date(s.created_at).toLocaleDateString("es-MX")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...filas.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Suscriptores_Boletin_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const suscriptoresFiltrados = suscriptores.filter((s) =>
    s.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ENCABEZADO Y EXPORTAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Suscriptores del Boletín</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Total de registros: <span className="font-bold text-stone-800">{suscriptores.length}</span>
          </p>
        </div>

        <button
          onClick={exportarCSV}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm cursor-pointer"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>Exportar a Excel (CSV)</span>
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-stone-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 transition-all shadow-sm"
        />
      </div>

      {/* TABLA DE RESULTADOS */}
      {cargando ? (
        <div className="py-12 text-center text-xs font-bold text-stone-400">
          Cargando suscriptores...
        </div>
      ) : suscriptoresFiltrados.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Correo Electrónico
                </th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Fecha de Registro
                </th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {suscriptoresFiltrados.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-4 flex items-center gap-2 text-xs font-bold text-stone-700">
                    <Mail className="w-4 h-4 text-stone-400" />
                    {s.email}
                  </td>
                  <td className="p-4 text-xs text-stone-500">
                    {new Date(s.created_at).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => eliminarSuscriptor(s.id)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar suscriptor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
          <Mail className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-stone-500 text-sm font-medium">
            No se encontraron correos suscritos.
          </p>
        </div>
      )}
    </div>
  );
}