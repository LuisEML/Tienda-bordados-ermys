// app/admin/actions.ts
"use server";

import { createClient } from '@supabase/supabase-js';

export async function crearProductoCompletoAction(
  formData: FormData, 
  mainPublicUrl: string, 
  variaciones: any[]
) {
  // 1. Validar que la variable de entorno exista
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan las variables de entorno de Supabase en el servidor.");
  }

  // 2. Crear la instancia dentro de la Server Action
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const nombre = formData.get("nombre") as string;
  const precio_menudeo = parseFloat(formData.get("precio_menudeo") as string);
  const precio_mayoreo = parseFloat(formData.get("precio_mayoreo") as string);
  const categoria_id = formData.get("categoria_id") as string;
  const descripcion = formData.get("descripcion") as string;
  const destacado = formData.get("destacado") === "true";

  // Insertar Producto
  const { data: producto, error: errProducto } = await supabaseAdmin
    .from("productos")
    .insert([{
      nombre,
      precio_menudeo,
      precio_mayoreo,
      categoria_id,
      descripcion,
      destacado,
      imagen_principal_url: mainPublicUrl
    }])
    .select()
    .single();

  if (errProducto) throw new Error("Error al crear producto: " + errProducto.message);

  // Insertar Variaciones
  if (variaciones && variaciones.length > 0) {
    const variacionesConProducto = variaciones.map(v => ({
      ...v,
      producto_id: producto.id
    }));

    const { error: errVar } = await supabaseAdmin
      .from("variaciones")
      .insert(variacionesConProducto);

    if (errVar) throw new Error("Error al crear variaciones: " + errVar.message);
  }

  return producto;
}