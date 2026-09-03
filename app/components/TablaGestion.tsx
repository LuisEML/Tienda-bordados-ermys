"use client";
import React, { useEffect, useState } from "react";
import {
  Edit3,
  Save,
  X,
  Package,
  Users,
  Download,
  Trash2,
  Search,
  Mail,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  CheckCircle,
  Camera,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  MessageSquare,
  ShoppingBag
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { generarEnlaceWhatsApp } from "@/lib/whatsapp";


// ==========================================
// 1. DEFINICIÓN DE TIPOS E INTERFACES
// ==========================================
interface Categoria {
  id: string;
  nombre: string;
}

interface Variacion {
  id: string;
  talla: string;
  color_hex: string;
  stock: number;
  color_nombre: string
  sku?: string;
}

interface Producto {
  id: string;
  nombre: string;
  precio_menudeo: number;
  precio_mayoreo: number;
  descripcion: string;
  categoria_id: string;
  imagen_principal_url?: string;
  destacado?: boolean;
  categorias?: { nombre: string };
  variaciones?: Variacion[];
  stock: number;
}

interface Suscriptor {
  id: string;
  email: string;
  created_at: string;
}

// ==========================================
// 2. CONSTANTES INICIALES
// ==========================================
const estadoInicialForm = {
  nombre: "",
  precio_menudeo: "",
  precio_mayoreo: "",
  descripcion: "",
  categoria_id: "",
};

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================
export default function TablaGestionProductos({
  productos: datosExternos,
  categorias,
  refreshData,
}: {
  productos: Producto[];
  categorias: Categoria[];
  refreshData: () => void;
}) {
  // ------------------------------------------
  // ESTADOS: NAVEGACIÓN Y UI GLOBAL
  // ------------------------------------------
  const [pestanaActiva, setPestanaActiva] = useState<"productos" | "suscriptores" | "pedidos">("productos");
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: "" });

  // ------------------------------------------
  // ESTADOS: PRODUCTOS Y CATEGORÍAS
  // ------------------------------------------
  const [productos, setProductos] = useState<Producto[]>(datosExternos);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState<Categoria[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [tempData, setTempData] = useState(estadoInicialForm);

  // ------------------------------------------
  // ESTADOS: SUSCRIPTORES
  // ------------------------------------------
  const [suscriptores, setSuscriptores] = useState<Suscriptor[]>([]);
  const [cargandoSuscriptores, setCargandoSuscriptores] = useState(false);
  const [busquedaSuscriptor, setBusquedaSuscriptor] = useState("");

  // ------------------------------------------
  // ESTADOS: pedidos 
  // ------------------------------------------
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false);

  

  // ------------------------------------------
  // ESTADOS: FILTROS Y ORDENAMIENTO (PRODUCTOS)
  // ------------------------------------------
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "bajo" | "agotado" | "disponible">("todos");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("todas");
  const [criterioOrden, setCriterioOrden] = useState<
    "nombre_asc" | "nombre_desc" | "precio_asc" | "precio_desc" | "stock_asc" | "stock_desc"
  >("nombre_asc");
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  // ------------------------------------------
  // ESTADOS: PAGINACIÓN
  // ------------------------------------------
  const [productosPorPagina, setProductosPorPagina] = useState(8);

  // Búsqueda y Paginación
  const [paginaActual, setPaginaActual] = useState(1);


  // Búsqueda y Paginación EXCLUSIVAS para la pestaña de Pedidos
  const [busquedaOrdenes, setBusquedaOrdenes] = useState("");
  const [paginaActualOrdenes, setPaginaActualOrdenes] = useState(1);
  const elementosPorPaginaOrdenes = 5;
  // Eliminación
  const [eliminandoId, setEliminandoId] = useState<string | number | null>(null);

  // ------------------------------------------
  // ESTADOS: MODALES Y SUBIDAS DE ARCHIVOS
  // ------------------------------------------
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [subiendoGuia, setSubiendoGuia] = useState(false);
  const [subiendoMiniatura, setSubiendoMiniatura] = useState<boolean>(false);
  const [cargandoGaleria, setCargandoGaleria] = useState<boolean>(false);


  // Modales Simples
  const [modalEliminar, setModalEliminar] = useState(false);
  const [idParaEliminar, setIdParaEliminar] = useState<string | null>(null);
  const [modalEliminarLote, setModalEliminarLote] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null); // Para suscriptores
  const [ordenAEliminar, setOrdenAEliminar] = useState<any | null>(null); // pedidos
  // Estado para controlar qué variación está pendiente de eliminación
  const [variacionAEliminar, setVariacionAEliminar] = useState<{
    id: string;
    productoId: string;
    detalle: string;
  } | null>(null);


  // Modales Complejos
  const [modalGuia, setModalGuia] = useState<{ mostrar: boolean; categoriaId: string | null; nombreCategoria: string }>({
    mostrar: false,
    categoriaId: null,
    nombreCategoria: "",
  });
  const [modalGaleria, setModalGaleria] = useState<{
    mostrar: boolean;
    productoId: string | null;
    nombreProducto: string;
    variaciones: Variacion[];
  }>({
    mostrar: false,
    productoId: null,
    nombreProducto: "",
    variaciones: [],
  });

  const [colorFiltro, setColorFiltro] = useState<string>("todos");
  const [miniaturas, setMiniaturas] = useState<{ id: string; imagen_url: string; color_hex?: string }[]>([]);


  // Nuevo Estado
  const [varianteNueva, setVarianteNueva] = useState<{
  productoId: string | null;
  talla: string;
  nombreColor: string;
  stock: number;
  colorHex: string;
}>({
  productoId: null,
  talla: "",
  nombreColor: "",
  stock: 10,
  colorHex: "#000000",
});


  // ==========================================
  // 4. EFECTOS (CICLO DE VIDA)
  // ==========================================
  
  // Sincronizar datos externos de productos
  useEffect(() => {
    setProductos(datosExternos);
  }, [datosExternos]);

  // Cargar categorías disponibles
  useEffect(() => {
    const cargarCategorias = async () => {
      const { data, error } = await supabase.from("categorias").select("id, nombre").order("nombre");
      if (data) setCategoriasDisponibles(data);
      if (error) console.error("Error cargando categorías:", error.message);
    };
    cargarCategorias();
  }, []);

  // Cargar suscriptores solo cuando se activa su pestaña
  useEffect(() => {
    if (pestanaActiva === "suscriptores" && suscriptores.length === 0) {
      cargarSuscriptores();
    }
  }, [pestanaActiva]);

  // Reiniciar la paginación al cambiar filtros de productos
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, categoriaSeleccionada, filtroEstado, criterioOrden]);

  // función que cambia la pestaña
  useEffect(() => {
    if (pestanaActiva === "pedidos") {
      cargarOrdenes();
    }
  }, [pestanaActiva]);

  // ==========================================
  // 5. LÓGICA DERIVADA (FILTROS Y PAGINACIÓN)
  // ==========================================
  
  // Filtro de Suscriptores
  const suscriptoresFiltrados = suscriptores.filter((s) =>
    s.email.toLowerCase().includes(busquedaSuscriptor.toLowerCase())
  );

  // Filtro y Ordenamiento de Productos
  const productosFiltrados = productos
    .filter((prod) => {
      const coincideBusqueda =
        prod.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        prod.variaciones?.some((v: Variacion) => v.sku?.toLowerCase().includes(busqueda.toLowerCase()));

      let coincideCategoria = false;
      if (categoriaSeleccionada === "todas") {
        coincideCategoria = true;
      } else if (categoriaSeleccionada === "agotados") {
        const stockTotal = prod.variaciones?.reduce((acc, v) => acc + (v.stock || 0), 0) ?? 0;
        coincideCategoria = stockTotal === 0;
      } else {
        coincideCategoria = String(prod.categoria_id) === String(categoriaSeleccionada);
      }

      const tieneStockBajo = prod.variaciones?.some((v: Variacion) => Number(v.stock) >= 1 && Number(v.stock) <= 2);
      const stockTotal = prod.variaciones?.reduce((acc, v: Variacion) => acc + Number(v.stock || 0), 0) ?? 0;
      const estaAgotado = stockTotal === 0;
      const estaDisponible = stockTotal > 0 && !tieneStockBajo;

      let coincideFiltroEstado = true;
      if (filtroEstado === "bajo") coincideFiltroEstado = tieneStockBajo ?? false;
      if (filtroEstado === "agotado") coincideFiltroEstado = estaAgotado;
      if (filtroEstado === "disponible") coincideFiltroEstado = estaDisponible;

      return coincideBusqueda && coincideCategoria && coincideFiltroEstado;
    })
    .sort((a, b) => {
      const stockA = a.variaciones?.reduce((acc, v) => acc + Number(v.stock || 0), 0) ?? Number(a.stock || 0);
      const stockB = b.variaciones?.reduce((acc, v) => acc + Number(v.stock || 0), 0) ?? Number(b.stock || 0);

      switch (criterioOrden) {
        case "nombre_asc": return (a.nombre || "").localeCompare(b.nombre || "");
        case "nombre_desc": return (b.nombre || "").localeCompare(a.nombre || "");
        case "precio_asc": return (a.precio_menudeo ?? 0) - (b.precio_menudeo ?? 0);
        case "precio_desc": return (b.precio_menudeo ?? 0) - (a.precio_menudeo ?? 0);
        case "stock_asc": return stockA - stockB;
        case "stock_desc": return stockB - stockA;
        default: return 0;
      }
    });

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina) || 1;
  const indiceInicial = (paginaActual - 1) * productosPorPagina;
  const indiceFinal = indiceInicial + productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicial, indiceFinal);

  // Estadísticas del Inventario
  const totalProductos = productos.length;
  const agotados = productos.filter((p) => {
    if (!p.variaciones || p.variaciones.length === 0) return true;
    return p.variaciones.reduce((acc, v) => acc + Number(v.stock ?? 0), 0) === 0;
  }).length;
  const stockBajo = productos.filter((p) => {
    if (!p.variaciones || p.variaciones.length === 0) return false;
    return p.variaciones.some((v) => Number(v.stock) >= 1 && Number(v.stock) <= 2);
  }).length;
  const enStock = productos.filter((p) => {
    if (!p.variaciones || p.variaciones.length === 0) return false;
    return p.variaciones.every((v) => Number(v.stock) > 2);
  }).length;

  const valorTotalMenudeo = productos.reduce((total, p) => {
    const stockProducto = Array.isArray(p.variaciones)
      ? p.variaciones.reduce((acc, v) => acc + Number(v.stock ?? 0), 0)
      : Number(p.stock ?? 0);
    return total + stockProducto * Number(p.precio_menudeo ?? 0);
  }, 0);

  const valorFormateado = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(valorTotalMenudeo);

  // ==========================================
  // 6. FUNCIONES / HANDLERS
  // ==========================================

  // --- Utilidades ---
  const mostrarAviso = (msg: string) => {
    setNotificacion({ mostrar: true, mensaje: msg });
    setTimeout(() => setNotificacion({ mostrar: false, mensaje: "" }), 3000);
  };

  // --- Exportaciones ---
  const exportarCSV = () => {
    if (suscriptores.length === 0) return toast.error("No hay suscriptores para exportar");
    const headers = ["ID", "Email", "Fecha de Registro"];
    const filas = suscriptores.map((s) => [s.id, `"${s.email}"`, `"${new Date(s.created_at).toLocaleDateString("es-MX")}"`]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...filas.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Suscriptores_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const exportarAExcel = () => {
    if (!productos || productos.length === 0) return toast.error("No hay productos para exportar");
    const headers = ["ID", "Producto", "Talla / Variación", "Stock", "Precio Menudeo ($)", "Precio Mayoreo ($)"];
    const filas = productos.flatMap((p) => {
      const pMenudeo = p.precio_menudeo ?? 0;
      const pMayoreo = p.precio_mayoreo ?? 0;
      if (p.variaciones && p.variaciones.length > 0) {
        return p.variaciones.map((v) => [p.id, `"${(p.nombre || "").replace(/"/g, '""')}"`, `"${(v.talla || "Única").replace(/"/g, '""')}"`, v.stock ?? 0, pMenudeo, pMayoreo]);
      }
      return [[p.id, `"${(p.nombre || "").replace(/"/g, '""')}"`, "Sin variación", p.stock ?? 0, pMenudeo, pMayoreo]];
    });
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...filas.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Inventario_Actual_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  // --- Handlers: Suscriptores ---
  const cargarSuscriptores = async () => {
    setCargandoSuscriptores(true);
    const { data, error } = await supabase.from("suscriptores").select("id, email, created_at").order("created_at", { ascending: false });
    if (error) toast.error("Error al obtener los suscriptores");
    else if (data) setSuscriptores(data);
    setCargandoSuscriptores(false);
  };

  // --- Handlers: Productos Básicos ---
  const iniciarEdicion = (p: Producto) => {
    setEditandoId(p.id);
    setTempData({ nombre: p.nombre, precio_menudeo: p.precio_menudeo.toString(), precio_mayoreo: p.precio_mayoreo.toString(), descripcion: p.descripcion || "", categoria_id: p.categoria_id || "" });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setTempData(estadoInicialForm);
  };

  const guardarCambios = async (id: string) => {
    try {
      const pMenudeo = Math.max(0, parseFloat(tempData.precio_menudeo) || 0);
      const pMayoreo = Math.max(0, parseFloat(tempData.precio_mayoreo) || 0);
      const { error } = await supabase.from("productos").update({ nombre: tempData.nombre, precio_menudeo: pMenudeo, precio_mayoreo: pMayoreo, descripcion: tempData.descripcion, categoria_id: tempData.categoria_id || null }).eq("id", id);
      if (error) throw error;
      
      const nombreCat = categoriasDisponibles.find((c) => c.id === tempData.categoria_id)?.nombre;
      setProductos(productos.map((p) => p.id === id ? { ...p, nombre: tempData.nombre, descripcion: tempData.descripcion, categoria_id: tempData.categoria_id, precio_menudeo: pMenudeo, precio_mayoreo: pMayoreo, categorias: { nombre: nombreCat || "General" } } : p));
      setEditandoId(null);
      mostrarAviso("Producto actualizado");
      refreshData();
    } catch (err) {
      toast.error("Error al guardar cambios");
    }
  };

  const ejecutarEliminacion = async () => {
    if (!idParaEliminar) return;
    const { error } = await supabase.from("productos").delete().eq("id", idParaEliminar);
    if (error) toast.error("No se pudo eliminar el producto");
    else {
      setProductos(productos.filter((p) => p.id !== idParaEliminar));
      setModalEliminar(false);
      setIdParaEliminar(null);
      mostrarAviso("Producto eliminado");
    }
  };

  const ejecutarEliminacionLote = async () => {
    if (seleccionados.length === 0) return;
    try {
      const { error } = await supabase.from("productos").delete().in("id", seleccionados);
      if (error) return toast.error("No se pudieron eliminar los productos seleccionados");
      
      const cantidadEliminada = seleccionados.length;
      setProductos((prev) => prev.filter((p) => !seleccionados.includes(String(p.id))));
      setSeleccionados([]);
      setModalEliminarLote(false);
      mostrarAviso(`${cantidadEliminada} producto(s) eliminado(s)`);
    } catch (err) {
      toast.error("Ocurrió un error inesperado al eliminar");
    }
  };

  const toggleSeleccion = (id: string) => {
    setSeleccionados((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const toggleSeleccionarTodos = () => {
    if (seleccionados.length === productosFiltrados.length && productosFiltrados.length > 0) setSeleccionados([]);
    else setSeleccionados(productosFiltrados.map((p) => String(p.id)));
  };

  const toggleDestacado = async (productoId: string, estadoActual: boolean) => {
    const nuevoEstado = !estadoActual;
    if (nuevoEstado && productos.filter((p) => p.destacado).length >= 3) {
      return toast.error("¡Límite alcanzado! Solo puedes mostrar 3 productos destacados en la página de inicio.");
    }
    try {
      const { error } = await supabase.from("productos").update({ destacado: nuevoEstado }).eq("id", productoId);
      if (error) throw error;
      setProductos(productos.map((p) => (p.id === productoId ? { ...p, destacado: nuevoEstado } : p)));
      mostrarAviso(nuevoEstado ? "Añadido a Destacados (Inicio)" : "Quitado de Destacados");
    } catch (err) {
      toast.error("Error al actualizar la pieza destacada");
    }
  };

  const manejarAjusteStock = async (varianteId: string, valorInput: string, productoId: string) => {
    const nuevoStock = Math.max(0, parseInt(valorInput) || 0);
    try {
      const { error } = await supabase.from("variaciones").update({ stock: nuevoStock }).eq("id", varianteId);
      if (error) throw error;
      setProductos(productos.map((prod) => prod.id === productoId ? { ...prod, variaciones: prod.variaciones?.map((v) => v.id === varianteId ? { ...v, stock: nuevoStock } : v) } : prod));
      mostrarAviso("Inventario actualizado");
    } catch (err) {
      toast.error("Error en stock");
    }
  };

  // --- Handlers: Imágenes y Galería ---
  const cambiarImagen = async (e: React.ChangeEvent<HTMLInputElement>, productoId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(productoId);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `productos/${productoId}-${Date.now()}.${fileExt}`;
      const { error: upErr } = await supabase.storage.from("fotos-productos").upload(filePath, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("fotos-productos").getPublicUrl(filePath);
      await supabase.from("productos").update({ imagen_principal_url: publicUrl }).eq("id", productoId);
      setProductos(productos.map((p) => (p.id === productoId ? { ...p, imagen_principal_url: publicUrl } : p)));
      mostrarAviso("Imagen actualizada");
    } catch (error) {
      toast.error("Error al subir imagen");
    } finally {
      setSubiendo(null);
    }
  };

  const abrirGaleria = async (producto: Producto) => {
    setModalGaleria({ mostrar: true, productoId: producto.id, nombreProducto: producto.nombre, variaciones: producto.variaciones || [] });
    setColorFiltro("todos");
    setCargandoGaleria(true);
    const { data, error } = await supabase.from("imagenes_producto").select("id, imagen_url, color_hex").eq("producto_id", producto.id).order("created_at", { ascending: true });
    if (data) setMiniaturas(data);
    if (error) console.error("Error cargando miniaturas:", error.message);
    setCargandoGaleria(false);
  };

  const subirMiniatura = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !modalGaleria.productoId) return;
    setSubiendoMiniatura(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `galeria/${modalGaleria.productoId}-${Date.now()}.${fileExt}`;
      const { error: upErr } = await supabase.storage.from("fotos-productos").upload(filePath, file);
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("fotos-productos").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      const colorAAsignar = colorFiltro === "todos" ? null : colorFiltro;
      const { data: nuevaImg, error: dbErr } = await supabase.from("imagenes_producto").insert([{ producto_id: modalGaleria.productoId, imagen_url: publicUrl, color_hex: colorAAsignar }]).select("id, imagen_url, color_hex").single();
      if (dbErr) throw dbErr;
      setMiniaturas((prev) => [...prev, nuevaImg]);
      mostrarAviso("Miniatura agregada correctamente");
    } catch (err: any) {
      toast.error("Error al subir miniatura: " + err.message);
    } finally {
      setSubiendoMiniatura(false);
    }
  };

  const eliminarMiniatura = async (idMiniatura: string) => {
    try {
      const { error } = await supabase.from("imagenes_producto").delete().eq("id", idMiniatura);
      if (error) throw error;
      setMiniaturas((prev) => prev.filter((img) => img.id !== idMiniatura));
      mostrarAviso("Miniatura eliminada");
    } catch (err: any) {
      toast.error("Error al eliminar miniatura: " + err.message);
    }
  };

  const cambiarColorMiniatura = async (idMiniatura: string, nuevoColorHex: string | null) => {
    try {
      const { error } = await supabase.from("imagenes_producto").update({ color_hex: nuevoColorHex }).eq("id", idMiniatura);
      if (error) throw error;
      setMiniaturas((prev) => prev.map((img) => img.id === idMiniatura ? { ...img, color_hex: nuevoColorHex ?? undefined } : img));
      mostrarAviso("Color de la imagen actualizado");
    } catch (err: any) {
      toast.error("Error al actualizar el color de la miniatura: " + err.message);
    }
  };

  const actualizarColorVariacion = async (varianteId: string, colorViejoHex: string, colorNuevoHex: string, productoId: string) => {
    if (colorViejoHex === colorNuevoHex) return;
    try {
      const { error: errVar } = await supabase.from("variaciones").update({ color_hex: colorNuevoHex }).eq("id", varianteId);
      if (errVar) throw errVar;
      const { error: errImg } = await supabase.from("imagenes_producto").update({ color_hex: colorNuevoHex }).eq("producto_id", productoId).eq("color_hex", colorViejoHex);
      if (errImg) throw errImg;
      
      setProductos((prev) => prev.map((prod) => prod.id === productoId ? { ...prod, variaciones: prod.variaciones?.map((v) => v.id === varianteId ? { ...v, color_hex: colorNuevoHex } : v) } : prod));
      
      if (modalGaleria.productoId === productoId) {
        setMiniaturas((prev) => prev.map((img) => img.color_hex === colorViejoHex ? { ...img, color_hex: colorNuevoHex } : img));
        setModalGaleria((prev) => ({ ...prev, variaciones: prev.variaciones.map((v) => v.id === varianteId ? { ...v, color_hex: colorNuevoHex } : v) }));
        if (colorFiltro === colorViejoHex) setColorFiltro(colorNuevoHex);
      }
      mostrarAviso("Color de variación e imágenes actualizado");
    } catch (err: any) {
      toast.error("Error al actualizar el color de la variación: " + err.message);
    }
  };

// Nueva función
// Eliminar variación
const eliminarVariacion = async (varianteId: string, productoId: string) => {
 

  try {
    const { error } = await supabase.from("variaciones").delete().eq("id", varianteId);
    if (error) throw error;

    setProductos((prev) =>
      prev.map((prod) =>
        prod.id === productoId
          ? {
              ...prod,
              variaciones: prod.variaciones?.filter((v) => v.id !== varianteId),
            }
          : prod
      )
    );

    mostrarAviso("Variación eliminada");
  } catch (err: any) {
    toast.error("Error al eliminar la variación: " + err.message);
  }
};

// Heredar color para agregar otra talla
const agregarTallaAMismoColor = (varianteExistente: Variacion, productoId: string) => {
  setVarianteNueva({
    productoId: productoId,
    talla: "", 
    // Asegúrate de usar el mismo nombre que en tu base de datos (nombre_color o color_nombre)
    nombreColor: varianteExistente.color_nombre || varianteExistente.color_nombre || "", 
    colorHex: varianteExistente.color_hex || "#000000",
    stock: 10,
  });
};

// NUEVAS FUNCIONES
// Actualizar el nombre del color en la variación
// 1. Función para actualizar el Nombre del Color
const actualizarNombreColor = async (variacionId: string, nuevoNombre: string, productoId: string) => {
  const nombreLimpio = nuevoNombre.trim();
  
  // Guardar en Supabase
  const { error } = await supabase
    .from("variaciones")
    .update({ color_nombre: nombreLimpio })
    .eq("id", variacionId);

  mostrarAviso("Nombre del Color de variación actualizado");  
  if (error) {
    toast.error("Error al actualizar nombre de color:" + error.message)
    // console.error("Error al actualizar nombre de color:", error.message);
    return;
  }

  // Actualizar la pantalla localmente sin recargar
  setProductos((prevProductos: any[]) =>
    prevProductos.map((prod) => {
      if (prod.id !== productoId) return prod;
      return {
        ...prod,
        variaciones: prod.variaciones?.map((v: any) =>
          v.id === variacionId ? { ...v, color_nombre: nombreLimpio } : v
        ),
      };
    })
  );
};

// 2. Función para actualizar la Talla
const actualizarTallaVariacion = async (variacionId: string, nuevaTalla: string, productoId: string) => {
  const tallaLimpia = nuevaTalla.trim().toUpperCase();

  // Guardar en Supabase
  const { error } = await supabase
    .from("variaciones")
    .update({ talla: tallaLimpia })
    .eq("id", variacionId);

  mostrarAviso("Talla de variación actualizado");  
  
  if (error) {
    toast.error("Error al actualizar talla" + error.message)
    // console.error("Error al actualizar talla:", error.message);
    return;
  }

  // Actualizar la pantalla localmente sin recargar
  setProductos((prevProductos: any[]) =>
    prevProductos.map((prod) => {
      if (prod.id !== productoId) return prod;
      return {
        ...prod,
        variaciones: prod.variaciones?.map((v: any) =>
          v.id === variacionId ? { ...v, talla: tallaLimpia } : v
        ),
      };
    })
  );
};

// Guardar la nueva variación
const guardarNuevaVariacionInline = async (productoId: string) => {
  if (!varianteNueva.talla.trim()) {
    toast.error("Por favor ingresa una talla");
    return;
  }

  try {
    const { data: nuevaVar, error } = await supabase
      .from("variaciones")
      .insert([
        {
          producto_id: productoId,
          talla: varianteNueva.talla.toUpperCase().trim(),
          color_nombre: varianteNueva.nombreColor.trim() || null,
          stock: varianteNueva.stock,
          color_hex: varianteNueva.colorHex,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    setProductos((prev) =>
      prev.map((prod) =>
        prod.id === productoId
          ? { ...prod, variaciones: [...(prod.variaciones || []), nuevaVar] }
          : prod
      )
    );

    setVarianteNueva({ productoId: null, talla: "", nombreColor: "", stock: 10, colorHex: "#000000" });
    mostrarAviso("Variación agregada");
  } catch (err: any) {
    toast.error("Error al crear variación: " + err.message);
  }
};

// NUEVA FUNCIÓN PARA ORDENES O PEDIDOS 
const cargarOrdenes = async () => {
  setCargandoOrdenes(true);
  try {
    const { data, error } = await supabase
      .from("ordenes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar órdenes:", error);
    } else {
      setOrdenes(data || []);
    }
  } catch (err) {
    console.error("Error inesperado al obtener pedidos:", err);
  } finally {
    setCargandoOrdenes(false);
  }
};



  const actualizarGuiaCategoria = async (e: React.ChangeEvent<HTMLInputElement>, campoColumna: "guia_tallas_hombre_url" | "guia_tallas_mujer_url" | "guia_tallas_ninos_url" | "guia_tallas_ninas_url") => {
    const file = e.target.files?.[0];
    if (!file || !modalGuia.categoriaId) return;
    setSubiendoGuia(true);
    try {
      const fileName = `${Date.now()}-${campoColumna}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("fotos-productos").upload(fileName, file);
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("fotos-productos").getPublicUrl(fileName);
      const publicUrl = data.publicUrl;
      const { error: dbErr } = await supabase.from("categorias").update({ [campoColumna]: publicUrl }).eq("id", modalGuia.categoriaId);
      if (dbErr) throw dbErr;
      
      setCategoriasDisponibles((prev) => prev.map((cat) => cat.id === modalGuia.categoriaId ? { ...cat, [campoColumna]: publicUrl } : cat));
      mostrarAviso("Guía de tallas actualizada correctamente");
    } catch (err: any) {
      toast.error("Error al actualizar la guía: " + err.message);
    } finally {
      setSubiendoGuia(false);
    }
  };

  // Control de estado de visualización para Empty State Global
  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-stone-200">
        <Package className="w-8 h-8 text-stone-300 mb-2" />
        <p className="text-stone-500 text-sm font-medium">No hay productos registrados en el inventario.</p>
      </div>
    );
  }

  const abrirModalEliminarLote = () => {
    if (seleccionados.length === 0) return;
    setModalEliminarLote(true);
  };

  // Función ejecutada desde el Modal
  const confirmarEliminacion = async () => {
    if (!idAEliminar) return;

    setEliminando(true);
    const { error } = await supabase
      .from("suscriptores")
      .delete()
      .eq("id", idAEliminar);

    if (error) {
      toast.error(`Error al eliminar: ${error.message}`);
    } else {
      setSuscriptores((prev) => prev.filter((s) => s.id !== idAEliminar));
      toast.success("Suscriptor eliminado correctamente");
    }

    setEliminando(false);
    setIdAEliminar(null);
  };


// 🔍 Filtro exclusivo para pedidos
const ordenesFiltradas = ordenes.filter((orden: any) => {
  const termino = busquedaOrdenes.toLowerCase().trim();
  const nombre = (orden.nombre_cliente || "").toLowerCase();
  const telefono = (orden.telefono || "").toLowerCase();
  const idStr = String(orden.id);

  return nombre.includes(termino) || telefono.includes(termino) || idStr.includes(termino);
});

// 📄 Cálculo de Paginación exclusivo para pedidos
const totalPaginasOrdenes = Math.ceil(ordenesFiltradas.length / elementosPorPaginaOrdenes) || 1;
const indiceInicioOrdenes = (paginaActualOrdenes - 1) * elementosPorPaginaOrdenes;
const ordenesPaginadas = ordenesFiltradas.slice(indiceInicioOrdenes, indiceInicioOrdenes + elementosPorPaginaOrdenes);


  // ==========================================
  // 7. RENDERIZADO (JSX)
  // ==========================================
  return (
    <>
      <div className="space-y-6">
        {/* ==========================================
            BARRA DE PESTAÑAS (NAVEGACIÓN)
            ========================================== */}
        <div className="flex border-b border-stone-200 gap-4 overflow-x-auto">
          <button
            onClick={() => setPestanaActiva("productos")}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              pestanaActiva === "productos" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Gestión de Productos</span>
          </button>
          <button
            onClick={() => setPestanaActiva("suscriptores")}
            className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              pestanaActiva === "suscriptores" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-400 hover:text-stone-600"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Boletín / Suscriptores</span>
          </button>
          {/* 💡 NUEVA PESTAÑA: PEDIDOS */}
          <button
              onClick={() => {
                setPestanaActiva("pedidos");
                cargarOrdenes();
              }}
              className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                pestanaActiva === "pedidos" ? "border-stone-900 text-stone-900" : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Pedidos / Compras</span>
          </button>
          
        </div>

        {/* ==========================================
            MODALES GLOBALES Y NOTIFICACIONES
            ========================================== */}
        {notificacion.mostrar && (
          <div className="fixed bottom-10 right-10 z-[100] animate-in fade-in slide-in-from-right-10 duration-300">
            <div className="bg-stone-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-stone-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest">{notificacion.mensaje}</span>
            </div>
          </div>
        )}

        {/* Modal: Guía de Tallas */}
        {modalGuia.mostrar && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-stone-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="text-base font-bold text-stone-800">Guías de Tallas</h3>
                  <p className="text-xs text-stone-400">Categoría: <span className="font-bold text-stone-700">{modalGuia.nombreCategoria}</span></p>
                </div>
                <button onClick={() => setModalGuia({ mostrar: false, categoriaId: null, nombreCategoria: "" })} className="p-1 text-stone-400 hover:text-stone-700"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[{ label: "Hombre", campo: "guia_tallas_hombre_url" }, { label: "Mujer", campo: "guia_tallas_mujer_url" }, { label: "Niños", campo: "guia_tallas_ninos_url" }, { label: "Niñas", campo: "guia_tallas_ninas_url" }].map((tipo) => {
                  const catActual = categoriasDisponibles.find((c) => c.id === modalGuia.categoriaId) as any;
                  const urlExistente = catActual?.[tipo.campo];
                  return (
                    <div key={tipo.campo} className="border border-stone-200 rounded-2xl p-3 bg-stone-50 flex flex-col justify-between">
                      <span className="text-xs font-bold text-stone-700 block mb-2">{tipo.label}</span>
                      {urlExistente ? (
                        <div className="relative group mb-2 h-32 w-full"><img src={urlExistente} alt={tipo.label} className="w-full h-full object-contain rounded-lg bg-white border" /></div>
                      ) : (
                        <div className="h-28 bg-stone-100 rounded-lg flex items-center justify-center text-[11px] text-stone-400 italic mb-2">Sin guía asignada</div>
                      )}
                      <label className="cursor-pointer text-center block py-1.5 px-3 bg-stone-900 text-white rounded-xl text-[10px] font-bold hover:bg-stone-800 transition-colors">
                        {subiendoGuia ? "Subiendo..." : urlExistente ? "Cambiar Imagen" : "+ Subir Guía"}
                        <input type="file" accept="image/*" disabled={subiendoGuia} className="hidden" onChange={(e) => actualizarGuiaCategoria(e, tipo.campo as any)} />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Galería de Miniaturas (Oculto para ahorrar espacio aquí, pero mantiene tu código intacto internamente) */}
        {modalGaleria.mostrar && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
             {/* Todo el contenido de modalGaleria original va aquí sin alteraciones funcionales */}
             <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-stone-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="text-base font-bold text-stone-800">Galería de Miniaturas</h3>
                  <p className="text-xs text-stone-400">Producto: <span className="font-bold text-stone-700">{modalGaleria.nombreProducto}</span></p>
                </div>
                <button onClick={() => setModalGaleria({ mostrar: false, productoId: null, nombreProducto: "", variaciones: [] })} className="p-1 text-stone-400 hover:text-stone-700"><X size={20} /></button>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Filtrar o asignar color a la foto:</span>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setColorFiltro("todos")} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${colorFiltro === "todos" ? "bg-stone-900 text-white border-stone-900 shadow-sm" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"}`}>Todas (Generales)</button>
                  {Array.from(new Set(modalGaleria.variaciones.map(v => v.color_hex))).map((hex) => (
                    <button key={hex} type="button" onClick={() => setColorFiltro(hex)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${colorFiltro === hex ? "bg-stone-900 text-white border-stone-900 shadow-sm" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"}`}>
                      <div className="w-3 h-3 rounded-full border shadow-xs" style={{ backgroundColor: hex }} />
                      <span>{hex}</span>
                    </button>
                  ))}
                </div>
              </div>
              {cargandoGaleria ? (
                <div className="py-12 text-center text-xs font-bold text-stone-400">Cargando miniaturas...</div>
              ) : (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {miniaturas.filter(img => colorFiltro === "todos" || img.color_hex === colorFiltro).map((img) => (
                    <div key={img.id} className="relative group aspect-square bg-stone-100 rounded-2xl overflow-hidden border border-stone-200 shadow-xs flex flex-col">
                      <img src={img.imagen_url} alt="Miniatura" className="w-full h-full object-cover flex-grow" />
                      <div className="absolute top-2 left-2 w-4 h-4 rounded-full border border-white shadow-md pointer-events-none z-10" style={{ backgroundColor: img.color_hex || 'transparent' }} title={`Color asignado: ${img.color_hex || 'General'}`} />
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-stone-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                        <select value={img.color_hex || "general"} onChange={(e) => { const val = e.target.value === "general" ? null : e.target.value; cambiarColorMiniatura(img.id, val); }} className="text-[10px] font-bold py-1 px-2 rounded-lg bg-white/90 text-stone-900 backdrop-blur-xs border border-white/20 cursor-pointer focus:outline-none" title="Cambiar color asignado">
                          <option value="general" className="bg-white text-stone-900">General (Sin color)</option>
                          {Array.from(new Set(modalGaleria.variaciones.map(v => v.color_hex))).map((hex) => (
                            <option key={hex} value={hex} className="bg-white text-stone-900">{hex}</option>
                          ))}
                        </select>
                      </div>
                      <button type="button" onClick={() => eliminarMiniatura(img.id)} className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity shadow-md z-10" title="Eliminar miniatura"><X size={12} /></button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-stone-300 hover:border-stone-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-stone-50 hover:bg-stone-100">
                    {subiendoMiniatura ? (
                      <div className="w-5 h-5 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><Camera className="w-6 h-6 text-stone-400 mb-1" /><span className="text-[10px] font-bold text-stone-500 text-center px-1">+ Subir {colorFiltro === "todos" ? "General" : "para este color"}</span></>
                    )}
                    <input type="file" accept="image/*" disabled={subiendoMiniatura} className="hidden" onChange={subirMiniatura} />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Confirmación Eliminar Individual */}
        {modalEliminar && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6 text-center border border-stone-100">
              <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center"><AlertTriangle className="w-8 h-8 text-red-500" /></div>
              <div><h3 className="text-xl font-bold text-stone-800">¿Estás seguro?</h3><p className="text-sm text-stone-500 mt-2">Esta acción borrará la pieza y todo su inventario de forma permanente.</p></div>
              <div className="flex gap-3">
                <button onClick={() => { setModalEliminar(false); setIdParaEliminar(null); }} className="flex-1 py-3 rounded-xl font-bold text-sm text-stone-400 hover:bg-stone-50 transition-colors">Cancelar</button>
                <button onClick={ejecutarEliminacion} className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200 transition-all">Eliminar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirmación Eliminar por Lote */}
        {modalEliminarLote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 transform transition-all">
              <div className="flex items-center gap-4 text-rose-600 mb-4">
                <div className="p-3 bg-rose-100 rounded-full"><AlertTriangle className="w-6 h-6" /></div>
                <div><h3 className="text-lg font-bold text-gray-900">¿Eliminar productos seleccionados?</h3><p className="text-xs text-gray-500">Esta acción no se puede deshacer.</p></div>
              </div>
              <p className="text-sm text-gray-600 mb-6">Estás a punto de eliminar <span className="font-bold text-gray-900">{seleccionados.length} producto(s)</span> de la base de datos de forma permanente.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setModalEliminarLote(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">Cancelar</button>
                <button onClick={ejecutarEliminacionLote} className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer">Sí, eliminar todos</button>
              </div>
            </div>
          </div>
        )}


        {/* ==========================================
            VISTA 1: PESTAÑA PRODUCTOS
            ========================================== */}
        {pestanaActiva === "productos" && (
          <div>
            {/* Cabecera y Exportar Excel */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h2 className="text-xl font-bold text-gray-800">Listado de Inventario</h2>
              <button onClick={exportarAExcel} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm cursor-pointer">
                <Download className="w-4 h-4 shrink-0" />
                <span>Exportar a Excel</span>
              </button>
            </div>

            {/* Bloque de Filtros, Búsqueda y Ordenamiento */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-stone-400" /></div>
                <input type="text" placeholder="Buscar pieza por nombre o SKU..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 transition-all shadow-sm placeholder:text-stone-300" />
              </div>
              <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-2xl px-3 py-1 shadow-sm">
                <ArrowUpDown className="w-4 h-4 text-stone-400 shrink-0" />
                <select value={criterioOrden} onChange={(e) => setCriterioOrden(e.target.value as any)} className="w-full py-2 bg-transparent text-sm font-bold text-stone-700 outline-none cursor-pointer">
                  <option value="nombre_asc">Nombre: A-Z</option>
                  <option value="nombre_desc">Nombre: Z-A</option>
                  <option value="precio_asc">Precio: Menor a Mayor</option>
                  <option value="precio_desc">Precio: Mayor a Menor</option>
                  <option value="stock_asc">Stock: Menor a Mayor</option>
                  <option value="stock_desc">Stock: Mayor a Menor</option>
                </select>
              </div>
              <div className="hidden md:block min-w-[220px]">
                <select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)} className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm outline-none focus:border-stone-900 shadow-sm text-stone-700 font-bold cursor-pointer">
                  <option value="todas">Todas las categorías</option>
                  <option value="agotados" className="text-red-600 font-bold">🚫 Productos Agotados</option>
                  {categorias.map((cat) => (<option key={cat.id} value={cat.id}>{cat.nombre}</option>))}
                </select>
              </div>
            </div>

            {/* Filtros rápidos de estado de stock */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => setFiltroEstado('todos')} className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${filtroEstado === 'todos' ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Todos ({productos.length})</button>
              <button onClick={() => setFiltroEstado('disponible')} className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${filtroEstado === 'disponible' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>🟢 En Stock</button>
              <button onClick={() => setFiltroEstado('bajo')} className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${filtroEstado === 'bajo' ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>⚠️ Stock Bajo</button>
              <button onClick={() => setFiltroEstado('agotado')} className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${filtroEstado === 'agotado' ? 'bg-rose-600 text-white shadow-sm' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}>🚫 Agotados</button>
            </div>

            {/* Dashboard y Resumen Rápido */}
            <div className="py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                <div><p className="text-xs font-medium text-gray-500 uppercase">Total Productos</p><p className="text-2xl font-bold text-gray-900 mt-1">{totalProductos}</p></div>
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600"><Package className="w-5 h-5" /></div>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                <div><p className="text-xs font-medium text-gray-500 uppercase">En Stock</p><p className="text-2xl font-bold text-emerald-600 mt-1">{enStock}</p></div>
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle className="w-5 h-5" /></div>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                <div><p className="text-xs font-medium text-gray-500 uppercase">Stock Bajo</p><p className="text-2xl font-bold text-amber-500 mt-1">{stockBajo}</p></div>
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-500"><AlertTriangle className="w-5 h-5" /></div>
              </div>
              <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between">
                <div><p className="text-xs font-medium text-gray-500 uppercase">Agotados</p><p className="text-2xl font-bold text-rose-600 mt-1">{agotados}</p></div>
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600"><XCircle className="w-5 h-5" /></div>
              </div>
              {/* Valor del Inventario - Ancho Completo Móvil */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Valor del Inventario</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{valorFormateado}</p>
                  <span className="text-xs text-gray-400 mt-1 block">(Estimado a Menudeo)</span>
                </div>
                {/* <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><Download className="w-6 h-6" /></div> */}
              </div>
            </div>

            {/* Menú Flotante / Acciones Masivas al seleccionar */}
            {seleccionados.length > 0 && (
              <div className="flex items-center justify-between p-3 mb-4 bg-indigo-50 border border-indigo-200 rounded-xl transition-all">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-indigo-600 rounded-full">{seleccionados.length}</span>
                  <span className="text-sm font-medium text-indigo-900">producto(s) seleccionado(s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={abrirModalEliminarLote} className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors cursor-pointer">🗑️ Eliminar seleccionados</button>
                  <button onClick={() => setSeleccionados([])} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 cursor-pointer">Cancelar</button>
                </div>
              </div>
            )}

            {/* Categorías (Scroll horizontal para móvil) */}
            <div className="md:hidden mb-6">
              <div className="flex overflow-x-auto gap-2 scrollbar-hide px-1">
                <button onClick={() => setCategoriaSeleccionada('todas')} className={`flex-none px-4 py-2 rounded-xl font-bold text-xs transition-all border ${categoriaSeleccionada === 'todas' ? "bg-stone-900 text-white border-stone-900 shadow-md" : "bg-white text-stone-500 border-stone-200"}`}>Todos</button>
                <button onClick={() => setCategoriaSeleccionada('agotados')} className={`flex-none px-4 py-2 rounded-xl font-bold text-xs transition-all border ${categoriaSeleccionada === 'agotados' ? "bg-red-600 text-white border-red-600 shadow-md" : "bg-red-50 text-red-600 border-red-200"}`}>🚫 Agotados</button>
                {categorias.map((cat) => (
                  <button key={cat.id} onClick={() => setCategoriaSeleccionada(cat.id)} className={`flex-none px-4 py-2 rounded-xl font-bold text-xs transition-all border ${categoriaSeleccionada === cat.id ? "bg-stone-900 text-white border-stone-900 shadow-md" : "bg-white text-stone-500 border-stone-200"}`}>{cat.nombre}</button>
                ))}
              </div>
            </div>

            {/* RENDER TABLA Y TARJETAS (Listado de Productos) */}
            {productosFiltrados.length > 0 ? (
              <>
                {/* ---------------- VISTA MÓVIL (TARJETAS) ---------------- */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {productosPaginados.map((prod) => {
                    const esEditando = editandoId === prod.id;
                    return (
                      <div key={prod.id} className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                        {/* Encabezado: Imagen e Info Básica */}
                        <div className="flex gap-3">
                          <div className="relative shrink-0 w-20 h-20">
                            <img 
                              src={prod.imagen_principal_url || "/placeholder.jpg"} 
                              alt={prod.nombre} 
                              className={`w-full h-full rounded-2xl object-cover border border-stone-100 ${subiendo === prod.id ? "opacity-30" : "opacity-100"}`} 
                            />
                            <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/40 opacity-0 active:opacity-100 rounded-2xl transition-all">
                              {subiendo === prod.id ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Camera className="w-6 h-6 text-white" />
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => cambiarImagen(e, prod.id)} />
                                </>
                              )}
                            </label>
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              <div className="mb-1 flex items-center justify-between">
                                {esEditando ? (
                                  <select 
                                    value={tempData.categoria_id} 
                                    onChange={(e) => setTempData({ ...tempData, categoria_id: e.target.value })} 
                                    className="w-full text-[10px] font-bold p-1 bg-stone-50 border border-stone-200 rounded-lg outline-none"
                                  >
                                    <option value="">Categoría...</option>
                                    {categoriasDisponibles.map((cat) => (
                                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-[9px] px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full font-black uppercase tracking-wider">
                                    {prod.categorias?.nombre || "General"}
                                  </span>
                                )}
                                
                                <button 
                                  type="button" 
                                  onClick={() => toggleDestacado(prod.id, !!prod.destacado)} 
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 border transition-all ${prod.destacado ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-stone-50 text-stone-400 border-stone-200"}`}
                                >
                                  ★ {prod.destacado ? "Destacado" : "Destacar"}
                                </button>
                              </div>

                              {esEditando ? (
                                <input 
                                  value={tempData.nombre} 
                                  onChange={(e) => setTempData({ ...tempData, nombre: e.target.value })} 
                                  className="w-full border-b border-stone-900 outline-none text-sm font-bold bg-transparent" 
                                />
                              ) : (
                                <h4 className="text-base font-bold text-stone-800 truncate leading-tight">{prod.nombre}</h4>
                              )}
                            </div>

                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-stone-100">
                              <div className="flex flex-col">
                                <span className="text-[8px] text-stone-400 uppercase font-black">Menudeo</span>
                                {esEditando ? (
                                  <input type="number" min="0" value={tempData.precio_menudeo} onChange={(e) => setTempData({ ...tempData, precio_menudeo: e.target.value })} className="w-14 border-b border-stone-400 outline-none font-bold text-xs" />
                                ) : (
                                  <span className="font-bold text-stone-700 text-xs">${prod.precio_menudeo}</span>
                                )}
                              </div>
                              <div className="flex flex-col text-right">
                                <span className="text-[8px] text-stone-400 uppercase font-black">Mayoreo</span>
                                {esEditando ? (
                                  <input type="number" min="0" value={tempData.precio_mayoreo} onChange={(e) => setTempData({ ...tempData, precio_mayoreo: e.target.value })} className="w-14 border-b border-stone-400 outline-none font-bold text-xs text-right" />
                                ) : (
                                  <span className="font-bold text-stone-900 text-xs">${prod.precio_mayoreo}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Descripción Móvil */}
                        <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-100">
                          <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest block mb-0.5">Descripción</span>
                          {esEditando ? (
                            <textarea value={tempData.descripcion} onChange={(e) => setTempData({ ...tempData, descripcion: e.target.value })} rows={2} className="w-full text-xs p-2 bg-white border border-stone-200 rounded-xl outline-none resize-none" />
                          ) : (
                            <p className="text-[11px] text-stone-600 leading-snug line-clamp-2 italic">{prod.descripcion || "Sin descripción..."}</p>
                          )}
                        </div>

                        {/* Variaciones Móvil (Edición Completa: Color, Nombre, Talla, Stock y Eliminar) */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">Variaciones y Stock</span>
                          <div className="grid grid-cols-1 gap-2">
                            {prod.variaciones?.map((v: Variacion, i: number) => (
                              <div key={i} className="flex items-center justify-between gap-2 bg-stone-50/80 border border-stone-200/80 p-2 rounded-2xl">
                                
                                {/* Selector de Color en Círculo */}
                                <label className="relative cursor-pointer shrink-0 flex items-center justify-center" title="Cambiar color visual">
                                  <div className="w-5 h-5 rounded-full border border-stone-300 shadow-xs" style={{ backgroundColor: v.color_hex }} />
                                  <input 
                                    type="color" 
                                    value={v.color_hex || "#000000"} 
                                    onChange={(e) => actualizarColorVariacion(v.id, v.color_hex, e.target.value, prod.id)} 
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" 
                                  />
                                </label>

                                {/* Input para Nombre del Color */}
                                <input
                                  type="text"
                                  defaultValue={v.color_nombre || ""}
                                  placeholder="Nombre color"
                                  onBlur={(e) => actualizarNombreColor(v.id, e.target.value, prod.id)}
                                  className="flex-1 min-w-0 text-[11px] font-medium text-stone-700 bg-white border border-stone-200 rounded-lg px-2 py-1 outline-none focus:border-stone-400"
                                />

                                {/* Input para Talla */}
                                <input
                                  type="text"
                                  defaultValue={v.talla || ""}
                                  placeholder="Talla"
                                  onBlur={(e) => actualizarTallaVariacion(v.id, e.target.value, prod.id)}
                                  className="w-11 text-[11px] font-bold text-stone-800 uppercase bg-white border border-stone-200 rounded-lg py-1 text-center outline-none focus:border-stone-400"
                                />

                                {/* Input para Stock */}
                                <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg px-1.5 py-1">
                                  <span className="text-[9px] text-stone-400 font-bold">Stk:</span>
                                  <input 
                                    type="number" 
                                    min="0" 
                                    defaultValue={v.stock} 
                                    onBlur={(e) => manejarAjusteStock(v.id, e.target.value, prod.id)} 
                                    className="w-7 text-[11px] font-black text-stone-900 outline-none text-center bg-transparent" 
                                  />
                                </div>

                                {/* Botón Eliminar Variación (Dispara el Modal) */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setVariacionAEliminar({
                                      id: v.id,
                                      productoId: prod.id,
                                      detalle: `${v.talla} - ${v.color_nombre || v.color_hex}`,
                                    })
                                  }
                                  className="text-stone-400 hover:text-red-600 active:text-red-600 text-xs font-bold p-1 transition-colors cursor-pointer"
                                  title="Eliminar esta variación"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Acciones Móvil */}
                        <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                          {esEditando ? (
                            <>
                              <button onClick={() => guardarCambios(prod.id)} className="flex-1 py-2.5 bg-stone-900 text-white rounded-xl flex justify-center items-center gap-2 text-xs font-bold shadow-md">
                                <Save size={15} /> Guardar
                              </button>
                              <button onClick={cancelarEdicion} className="px-3.5 py-2.5 bg-stone-100 text-stone-500 rounded-xl">
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => iniciarEdicion(prod)} className="flex-1 py-2 bg-white border border-stone-200 text-stone-700 rounded-xl flex justify-center items-center gap-1.5 text-xs font-bold active:bg-stone-50">
                                <Edit3 size={15} /> Editar
                              </button>
                              <button type="button" onClick={() => { const cat = categoriasDisponibles.find(c => c.id === prod.categoria_id); setModalGuia({ mostrar: true, categoriaId: prod.categoria_id, nombreCategoria: cat?.nombre || "General" }); }} className="px-2.5 py-2 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold" title="Guía de Tallas">
                                📏
                              </button>
                              <button type="button" onClick={() => abrirGaleria(prod)} className="px-2.5 py-2 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold" title="Galería">
                                🖼️
                              </button>
                              <button onClick={() => { setIdParaEliminar(prod.id); setModalEliminar(true); }} className="px-3 py-2 border border-stone-200 text-stone-400 rounded-xl active:text-red-500">
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ---------------- VISTA ESCRITORIO (TABLA) ---------------- */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200">
                          <th className="p-3 w-10 text-center"><input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" checked={productosFiltrados.length > 0 && seleccionados.length === productosFiltrados.length} onChange={toggleSeleccionarTodos} /></th>
                          <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Pieza</th>
                          <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Nombre</th>
                          <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Precios (M/M)</th>
                          <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Categoría</th>
                          <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Descripción</th>
                          <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Stock Detallado</th>
                          <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">Destacado</th>
                          <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {productosPaginados.map((prod) => {
                          const esEditando = editandoId === prod.id;
                          return (
                            <tr key={prod.id} className="hover:bg-stone-50/50 transition-colors">
                              {/* Checkbox y Foto */}
                              <td className="p-3 w-10 text-center"><input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" checked={seleccionados.includes(String(prod.id))} onChange={() => toggleSeleccion(String(prod.id))} /></td>
                              <td className="p-4">
                                <div className="relative group w-14 h-14">
                                  <img src={prod.imagen_principal_url || "/placeholder.jpg"} alt={prod.nombre} className={`w-full h-full rounded-xl object-cover border border-stone-100 ${subiendo === prod.id ? "opacity-30" : "opacity-100"}`} />
                                  <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl transition-all">
                                    {subiendo === prod.id ? (<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />) : (<><Camera className="w-5 h-5 text-white" /><input type="file" accept="image/*" className="hidden" onChange={(e) => cambiarImagen(e, prod.id)} /></>)}
                                  </label>
                                </div>
                              </td>

                              {/* Nombre */}
                              <td className="p-4">
                                {esEditando ? (<input value={tempData.nombre} onChange={(e) => setTempData({ ...tempData, nombre: e.target.value })} className="w-full text-sm font-bold border-b border-stone-800 outline-none bg-transparent" />) : (<h4 className="text-xs font-bold text-stone-700 truncate max-w-[180px]">{prod.nombre}</h4>)}
                              </td>

                              {/* Precios */}
                              <td className="p-4">
                                {esEditando ? (
                                  <div className="flex flex-col gap-1">
                                    <input type="number" min="0" value={tempData.precio_menudeo} onChange={(e) => setTempData({ ...tempData, precio_menudeo: e.target.value })} className="text-xs border-b border-stone-800 outline-none w-20 font-bold" />
                                    <input type="number" min="0" value={tempData.precio_mayoreo} onChange={(e) => setTempData({ ...tempData, precio_mayoreo: e.target.value })} className="text-xs border-b border-stone-400 outline-none w-20 text-stone-500" />
                                  </div>
                                ) : (
                                  <div className="flex flex-col"><span className="text-xs font-bold text-stone-800">${prod.precio_menudeo}</span><span className="text-[10px] text-stone-400 font-medium">May: ${prod.precio_mayoreo}</span></div>
                                )}
                              </td>

                              {/* Categoría */}
                              <td className="p-4">
                                {esEditando ? (<select value={tempData.categoria_id} onChange={(e) => setTempData({ ...tempData, categoria_id: e.target.value })} className="text-xs p-1 border border-stone-200 rounded outline-none"><option value="">General</option>{categoriasDisponibles.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select>) : (<span className="text-[10px] px-2 py-1 bg-stone-100 rounded-full font-bold text-stone-600">{prod.categorias?.nombre || "General"}</span>)}
                              </td>

                              {/* Descripción */}
                              <td className="p-4 max-w-[200px]">
                                {esEditando ? (<textarea value={tempData.descripcion} onChange={(e) => setTempData({ ...tempData, descripcion: e.target.value })} rows={2} className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg outline-none resize-none" />) : (<p className="text-xs text-stone-500 truncate italic">{prod.descripcion || "—"}</p>)}
                              </td>
                                {/* desde aqui */}
                              <td className="p-4 min-w-[320px]">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {/* Variaciones existentes */}
                                  {prod.variaciones?.map((v: Variacion, i: number) => (
                                    <div
                                      key={v.id || i}
                                      className={`group relative flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
                                        v.stock <= 2 ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-stone-200 text-stone-700"
                                      }`}
                                    >
                                      {/* Color Hex Picker */}
                                      <label className="relative cursor-pointer flex items-center" title={v.color_nombre || "Cambiar color"}>
                                        <div 
                                          className="w-3.5 h-3.5 rounded-full border shadow-sm transition-transform hover:scale-125" 
                                          style={{ backgroundColor: v.color_hex }} 
                                        />
                                        <input
                                          type="color"
                                          value={v.color_hex || "#000000"}
                                          onChange={(e) => actualizarColorVariacion(v.id, v.color_hex, e.target.value, prod.id)}
                                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                        />
                                      </label>

                                      {/* CONTENEDOR EDITABLE: Nombre de color y Talla */}
                                      <div className="flex flex-col leading-none gap-0.5">
                                        {/* Input para Nombre del Color */}
                                        <input
                                          type="text"
                                          defaultValue={v.color_nombre || ""}
                                          placeholder="Color"
                                          onBlur={(e) => e.target.value !== v.color_nombre && actualizarNombreColor(v.id, e.target.value, prod.id)}
                                          className="text-[9px] text-stone-500 font-medium capitalize bg-transparent border-b border-transparent hover:border-stone-300 focus:border-stone-800 outline-none w-14"
                                          title="Editar nombre del color"
                                        />

                                        {/* Input para Talla */}
                                        <input
                                          type="text"
                                          defaultValue={v.talla || ""}
                                          placeholder="Talla"
                                          onBlur={(e) => e.target.value !== v.talla && actualizarTallaVariacion(v.id, e.target.value, prod.id)}
                                          className="text-[10px] font-bold uppercase bg-transparent border-b border-transparent hover:border-stone-300 focus:border-stone-800 outline-none w-10"
                                          title="Editar talla"
                                        />
                                      </div>

                                      {/* Input Stock */}
                                      <input
                                        type="number"
                                        min="0"
                                        defaultValue={v.stock}
                                        onBlur={(e) => manejarAjusteStock(v.id, e.target.value, prod.id)}
                                        className="w-8 text-center text-[10px] font-black bg-transparent border-b border-stone-300 outline-none"
                                        title="Editar existencia"
                                      />

                                      {/* BOTÓN PARA AGREGAR OTRA TALLA A ESTE MISMO COLOR */}
                                      <button
                                        type="button"
                                        onClick={() => agregarTallaAMismoColor(v, prod.id)}
                                        className="text-[9px] font-bold text-stone-400 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-1 py-0.5 rounded transition-colors"
                                        title={`Agregar otra talla para el color ${v.color_nombre || v.color_hex}`}
                                      >
                                        +talla
                                      </button>

                                      {/* Botón Eliminar Variación */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setVariacionAEliminar({
                                            id: v.id,
                                            productoId: prod.id,
                                            detalle: `${v.talla} - ${v.color_nombre || v.color_hex}`,
                                          })
                                        }
                                        className="text-stone-400 hover:text-red-600 text-[10px] font-bold transition-colors cursor-pointer opacity-60 hover:opacity-100"
                                        title="Eliminar esta variación"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}

                                  {/* MINI FORMULARIO PARA AGREGAR NUEVA VARIACIÓN */}
                                  {varianteNueva.productoId === prod.id ? (
                                    <div className="flex items-center gap-1 p-1.5 bg-stone-900 border border-stone-700 rounded-xl animate-in fade-in zoom-in-95 duration-200 shadow-lg">
                                      <input
                                        type="color"
                                        value={varianteNueva.colorHex}
                                        onChange={(e) => setVarianteNueva({ ...varianteNueva, colorHex: e.target.value })}
                                        className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                                        title="Color Hex"
                                      />

                                      <input
                                        type="text"
                                        placeholder="Color"
                                        value={varianteNueva.nombreColor}
                                        onChange={(e) => setVarianteNueva({ ...varianteNueva, nombreColor: e.target.value })}
                                        className="w-16 text-[10px] font-medium bg-stone-800 text-stone-100 placeholder:text-stone-500 px-1.5 py-1 rounded-lg outline-none border border-stone-700 capitalize"
                                      />

                                      <input
                                        type="text"
                                        placeholder="Talla"
                                        value={varianteNueva.talla}
                                        onChange={(e) => setVarianteNueva({ ...varianteNueva, talla: e.target.value })}
                                        className="w-12 text-[10px] font-bold bg-stone-800 text-stone-100 placeholder:text-stone-500 px-1.5 py-1 rounded-lg outline-none border border-stone-700 uppercase text-center"
                                        autoFocus
                                      />

                                      <input
                                        type="number"
                                        min="0"
                                        placeholder="Cant."
                                        value={varianteNueva.stock}
                                        onChange={(e) => setVarianteNueva({ ...varianteNueva, stock: parseInt(e.target.value) || 0 })}
                                        className="w-10 text-[10px] font-bold bg-stone-800 text-stone-100 px-1.5 py-1 rounded-lg outline-none border border-stone-700 text-center"
                                      />

                                      <button
                                        type="button"
                                        onClick={() => guardarNuevaVariacionInline(prod.id)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer"
                                      >
                                        ✓
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setVarianteNueva({ productoId: null, talla: "", nombreColor: "", stock: 10, colorHex: "#000000" })}
                                        className="text-stone-400 hover:text-stone-200 text-[10px] px-1 font-bold cursor-pointer"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setVarianteNueva({ productoId: prod.id, talla: "", nombreColor: "", stock: 10, colorHex: "#000000" })}
                                      className="px-2 py-1 rounded-lg border border-dashed border-stone-300 bg-stone-50 text-stone-600 hover:bg-stone-100 hover:border-stone-400 text-[10px] font-bold transition-all cursor-pointer"
                                    >
                                      + Nuevo Color
                                    </button>
                                  )}
                                </div>
                              </td>

                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleDestacado(prod.id, !!prod.destacado)}
                            className={`p-2 rounded-xl border transition-all ${
                              prod.destacado
                                ? "bg-amber-100 text-amber-700 border-amber-300 shadow-sm"
                                : "bg-white text-stone-300 border-stone-200 hover:text-amber-500 hover:border-amber-200"
                            }`}
                            title={prod.destacado ? "Quitar de destacados" : "Marcar como destacado"}
                          >
                            ★
                          </button>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {esEditando ? (
                              <>
                                <button onClick={() => guardarCambios(prod.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                  <Save className="w-4 h-4" />
                                </button>
                                <button onClick={cancelarEdicion} className="p-2 text-stone-400 hover:bg-stone-100 rounded-lg">
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => iniciarEdicion(prod)} className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setIdParaEliminar(prod.id); setModalEliminar(true); }} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cat = categoriasDisponibles.find(c => c.id === prod.categoria_id);
                                    setModalGuia({
                                      mostrar: true,
                                      categoriaId: prod.categoria_id,
                                      nombreCategoria: cat?.nombre || "General"
                                    });
                                  }}
                                  className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg text-xs font-bold"
                                  title="Ver/Editar Guía de Tallas"
                                >
                                  📏 Guía
                                </button>
                                <button
                                  type="button"
                                  onClick={() => abrirGaleria(prod)}
                                  className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg text-xs font-bold"
                                  title="Gestionar Galería / Miniaturas"
                                >
                                  🖼️ Galería
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
              </div>

          {/* CONTROLES DE PAGINACIÓN */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
              <span>Mostrando</span>
              <select
                value={productosPorPagina}
                onChange={(e) => {
                  setProductosPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="bg-stone-50 border border-stone-200 rounded-lg p-1 text-xs font-bold outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={20}>20</option>
              </select>
              <span>de {productosFiltrados.length} piezas</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                className="p-2 border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 text-stone-700" />
              </button>

              <span className="text-xs font-bold text-stone-700">
                Página {paginaActual} de {totalPaginas}
              </span>

              <button
                disabled={paginaActual >= totalPaginas}
                onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                className="p-2 border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4 text-stone-700" />
              </button>
            </div>
          </div>
        </>
            ) : (
              /* VISTA SIN RESULTADOS */
              <div className="text-center py-20 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Package className="w-8 h-8 text-stone-300" />
                </div>
                <h3 className="text-stone-800 font-bold text-lg">Búsqueda sin éxito</h3>
                <p className="text-stone-500 text-sm italic max-w-[250px] mx-auto mt-1">
                  No encontramos piezas que coincidan con la búsqueda o filtro seleccionado.
                </p>
                <button
                  onClick={() => { setBusqueda(""); setCategoriaSeleccionada("todas"); }}
                  className="mt-6 text-xs font-bold text-stone-900 uppercase tracking-widest hover:underline"
                >
                  Ver todo el catálogo
                </button>
              </div>
            )}
          
        </div>
      )}

      {/* VISTA 2: SUSCRIPTORES */}
      {pestanaActiva === "suscriptores" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar suscriptor por correo..."
                value={busquedaSuscriptor}
                onChange={(e) => setBusquedaSuscriptor(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:border-stone-900"
              />
            </div>

            <button
              onClick={exportarCSV}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar CSV (Excel)</span>
            </button>
          </div>

          {cargandoSuscriptores ? (
            <div className="py-12 text-center text-xs font-bold text-stone-400">
              Cargando suscriptores...
            </div>
          ) : suscriptoresFiltrados.length > 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200">
                      <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Correo Electrónico
                      </th>
                      <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Fecha Registro
                      </th>
                      <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {suscriptoresFiltrados.map((s) => (
                      <tr key={s.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-3 text-xs font-bold text-stone-700 flex items-center gap-2 whitespace-nowrap">
                          <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{s.email}</span>
                        </td>
                        <td className="p-3 text-xs text-stone-500 whitespace-nowrap">
                          {new Date(s.created_at).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          {/* AQUI */}
                          <button
                            onClick={() => setIdAEliminar(s.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar correo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-xs text-stone-400 font-medium">
              No hay suscriptores registrados.
            </div>
          )}
        </div>
      )}

      {pestanaActiva === "pedidos" && (
        <div className="mt-6 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          
          {/* ENCABEZADO Y BARRA DE BÚSQUEDA */}
          <div className="p-6 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">Historial de Pedidos</h2>
              <p className="text-xs text-stone-500">Gestión de ventas, notificaciones y limpieza</p>
            </div>

            <div className="w-full md:w-72">
            <input
                type="text"
                placeholder="Buscar por cliente, tel o ID..."
                value={busquedaOrdenes}
                onChange={(e) => {
                  setBusquedaOrdenes(e.target.value);
                  setPaginaActualOrdenes(1);
                }}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-stone-900 transition-colors"
            />
            </div>
          </div>

          {/* TABLA DE PEDIDOS */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100">
                  <th className="py-3 px-4">Orden</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Ubicación / Dirección</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Pago</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {ordenesPaginadas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-stone-400">
                      {busqueda ? "No se encontraron coincidencias." : "No hay pedidos registrados aún."}
                    </td>
                  </tr>
                ) : (
                  ordenesPaginadas.map((orden: any) => {
                    const urlWhatsApp = generarEnlaceWhatsApp(
                      orden.telefono,
                      orden.nombre_cliente,
                      orden.id,
                      "confirmacion"
                    );

                    return (
                      <tr key={orden.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-stone-900">
                          #{orden.id}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-stone-800">{orden.nombre_cliente}</p>
                          <p className="text-[11px] text-stone-400">{orden.telefono}</p>
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <p className="line-clamp-1 text-stone-700">{orden.direccion}</p>
                          <p className="text-[10px] text-stone-400">{orden.ciudad}, {orden.estado}</p>
                        </td>
                        <td className="py-4 px-4 font-bold text-stone-900">
                          ${orden.total?.toLocaleString("es-MX")} MXN
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            orden.estado_pago === "pagado"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {orden.estado_pago}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* BOTÓN WHATSAPP */}
                            <a
                              href={urlWhatsApp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                            >
                              <MessageSquare size={14} />
                              WhatsApp
                            </a>

                            {/* BOTÓN ELIMINAR */}
                           <button
                              onClick={() => setOrdenAEliminar(orden)}
                              title="Eliminar orden"
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          {totalPaginasOrdenes > 1 && (
            <div className="p-4 border-t border-stone-100 flex justify-between items-center text-xs text-stone-500">
              <p>Página <strong>{paginaActualOrdenes}</strong> de <strong>{totalPaginasOrdenes}</strong></p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaginaActualOrdenes((prev) => Math.max(prev - 1, 1))}
                  disabled={paginaActualOrdenes === 1}
                  className="px-3 py-1.5 border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50 font-medium transition-colors cursor-pointer"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPaginaActualOrdenes((prev) => Math.min(prev + 1, totalPaginasOrdenes))}
                  disabled={paginaActualOrdenes === totalPaginasOrdenes}
                  className="px-3 py-1.5 border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50 font-medium transition-colors cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {idAEliminar && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Confirmar eliminación</span>
              </div>
              <button
                onClick={() => setIdAEliminar(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 my-4 leading-relaxed">
              ¿Estás seguro de que deseas eliminar este correo de la lista de suscriptores? Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIdAEliminar(null)}
                disabled={eliminando}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminacion}
                disabled={eliminando}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                {eliminando ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR VARIACIÓN */}
      {variacionAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-100 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-stone-900">¿Eliminar variación?</h3>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">
              Estás a punto de borrar la variante <strong className="text-stone-900 font-bold">{variacionAEliminar.detalle}</strong>. Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVariacionAEliminar(null)}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await eliminarVariacion(variacionAEliminar.id, variacionAEliminar.productoId);
                  setVariacionAEliminar(null); // Cierra el modal tras eliminar
                }}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}


      {/* MODAL PERSONALIZADO DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {ordenAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-100 text-center transform transition-all scale-100">
            
            {/* Ícono de advertencia */}
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-base font-bold text-stone-900 mb-1">
              ¿Eliminar orden #{ordenAEliminar.id}?
            </h3>

            <p className="text-xs text-stone-500 mb-6">
              Esta acción eliminará de forma permanente el pedido de{" "}
              <strong className="text-stone-700">{ordenAEliminar.nombre_cliente}</strong> y todos sus productos asociados. No se podrá recuperar.
            </p>

            {/* Botones de Acción */}
            <div className="flex gap-3">
              <button
                onClick={() => setOrdenAEliminar(null)}
                disabled={eliminandoId === ordenAEliminar.id}
                className="flex-1 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                onClick={confirmarEliminacion}
                disabled={eliminandoId === ordenAEliminar.id}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {eliminandoId === ordenAEliminar.id ? (
                  <span>Eliminando...</span>
                ) : (
                  <span>Sí, eliminar</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
    </>
  );
}