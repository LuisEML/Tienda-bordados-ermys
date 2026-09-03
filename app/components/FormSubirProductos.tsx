"use client";
import { useState, ChangeEvent, useEffect } from "react";
import { Plus, Trash2, ImageIcon, X, AlertCircle, FolderPlus } from "lucide-react"; 
import { crearProductoCompletoAction } from "@/app/admin/actions";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Categoria {
  id: string;
  nombre: string;
  guia_tallas_hombre_url?: string;
  guia_tallas_mujer_url?: string;
}

interface TallaStock {
  talla: string;
  stock: number;
  sku: string;
}

interface GrupoColor {
  color_nombre: string;
  color_hex: string;
  imagenes: string[]; // URLs locales de preview
  filesToUpload?: File[]; // Archivos reales a subir
  tallas: TallaStock[];
}

interface FormSubirProductosProps {
  categorias: Categoria[];
  onClose?: () => void; 
}

const TALLAS_RAPIDAS = ["CH", "M", "G", "XL", "Unitalla"];

export default function FormSubirProductos({ categorias: categoriasIniciales = [], onClose }: FormSubirProductosProps) {
  const [loading, setLoading] = useState(false);
  const [isDestacado, setIsDestacado] = useState(false);
  const [cantDestacados, setCantDestacados] = useState(0);

  // --- CATEGORÍAS DINÁMICAS ---
  const [listaCategorias, setListaCategorias] = useState<Categoria[]>(categoriasIniciales);
  const [modoNuevaCategoria, setModoNuevaCategoria] = useState(false);
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState('');
  const [creandoCategoria, setCreandoCategoria] = useState(false);

  // --- ESTADOS PARA GUÍA DE TALLAS AL CREAR CATEGORÍA ---
  const [guiaHombreFile, setGuiaHombreFile] = useState<File | null>(null);
  const [guiaMujerFile, setGuiaMujerFile] = useState<File | null>(null);
  const [guiaNinosFile, setGuiaNinosFile] = useState<File | null>(null);
  const [guiaNinasFile, setGuiaNinasFile] = useState<File | null>(null);

  // --- PORTADA Y DATOS GENERALES ---
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categoriaId, setCategoriaId] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // --- ESTRUCTURA AGRUPADA POR COLOR ---
  const [gruposColor, setGruposColor] = useState<GrupoColor[]>([
    {
      color_nombre: "Multicolor",
      color_hex: "#000000",
      imagenes: [],
      filesToUpload: [],
      tallas: [{ talla: "Unitalla", stock: 1, sku: "" }]
    }
  ]);

  useEffect(() => {
    if (categoriasIniciales && categoriasIniciales.length > 0) {
      setListaCategorias(categoriasIniciales);
    }
  }, [categoriasIniciales]);

  useEffect(() => {
    const checkDestacados = async () => {
      const { count } = await supabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .eq('destacado', true);
      
      setCantDestacados(count || 0);
    };
    checkDestacados();
  }, []);

  // --- MANEJO DE GRUPOS DE COLOR ---
  const agregarGrupoColor = () => {
    setGruposColor([
      ...gruposColor,
      {
        color_nombre: "",
        color_hex: "#000000",
        imagenes: [],
        filesToUpload: [],
        tallas: [{ talla: "Unitalla", stock: 1, sku: "" }]
      }
    ]);
  };

  const eliminarGrupoColor = (colorIndex: number) => {
    if (gruposColor.length === 1) return;
    setGruposColor(gruposColor.filter((_, i) => i !== colorIndex));
  };

  const actualizarColor = (colorIndex: number, campo: 'color_nombre' | 'color_hex', valor: string) => {
    const nuevos = [...gruposColor];
    nuevos[colorIndex][campo] = valor;
    setGruposColor(nuevos);
  };

  // --- MANEJO DE FOTOS POR COLOR ---
  const handleAgregarFotosColor = (colorIndex: number, e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    const nuevos = [...gruposColor];
    
    const newPreviews = filesArray.map(f => URL.createObjectURL(f));
    nuevos[colorIndex].imagenes = [...(nuevos[colorIndex].imagenes || []), ...newPreviews];
    nuevos[colorIndex].filesToUpload = [...(nuevos[colorIndex].filesToUpload || []), ...filesArray];

    setGruposColor(nuevos);
  };

  const quitarFotoColor = (colorIndex: number, imgIndex: number) => {
    const nuevos = [...gruposColor];
    nuevos[colorIndex].imagenes = nuevos[colorIndex].imagenes.filter((_, i) => i !== imgIndex);
    if (nuevos[colorIndex].filesToUpload) {
      nuevos[colorIndex].filesToUpload = nuevos[colorIndex].filesToUpload?.filter((_, i) => i !== imgIndex);
    }
    setGruposColor(nuevos);
  };

  // --- MANEJO DE TALLAS DENTRO DE UN COLOR ---
  const agregarTallaAColor = (colorIndex: number, tallaNombre: string = "") => {
    const nuevos = [...gruposColor];
    nuevos[colorIndex].tallas.push({ talla: tallaNombre, stock: 1, sku: "" });
    setGruposColor(nuevos);
  };

  const eliminarTallaDeColor = (colorIndex: number, tallaIndex: number) => {
    const nuevos = [...gruposColor];
    if (nuevos[colorIndex].tallas.length === 1) return;
    nuevos[colorIndex].tallas = nuevos[colorIndex].tallas.filter((_, i) => i !== tallaIndex);
    setGruposColor(nuevos);
  };

  const actualizarTallaValores = (
    colorIndex: number, 
    tallaIndex: number, 
    campo: keyof TallaStock, 
    valor: any
  ) => {
    const nuevos = [...gruposColor];
    let valorFinal = valor;

    if (campo === "stock") {
      const parsed = parseInt(valor);
      Math.max(0, parsed)
      valorFinal = isNaN(parsed) ? 0 : parsed;
    }

    nuevos[colorIndex].tallas[tallaIndex] = {
      ...nuevos[colorIndex].tallas[tallaIndex],
      [campo]: valorFinal
    };
    setGruposColor(nuevos);
  };

  // --- CATEGORÍAS ---
  const handleCrearCategoria = async () => {
    if (!nuevaCategoriaNombre.trim()) return;
    setCreandoCategoria(true);

    try {
      let guiaHombreUrl = null;
      let guiaMujerUrl = null;
      let guiaNinosUrl = null;
      let guiaNinasUrl = null;

      // Subir cada guía si se seleccionó archivo
      if (guiaHombreFile) {
        const name = `${Date.now()}-guia-hombre-${guiaHombreFile.name}`;
        await supabase.storage.from('fotos-productos').upload(name, guiaHombreFile);
        guiaHombreUrl = supabase.storage.from('fotos-productos').getPublicUrl(name).data.publicUrl;
      }

      if (guiaMujerFile) {
        const name = `${Date.now()}-guia-mujer-${guiaMujerFile.name}`;
        await supabase.storage.from('fotos-productos').upload(name, guiaMujerFile);
        guiaMujerUrl = supabase.storage.from('fotos-productos').getPublicUrl(name).data.publicUrl;
      }

      if (guiaNinosFile) {
        const name = `${Date.now()}-guia-ninos-${guiaNinosFile.name}`;
        await supabase.storage.from('fotos-productos').upload(name, guiaNinosFile);
        guiaNinosUrl = supabase.storage.from('fotos-productos').getPublicUrl(name).data.publicUrl;
      }

      if (guiaNinasFile) {
        const name = `${Date.now()}-guia-ninas-${guiaNinasFile.name}`;
        await supabase.storage.from('fotos-productos').upload(name, guiaNinasFile);
        guiaNinasUrl = supabase.storage.from('fotos-productos').getPublicUrl(name).data.publicUrl;
      }

      // Insertar en la tabla categorias
      const slug = nuevaCategoriaNombre.toLowerCase().trim().replace(/\s+/g, '-');
      const { data, error } = await supabase
        .from('categorias')
        .insert([{ 
          nombre: nuevaCategoriaNombre.trim(), 
          slug,
          guia_tallas_hombre_url: guiaHombreUrl,
          guia_tallas_mujer_url: guiaMujerUrl,
          guia_tallas_ninos_url: guiaNinosUrl,
          guia_tallas_ninas_url: guiaNinasUrl
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Categoría con guías de tallas creada con éxito");
      setListaCategorias(prev => [...prev, data]);
      setCategoriaId(data.id);
      
      // Limpiar campos
      setNuevaCategoriaNombre('');
      setGuiaHombreFile(null);
      setGuiaMujerFile(null);
      setGuiaNinosFile(null);
      setGuiaNinasFile(null);
      setModoNuevaCategoria(false);

    } catch (err: any) {
      toast.error("Error al crear categoría: " + err.message);
    } finally {
      setCreandoCategoria(false);
    }
  };

  // --- PORTADA PRINCIPAL ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const quitarFoto = () => {
    setPreviewUrl(null);
    const fileInput = document.getElementById('imagen_file') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // --- SUBMIT FINAL (DESGLOSA Y SUBE A SUPABASE) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const mainFile = formData.get("imagen_file") as File;

    try {
      if (!mainFile || mainFile.size === 0) throw new Error("Debes seleccionar una imagen principal");
      if (!categoriaId) throw new Error("Debes seleccionar una categoría");

      // 1. Subir Foto Principal
      const mainFileName = `${Date.now()}-main-${mainFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('fotos-productos')
        .upload(mainFileName, mainFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl: mainPublicUrl } } = supabase.storage
        .from('fotos-productos')
        .getPublicUrl(mainFileName);

      // 2. Procesar imágenes por color y aplanar variaciones + miniaturas
      const variacionesAInsertar = [];
      // 💡 Arreglo temporal para guardar los datos de las imágenes secundarias por color
      const imagenesPorColorParaBD: { url: string; color_hex: string }[] = [];

      for (const grupo of gruposColor) {
        const uploadedUrls: string[] = [];

        // Subir fotos del color actual
        if (grupo.filesToUpload && grupo.filesToUpload.length > 0) {
          for (const file of grupo.filesToUpload) {
            const fileName = `${Date.now()}-var-${file.name}`;
            const { error: errVar } = await supabase.storage
              .from('fotos-productos')
              .upload(fileName, file);

            if (!errVar) {
              const { data: { publicUrl } } = supabase.storage
                .from('fotos-productos')
                .getPublicUrl(fileName);
              
              uploadedUrls.push(publicUrl);

              // 💡 Acumulamos la imagen con su color_hex para guardarla en imagenes_producto
              imagenesPorColorParaBD.push({
                url: publicUrl,
                color_hex: grupo.color_hex
              });
            }
          }
        }

        // Crear una variación individual para cada TALLA de este COLOR
        for (const t of grupo.tallas) {
          variacionesAInsertar.push({
            talla: t.talla || "Unitalla",
            color_nombre: grupo.color_nombre,
            color_hex: grupo.color_hex,
            stock: t.stock,
            sku: t.sku,
            imagenes: uploadedUrls // Mantiene compatibilidad con el array legacy en variaciones
          });
        }
      }

      // 3. FormData extra para Server Action
      formData.append("destacado", isDestacado.toString());
      formData.append("categoria_id", categoriaId);
      formData.append("descripcion", descripcion);

      // 💡 La Server Action debe retornar el producto creado (o al menos su ID)
      const productoCreado = await crearProductoCompletoAction(
        formData, 
        mainPublicUrl, 
        variacionesAInsertar
      );

      // 4. 🚀 INSERTAR LAS MINIATURAS EN LA TABLA 'imagenes_producto'
      // (Asegúrate de que 'productoCreado' retorne el { id: ... } o ajústalo si tu action devuelve sólo el id)
      const productoId = productoCreado?.id || productoCreado;

      if (productoId && imagenesPorColorParaBD.length > 0) {
        const registrosAInsertar = imagenesPorColorParaBD.map((item) => ({
          producto_id: productoId,
          imagen_url: item.url,
          color_hex: item.color_hex
        }));

        const { error: errImgBD } = await supabase
          .from("imagenes_producto")
          .insert(registrosAInsertar);

          if (errImgBD) {
            console.error("Error al guardar en imagenes_producto:", errImgBD.message);
          }
        }
      
      toast.success("¡Producto publicado correctamente!");
      form.reset();
      setPreviewUrl(null);
      setCategoriaId('');
      setDescripcion('');
      setGruposColor([{
        color_nombre: "Multicolor",
        color_hex: "#000000",
        imagenes: [],
        filesToUpload: [],
        tallas: [{ talla: "Unitalla", stock: 1, sku: "" }]
      }]);
      setIsDestacado(false);

      if (onClose) onClose();

    } catch (err: any) {
      toast.error(err.message || "Error al subir el producto");
    } finally {
      setLoading(false);
    }
  };

  const limiteDestacadosAlcanzado = cantDestacados >= 3;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-stone-200">
      
      {/* INFORMACIÓN GENERAL */}
      <div className="space-y-6">
        <h3 className="font-serif text-xl italic text-stone-700 border-b border-stone-100 pb-2">Información General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Nombre del Producto</label>
            <input name="nombre" required className="w-full p-3 border border-stone-200 rounded-lg outline-none focus:border-stone-800 transition-all text-sm" placeholder="Ej. Huipil Bordado Tradicional" />
          </div>

          {/* SELECTOR DE CATEGORÍAS */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Categoría</label>
              <button
                type="button"
                onClick={() => setModoNuevaCategoria(!modoNuevaCategoria)}
                className="text-[10px] font-bold text-stone-800 hover:underline flex items-center gap-1"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                {modoNuevaCategoria ? "Seleccionar existente" : "+ Nueva Categoría"}
              </button>
            </div>

            {modoNuevaCategoria ? (
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-4">
                {/* Nombre de la categoría */}
                <div>
                  <label className="text-[9px] font-bold text-stone-500 uppercase block mb-1">Nombre de la Categoría</label>
                  <input
                    type="text"
                    placeholder="Ej. Blusas y Huipiles"
                    value={nuevaCategoriaNombre}
                    onChange={(e) => setNuevaCategoriaNombre(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-800"
                  />
                </div>

                {/* Inputs para subida de Guías de Tallas (Todas Opcionales) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200/60">
                  <div>
                    <label className="text-[8px] font-bold text-stone-400 uppercase block mb-1">Guía Hombre (Opcional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setGuiaHombreFile(e.target.files?.[0] || null)}
                      className="text-[10px] text-stone-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-bold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300 cursor-pointer w-full"
                    />
                  </div>

                  <div>
                    <label className="text-[8px] font-bold text-stone-400 uppercase block mb-1">Guía Mujer (Opcional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setGuiaMujerFile(e.target.files?.[0] || null)}
                      className="text-[10px] text-stone-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-bold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300 cursor-pointer w-full"
                    />
                  </div>

                  <div>
                    <label className="text-[8px] font-bold text-stone-400 uppercase block mb-1">Guía Niños (Opcional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setGuiaNinosFile(e.target.files?.[0] || null)}
                      className="text-[10px] text-stone-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-bold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300 cursor-pointer w-full"
                    />
                  </div>

                  <div>
                    <label className="text-[8px] font-bold text-stone-400 uppercase block mb-1">Guía Niñas (Opcional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setGuiaNinasFile(e.target.files?.[0] || null)}
                      className="text-[10px] text-stone-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-bold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300 cursor-pointer w-full"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCrearCategoria}
                  disabled={creandoCategoria || !nuevaCategoriaNombre.trim()}
                  className="w-full py-2 bg-stone-800 text-white rounded-lg text-xs font-bold hover:bg-stone-900 transition-all disabled:opacity-50"
                >
                  {creandoCategoria ? "Guardando Categoría..." : "Guardar Categoría y Seleccionar"}
                </button>
              </div>
            ) : (
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                required
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm outline-none focus:border-stone-800 cursor-pointer"
              >
                <option value="">Selecciona una categoría...</option>
                {listaCategorias && listaCategorias.length > 0 ? (
                  listaCategorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))
                ) : (
                  <option disabled value="">No hay categorías registradas</option>
                )}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Precios</label>
            <div className="flex gap-2">
              <input name="precio_menudeo" type="number" step="0.01" min="0" required className="w-1/2 p-3 border border-stone-200 rounded-lg text-sm" placeholder="Menudeo ($)" />
              <input name="precio_mayoreo" type="number" step="0.01" min="0" required className="w-1/2 p-3 border border-stone-200 rounded-lg text-sm" placeholder="Mayoreo ($)" />
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Descripción detallada</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Escribe detalles de la prenda o bordado..."
              rows={3}
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-sm outline-none focus:border-stone-800 transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* PORTADA PRINCIPAL */}
      <div className="space-y-4">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400">Imagen Principal (Portada de Catálogo)</label>
        <div className="flex items-center justify-center w-full">
          <input id="imagen_file" name="imagen_file" type="file" accept="image/*" required={!previewUrl} className="hidden" onChange={handleFileChange} />
          {previewUrl ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-stone-100">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button type="button" onClick={quitarFoto} className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-red-500 shadow-md backdrop-blur-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <label htmlFor="imagen_file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-stone-200 border-dashed rounded-2xl cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors">
              <ImageIcon className="w-8 h-8 text-stone-400 mb-2" />
              <p className="text-xs text-stone-500 font-medium">Haz clic para subir la foto principal del producto</p>
            </label>
          )}
        </div>
      </div>

      {/* SECCIÓN AGRUPADA POR COLORES Y SUS TALLAS */}
      <div className="border-t border-stone-100 pt-6 md:pt-8">
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h3 className="font-serif text-lg md:text-xl italic text-stone-700">Variantes por Color y Tallas</h3>
            <p className="text-[10px] md:text-[11px] text-stone-400">Agrega los colores disponibles, sus fotos de galería y asigna las tallas con su stock.</p>
          </div>
          <button 
            type="button" 
            onClick={agregarGrupoColor} 
            className="w-full sm:w-auto justify-center text-[10px] font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-2.5 rounded-xl transition-all flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> AÑADIR OTRO COLOR
          </button>
        </div>

        <div className="space-y-6 md:space-y-8">
          {gruposColor.map((grupo, colorIdx) => (
            <div key={colorIdx} className="bg-stone-50 p-4 sm:p-6 rounded-2xl border border-stone-200 space-y-5">
              
              {/* CABECERA DEL COLOR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input 
                    type="color" 
                    value={grupo.color_hex} 
                    onChange={(e) => actualizarColor(colorIdx, 'color_hex', e.target.value)}
                    className="w-10 h-10 rounded-xl border-none cursor-pointer bg-transparent p-0 shrink-0"
                  />
                  <div className="flex-1">
                    <label className="text-[8px] font-bold text-stone-400 uppercase block">Nombre del Color</label>
                    <input 
                      placeholder="Ej. Rojo Carmín" 
                      value={grupo.color_nombre} 
                      onChange={(e) => actualizarColor(colorIdx, 'color_nombre', e.target.value)}
                      className="w-full bg-transparent border-b border-stone-300 py-0.5 text-sm md:text-base font-medium outline-none focus:border-stone-800" 
                    />
                  </div>
                </div>

                {gruposColor.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => eliminarGrupoColor(colorIdx)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-bold self-end sm:self-auto pt-1 sm:pt-0"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar este Color
                  </button>
                )}
              </div>

              {/* GALERÍA DE FOTOS COMPARTIDA PARA ESTE COLOR */}
              <div>
                <label className="text-[9px] font-bold text-stone-400 uppercase mb-2 block truncate">
                  Galería de Fotos para el color {grupo.color_nombre || "seleccionado"}
                </label>
                <div className="flex flex-wrap gap-2.5 items-center">
                  {grupo.imagenes && grupo.imagenes.map((imgUrl, imgIdx) => (
                    <div key={imgIdx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-stone-200 group shadow-xs">
                      <img src={imgUrl} alt={`Vista ${imgIdx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => quitarFotoColor(colorIdx, imgIdx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <label className="flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 border-2 border-stone-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-stone-100 transition-colors">
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />
                    <span className="text-[8px] sm:text-[9px] font-bold text-stone-400 uppercase mt-0.5 text-center leading-tight">Subir Foto</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={(e) => handleAgregarFotosColor(colorIdx, e)} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* TABLA / FILAS DE TALLAS PARA ESTE COLOR */}
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider truncate">
                    Tallas y Existencias ({grupo.color_nombre || 'sin nombre'})
                  </label>
                  
                  {/* Botones rápidos de agregar talla (con Scroll Horizontal en Móvil) */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    <span className="text-[9px] text-stone-400 mr-1 shrink-0 font-medium">Rápido:</span>
                    {TALLAS_RAPIDAS.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => agregarTallaAColor(colorIdx, t)}
                        className="px-2 py-0.5 text-[9px] font-bold bg-stone-100 hover:bg-stone-800 hover:text-white rounded transition-colors text-stone-600 shrink-0"
                      >
                        + {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {grupo.tallas.map((tallaItem, tallaIdx) => (
                    <div key={tallaIdx} className="grid grid-cols-12 gap-2 items-end bg-stone-50/70 p-2.5 rounded-xl border border-stone-100">
                      
                      {/* TALLA (Columna 4 en móvil, 4 en escritorio) */}
                      <div className="col-span-4 sm:col-span-4">
                        <span className="text-[8px] font-bold text-stone-400 uppercase block mb-1">Talla</span>
                        <input
                          type="text"
                          placeholder="Ej. M, G..."
                          value={tallaItem.talla}
                          onChange={(e) => actualizarTallaValores(colorIdx, tallaIdx, 'talla', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg p-1.5 text-xs font-semibold outline-none focus:border-stone-800"
                        />
                      </div>

                      {/* SKU (Columna 4 en móvil, 4 en escritorio) */}
                      <div className="col-span-4 sm:col-span-4">
                        <span className="text-[8px] font-bold text-stone-400 uppercase block mb-1 truncate">SKU (Opc.)</span>
                        <input
                          type="text"
                          placeholder="ROJO-M"
                          value={tallaItem.sku}
                          onChange={(e) => actualizarTallaValores(colorIdx, tallaIdx, 'sku', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg p-1.5 text-xs outline-none focus:border-stone-800"
                        />
                      </div>

                      {/* STOCK (Columna 3 en móvil, 3 en escritorio) */}
                      <div className="col-span-3 sm:col-span-3">
                        <span className="text-[8px] font-bold text-stone-400 uppercase block mb-1">Stock</span>
                        <input
                          type="number"
                          min="0"
                          value={tallaItem.stock}
                          onChange={(e) => actualizarTallaValores(colorIdx, tallaIdx, 'stock', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg p-1.5 text-xs font-bold text-center outline-none focus:border-stone-800"
                        />
                      </div>

                      {/* ELIMINAR TALLA (Columna 1) */}
                      <div className="col-span-1 flex justify-center pb-1">
                        {grupo.tallas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => eliminarTallaDeColor(colorIdx, tallaIdx)}
                            className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                            title="Eliminar fila"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => agregarTallaAColor(colorIdx, "")}
                  className="text-xs text-stone-600 font-bold hover:underline flex items-center gap-1 pt-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Añadir otra medida/talla a este color
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* CHECKBOX DESTACADOS */}
      <div className={`flex flex-col gap-2 p-4 rounded-xl border transition-all ${
        limiteDestacadosAlcanzado && !isDestacado ? 'bg-amber-50 border-amber-200' : 'bg-stone-50 border-stone-100'
      }`}>
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={isDestacado} 
            disabled={limiteDestacadosAlcanzado && !isDestacado}
            onChange={(e) => setIsDestacado(e.target.checked)} 
            className="w-4 h-4 accent-stone-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed" 
          />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            limiteDestacadosAlcanzado && !isDestacado ? 'text-amber-800' : 'text-stone-600'
          }`}>
            Destacar en la página de inicio
          </span>
        </div>

        {limiteDestacadosAlcanzado && !isDestacado && (
          <p className="text-xs text-amber-700 flex items-center gap-1.5 pl-7">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Ya existen 3 piezas destacadas en el inicio. Quita una desde la gestión de inventario para poder marcar esta.
          </p>
        )}
      </div>

      <button disabled={loading} className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all disabled:bg-stone-300 shadow-xl">
        {loading ? "Publicando pieza..." : "Publicar Producto"}
      </button>
    </form>
  );
}