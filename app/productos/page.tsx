"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react"; 
import ModalFiltros from "@/app/components/ModalFiltros";
import Link from 'next/link';


export default function ProductosPage() {
  // --- 1. ESTADOS DE DATOS ---
  const [productos, setProductos] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [esMayoreo, setEsMayoreo] = useState(false);
  const [precioMax, setPrecioMax] = useState(5000); 
  const [tallasDisponibles, setTallasDisponibles] = useState<string[]>([]);
  const [coloresDisponibles, setColoresDisponibles] = useState<{color_nombre: string, color_hex: string}[]>([]);

  // --- 2. ESTADOS DE FILTROS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [talla, setTalla] = useState("");
  const [color, setColor] = useState("");
  const [categorias, setCategorias] = useState<any[]>([]); 
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  // --- ESTADOS PARA LA PAGINACIÓN ---
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 8; 

  // --- 3. FUNCIÓN DE CARGA ---
  const cargarProductos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('productos')
        .select(`
          *,
          categorias (nombre,id),
          variaciones!inner (
            talla,
            color_nombre,
            color_hex,
            stock
          )
        `)
        .gt('variaciones.stock', 0); 

        if (busqueda) {
          query = query.ilike('nombre', `%${busqueda}%`);
        }

        if (categoriaSeleccionada) {
          query = query.eq('categoria_id', categoriaSeleccionada);
        }

        const columnaPrecio = esMayoreo ? 'precio_mayoreo' : 'precio_menudeo';
        query = query.lte(columnaPrecio, precioMax);

      if (talla) {
        query = query.eq('variaciones.talla', talla);
      }

      if (color) {
        query = query.eq('variaciones.color_nombre', color);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error detallado de Supabase:", error.message);
        return;
      }

      setProductos(data || []);
      setPaginaActual(1); 
    } catch (error) {
      console.error("Error al obtener productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerCategorias = async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('id, nombre')
      .order('nombre', { ascending: true });

    if (error) {
      console.error("Error cargando categorías:", error.message);
    } else {
      setCategorias(data || []);
    }
  };

  // 💡 FILTROS DINÁMICOS PARALELOS OPTIMIZADOS
  const cargarFiltrosDinamicos = async () => {
    try {
      let queryTallas = supabase.from('variaciones').select('talla, productos!inner(categoria_id)').gt('stock', 0);
      if (categoriaSeleccionada) queryTallas = queryTallas.eq('productos.categoria_id', categoriaSeleccionada);

      let queryColores = supabase.from('variaciones').select('color_nombre, color_hex, productos!inner(categoria_id)').gt('stock', 0);
      if (categoriaSeleccionada) queryColores = queryColores.eq('productos.categoria_id', categoriaSeleccionada);
      if (talla) queryColores = queryColores.eq('talla', talla);

      const [resTallas, resColores] = await Promise.all([queryTallas, queryColores]);

      if (resTallas.data) {
        const tallas = Array.from(new Set(resTallas.data.map(v => v.talla))).filter(Boolean);
        setTallasDisponibles(tallas as string[]);
      }
      if (resColores.data) {
        const coloresUnicos = resColores.data.filter((v, index, self) =>
          index === self.findIndex((t) => t.color_nombre === v.color_nombre)
        );
        setColoresDisponibles(coloresUnicos);
      }
    } catch (err) {
      console.error("Error inesperado en filtros:", err);
    }
  };

  // --- 4. EFECTOS ---
  useEffect(()=> {
    obtenerCategorias();
  }, [])
  
  useEffect(() => {
    cargarProductos();
    cargarFiltrosDinamicos();
  }, [talla, color, precioMax, esMayoreo, busqueda, categoriaSeleccionada]);

  const limpiarFiltros = () => {
    setTalla("");
    setColor("");
    setPrecioMax(5000); 
    setBusqueda("");    
    setCategoriaSeleccionada(""); 
    setPaginaActual(1);
  };

  // 📊 MATEMÁTICA DE LA PAGINACIÓN
  const ultimoIndice = paginaActual * productosPorPagina;
  const primerIndice = ultimoIndice - productosPorPagina;
  const productosPaginados = productos.slice(primerIndice, ultimoIndice); 
  const totalPaginas = Math.ceil(productos.length / productosPorPagina);

  const cambiarPagina = (numeroPagina: number) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  };

  return (
    <main className="min-h-screen bg-stone-50 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* CABECERA RESPONSIVA */}
        <div className="flex flex-col gap-8 mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="font-serif text-4xl italic text-stone-800 tracking-wide">Bordados Ermy</h1>
              <p className="text-stone-500 text-sm mt-1">Piezas únicas hechas a mano</p>
            </div>

            {/* SWITCH DE MAYOREO */}
            <div className="flex items-center gap-2 bg-stone-200/60 p-1 rounded-full w-fit shadow-xs">
              <button
                onClick={() => setEsMayoreo(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all ${!esMayoreo ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}
              >
                MENUDEO
              </button>
              <button
                onClick={() => setEsMayoreo(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all ${esMayoreo ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
              >
                MAYOREO
              </button>
            </div>
          </div>

          {/* BARRA DE FILTROS */}
          <div className="flex overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 gap-4 snap-x scrollbar-none items-center w-full">
            <div className="min-w-[280px] md:min-w-0 md:flex-1 relative snap-center">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800/10 shadow-xs transition-all text-sm"
              />
              <svg className="absolute left-4 top-3.5 h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* OPCIÓN 1: SELECT CON AUTOLIMPIEZA INTEGRADA */}
            <div className="min-w-[200px] md:min-w-[220px] relative snap-center">
              <select
                value={categoriaSeleccionada}
                onChange={(e) => {
                  const valor = e.target.value;
                  setCategoriaSeleccionada(valor);
                  if (valor === "") {
                    limpiarFiltros(); // 💡 Si el usuario elige "Todas las Categorías", resetea los filtros avanzados automáticamente
                  }
                }}
                className="w-full bg-white border border-stone-200 rounded-2xl pl-5 pr-10 py-3 text-sm outline-none focus:border-stone-800 shadow-xs appearance-none cursor-pointer text-stone-600 font-medium"
              >
                <option value="">Todas las Categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-stone-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="min-w-[170px] md:min-w-0 flex items-center justify-center gap-2 bg-stone-800 text-white px-6 py-3 rounded-2xl hover:bg-stone-700 active:scale-98 transition-all shadow-sm snap-center cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Filtros Avanzados</span>
            </button>
          </div>

          {/* OPCIÓN 2: BARRITA VISUAL DE FILTROS ACTIVOS EN LA PANTALLA PRINCIPAL */}
          {(talla || color || categoriaSeleccionada || busqueda || precioMax < 5000) && (
            <div className="flex flex-wrap items-center gap-2 bg-stone-100/60 border border-stone-200/40 p-3 rounded-2xl transition-all">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 font-bold mr-1">Filtros:</span>
              
              {categoriaSeleccionada && (
                <span className="bg-white border border-stone-200 text-stone-700 px-3 py-1 rounded-xl text-xs font-medium shadow-2xs">
                  Categoría Activa
                </span>
              )}
              {talla && (
                <span className="bg-white border border-stone-200 text-stone-700 px-3 py-1 rounded-xl text-xs font-medium shadow-2xs">
                  Talla: {talla}
                </span>
              )}
              {color && (
                <span className="bg-white border border-stone-200 text-stone-700 px-3 py-1 rounded-xl text-xs font-medium shadow-2xs">
                  Color: {color}
                </span>
              )}
              {busqueda && (
                <span className="bg-white border border-stone-200 text-stone-700 px-3 py-1 rounded-xl text-xs font-medium shadow-2xs italic">
                  "{busqueda}"
                </span>
              )}
              {precioMax < 5000 && (
                <span className="bg-white border border-stone-200 text-stone-700 px-3 py-1 rounded-xl text-xs font-medium shadow-2xs">
                  Máx: ${precioMax}
                </span>
              )}

              <button
                onClick={limpiarFiltros}
                className="text-xs font-bold tracking-wider text-stone-800 uppercase border-b border-stone-800 pb-0.5 ml-auto hover:text-stone-500 hover:border-stone-500 transition-all cursor-pointer"
              >
                Limpiar todo
              </button>
            </div>
          )}
        </div>

        {/* MODAL DE FILTROS */}
        <ModalFiltros
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          talla={talla}
          setTalla={setTalla}
          color={color}
          setColor={setColor}
          precioMax={precioMax}
          setPrecioMax={setPrecioMax}
          opcionesTallas={tallasDisponibles}
          opcionesColores={coloresDisponibles}
          limpiarFiltros={limpiarFiltros}
        />

        {/* --- GRILLA DE PRODUCTOS --- */}
        {loading ? (
          <div className="text-center py-24 italic text-stone-400 font-serif text-lg">Buscando en el taller...</div>
        ) : productos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-200 max-w-xl mx-auto p-8 shadow-xs">
            <p className="text-stone-500 italic font-serif text-base">No encontramos piezas con esos filtros.</p>
            <button onClick={limpiarFiltros} className="mt-3 text-stone-800 font-bold tracking-wider text-xs uppercase border-b border-stone-800 pb-0.5 hover:text-stone-500 hover:border-stone-500 transition-colors">
              Ver todo el catálogo
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              <AnimatePresence mode="popLayout">
                {productosPaginados.map((prod) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={prod.id}
                    className="group flex flex-col"
                  >
                    <Link href={`/productos/${prod.id}`} className="text-[10px] font-bold uppercase tracking-widest text-stone-800 transition-all mb-1">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-100 mb-6 shadow-xs">
                        <img
                          src={prod.imagen_principal_url}
                          alt={prod.nombre}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-stone-700 shadow-2xs">
                          {prod.categorias?.nombre || 'Bordado'}
                        </div>
                      </div>

                      <div className="flex gap-1.5 mb-3 px-1">
                        {prod.variaciones.slice(0, 4).map((v:any, i:any) => (
                          <div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full border border-stone-200 shadow-2xs"
                            style={{ backgroundColor: v.color_hex }}
                            title={v.color_nombre}
                          />
                        ))}
                        {prod.variaciones.length > 4 && (
                          <span className="text-[9px] text-stone-400 font-medium ml-1">+{prod.variaciones.length - 4}</span>
                        )}
                      </div>

                      <div className="px-1 flex-1 flex flex-col justify-between gap-3">
                        <div>
                          <h3 className="font-serif line-clamp-1 text-lg text-stone-800 tracking-wide mb-1 group-hover:text-stone-600 transition-colors">
                            {prod.nombre}
                          </h3>
                        </div>

                        <div className="flex justify-between items-end pt-1">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">
                              {esMayoreo ? "Precio Mayoreo" : "Precio Menudeo"}
                            </span>

                            <AnimatePresence mode="wait">
                              <motion.p
                                key={esMayoreo ? 'm' : 'p'}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                className="font-serif text-xl md:text-2xl text-stone-900 font-medium"
                              >
                                ${esMayoreo ? prod.precio_mayoreo : prod.precio_menudeo}
                              </motion.p>
                            </AnimatePresence>

                            {esMayoreo && (
                              <p className="text-[9px] text-stone-500 italic mt-0.5">
                                * Mín. {prod.cantidad_minima_mayoreo || 12} pzas
                              </p>
                            )}
                          </div>
                          Ver detalle
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* CONTROLES DE PAGINACIÓN */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16 border-t border-stone-200/60 pt-8">
                <button
                  disabled={paginaActual === 1}
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  className="p-2 border border-stone-200 rounded-xl bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-stone-600 transition-all cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => cambiarPagina(num)}
                      className={`w-8 h-8 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                        paginaActual === num
                          ? "bg-stone-900 text-white shadow-sm font-bold"
                          : "bg-white border border-stone-100 text-stone-500 hover:bg-stone-50 hover:text-stone-800"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  disabled={paginaActual === totalPaginas}
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  className="p-2 border border-stone-200 rounded-xl bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-stone-600 transition-all cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}