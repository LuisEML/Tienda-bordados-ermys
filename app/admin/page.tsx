"use client";
import { useEffect, useState } from "react";
import { LayoutGrid, PlusCircle, List, Settings, LogOut, Download, AlertCircle } from "lucide-react"; // Importamos LogOut
import FormSubirProductos from "../components/FormSubirProductos";
import TablaGestion from "../components/TablaGestion";
import FormEditarWeb from "../components/FormEditarWeb";
import LoginAdmin from "../components/LoginAdmin"; // Importamos el Login
import { supabase } from "@/lib/supabase";
import AdminBoletin from "../components/AdminBoletin";

export default function AdminPage() {
  const [sesion, setSesion] = useState<any>(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [vistaActiva, setVistaActiva] = useState<'subir' | 'gestionar' | 'editar_web'| 'suscrip'>('subir');
  const [productos, setProductos] = useState<any>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  // 1. Agrega esto junto a tus otros estados (const [sesion...], const [productos...])
  const [modalVacio, setModalVacio] = useState(false);
  const [cargando, setCargando] = useState(false);


  // 1. VERIFICAR AUTENTICACIÓN
  useEffect(() => {
    // Comprobar la sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setVerificandoSesion(false);
    });

    // Escuchar cambios de estado en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // FUNCIÓN PARA CERRAR SESIÓN
  const cerrarSesion = async () => {
    await supabase.auth.signOut();
  };


  // Función para descargar las ventas en formato CSV (Excel)
 const exportarAExcel = async () => {
  try {
    // 1. Consultar las órdenes registradas en Supabase
    const { data: ordenes, error } = await supabase
      .from("ordenes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // 2. Si la consulta fue exitosa pero NO hay órdenes registradas
    if (!ordenes || ordenes.length === 0) {
      setModalVacio(true); // Abrimos el modal elegante
      return;  
                  // Salimos de la función
    }

    // 3. Definir las columnas/encabezados del archivo Excel
    const encabezados = [
      "ID Orden",
      "Fecha",
      "Cliente",
      "Teléfono",
      "Dirección",
      "Ciudad",
      "Código Postal",
      "Estado Rep.",
      "Total ($)",
      "Método de Pago",
      "Estado de Pago"
    ];

    // 4. Mapear cada fila limpiando comas y comillas para no romper el CSV
    const filas = ordenes.map((o) => {
      const fechaFormateada = o.created_at 
        ? `${new Date(o.created_at).toLocaleDateString("es-MX")} ${new Date(o.created_at).toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit' })}`
        : 'N/A';

      return [
        `"${o.id}"`,
        `"${fechaFormateada}"`,
        `"${(o.nombre_cliente || 'N/A').replace(/"/g, '""')}"`,
        `"${(o.telefono || 'N/A').replace(/"/g, '""')}"`,
        `"${(o.direccion || 'N/A').replace(/"/g, '""')}"`,
        `"${(o.ciudad || 'N/A').replace(/"/g, '""')}"`,
        `"${(o.codigo_postal || 'N/A').replace(/"/g, '""')}"`,
        `"${(o.estado || 'N/A').replace(/"/g, '""')}"`,
        `"${o.total}"`,
        `"${(o.metodo_pago || 'N/A').replace(/"/g, '""')}"`,
        `"${(o.estado_pago || 'Pendiente').replace(/"/g, '""')}"`
      ];
    });

    // 5. Crear el contenido CSV con UTF-8 BOM (\uFEFF)
    const contenidoCSV = "\uFEFF" + [encabezados.join(","), ...filas.map((f) => f.join(","))].join("\n");

    // 6. Generar y disparar la descarga en el navegador
    const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const fechaHoy = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `Reporte_Ordenes_Bordados_Ermy_${fechaHoy}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err: any) {
    console.error("Error al exportar órdenes:", err.message);
  }
 };

  // FUNCIÓN PARA TRAER LOS PRODUCTOS
  const fetchProductos = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        categorias (nombre),
        variaciones (*) 
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error cargando productos:", error);
    } else {
      setProductos(data || []);
    }
    setCargando(false);
  };

  // FUNCIÓN PARA TRAER LAS CATEGORÍAS
  const fetchCategorias = async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.error("Error cargando categorías:", error);
    } else {
      setCategorias(data || []);
    }
  };

  useEffect(() => {
    if (sesion) {
      fetchProductos();
      fetchCategorias();
    }
  }, [sesion]);

  // MIENTRAS VERIFICA LA SESIÓN
  if (verificandoSesion) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // SI NO HAY SESIÓN, MOSTRAR LOGIN
  if (!sesion) {
    return <LoginAdmin onLoginExitoso={fetchProductos} />;
  }

  // SI HAY SESIÓN, MOSTRAR PANEL
  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* CABECERA Y NAVEGACIÓN */}
        <div className="flex flex-col gap-4 bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-stone-200">
          
          {/* FILA SUPERIOR: Título y Acciones Móviles */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="bg-tierra/10 p-2 rounded-lg shrink-0">
                <LayoutGrid className="w-5 h-5 md:w-6 md:h-6 text-tierra" />
              </div>
              <h1 className="font-serif text-lg md:text-2xl italic text-stone-800">Panel Bordados Ermy</h1>
            </div>

            {/* BOTONES MÓVIL (Solo Iconos) */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={exportarAExcel}
                className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors"
                title="Exportar a Excel"
              >
                <Download size={18} />
              </button>
              <button
                onClick={cerrarSesion}
                className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* FILA INFERIOR: Navegación y Acciones Escritorio */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            
            {/* SELECTOR DE VISTAS (TABS) */}
            <nav className="flex w-full md:w-auto p-1 bg-stone-100 rounded-xl overflow-x-auto no-scrollbar">
              <button
                onClick={() => setVistaActiva('subir')}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3 md:px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                  vistaActiva === 'subir' 
                  ? 'bg-white text-tierra shadow-sm' 
                  : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Nuevo</span>
                <span className="hidden sm:inline">Producto</span>
              </button>
              
              <button
                onClick={() => setVistaActiva('gestionar')}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3 md:px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                  vistaActiva === 'gestionar' 
                  ? 'bg-white text-tierra shadow-sm' 
                  : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <List className="w-4 h-4 shrink-0" />
                <span>Inventario</span>
              </button>

              <button
                onClick={() => setVistaActiva('editar_web')}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3 md:px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                  vistaActiva === 'editar_web' 
                  ? 'bg-white text-tierra shadow-sm' 
                  : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Editar Web</span>
              </button>
              
              <button
                onClick={() => setVistaActiva('suscrip')}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-3 md:px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                  vistaActiva === 'suscrip' 
                  ? 'bg-white text-tierra shadow-sm' 
                  : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Suscriptores</span>
              </button>
             
            </nav>

            {/* BOTONES ESCRITORIO (Completos con texto) */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={exportarAExcel}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
                title="Descargar historial de ventas en formato Excel/CSV"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Órdenes</span>
              </button>

              <button
                onClick={cerrarSesion}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors shrink-0"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>

        {/* CONTENIDO DINÁMICO */}
<div className="transition-all duration-300">
  {vistaActiva === 'subir' && (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormSubirProductos categorias={categorias} />
    </div>
  )}

  {vistaActiva === 'gestionar' && (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <TablaGestion 
        productos={productos}
        categorias={categorias}
        refreshData={fetchProductos}
      />
    </div>
  )}

  {vistaActiva === 'editar_web' && ( // o el nombre que le tengas a la vista por defecto
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FormEditarWeb />
    </div>
  )}

  {vistaActiva === 'suscrip' && (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AdminBoletin />
    </div>
  )}

</div>

      </div>
      {/* MODAL: SIN ÓRDENES PARA EXPORTAR */}
    {modalVacio && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 transition-all">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full relative">
          
          {/* Icono animado */}
          <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-5 shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>
          
          {/* Textos */}
          <h3 className="text-center font-serif text-xl font-bold text-stone-800 mb-2">
            Sin historial de ventas
          </h3>
          <p className="text-center text-sm text-stone-500 mb-6 leading-relaxed">
            Aún no hay órdenes registradas en el sistema para exportar. Cuando realices tu primera venta, podrás descargar el reporte aquí.
          </p>
          
          {/* Botón para cerrar */}
          <button 
            onClick={() => setModalVacio(false)}
            className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold text-xs hover:bg-stone-800 transition-colors shadow-lg shadow-stone-900/10"
          >
            Entendido
          </button>
        </div>
      </div>
    )}
    </div>    
  );
}