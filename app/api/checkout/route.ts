import { NextResponse } from "next/server";
import { MercadoPagoConfig } from "mercadopago";
import { createClient } from "@supabase/supabase-js"; // 💡 Importamos Supabase
import { line, picture } from "framer-motion/client";
import { Currency } from "lucide-react";

// 1. Inicializamos Stripe de forma segura
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// 2. Inicializamos Mercado Pago
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
});

// 3. Inicializamos el cliente de Supabase para el backend (con Service Role Key para saltar RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // 🚨 Asegúrate de tener esta variable en tu .env
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    // Recibimos los productos, los datos de dirección y la pasarela elegida
    const { items, datosEnvio, metodoPago, costoEnvio } = await req.json();
    const origin = req.headers.get("origin");

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
    }

    // 💡 Calculamos el total real de la orden en el servidor para mayor seguridad
    const totalProductos = items.reduce((acc: number, item: any) => acc + (item.precio * item.cantidad), 0);
    const totalOrden = totalProductos + Number(costoEnvio || 0); 
    // =================================================================
    // 🏠 PASO 1: REGISTRAR LA ORDEN MAESTRA EN SUPABASE (Tabla: ordenes)
    // =================================================================
    const { data: nuevaOrden, error: errorOrden } = await supabase
      .from("ordenes")
      .insert([
        {
          nombre_cliente: datosEnvio?.nombre || "No especificado",
          telefono: datosEnvio?.telefono || "No especificado",
          direccion: datosEnvio?.referencias 
            ? `${datosEnvio.direccion} (Ref: ${datosEnvio.referencias})` 
            : (datosEnvio?.direccion || ""),
          ciudad: datosEnvio?.ciudad || "",
          codigo_postal: datosEnvio?.codigoPostal || "",
          estado: datosEnvio?.estado || "",
          total: totalOrden,
          metodo_pago: metodoPago,
          estado_pago: "pendiente",
        },
      ])
      .select()
      .single();

    if (errorOrden || !nuevaOrden) {
      console.error("Error al crear la orden en Supabase:", errorOrden);
      return NextResponse.json({ error: "No se pudo registrar la orden base." }, { status: 500 });
    }

    // =================================================================
    // 📦 PASO 2: GUARDAR LOS DETALLES DE LOS PRODUCTOS (Tabla: detalles_orden)
    // =================================================================
    const detallesProductos = items.map((item: any) => ({
      orden_id: nuevaOrden.id,                  // Enlazamos al ID que Supabase acaba de generar
      producto_id: item.producto_id_principal,   // ID del producto padre
      variacion_id: item.id,                     // ID de la variante (talla/color)
      cantidad: Number(item.cantidad),
      precio_unitario: Number(item.precio),
      talla: item.talla || "U",
      color: item.color || "Único",
    }));

    const { error: errorDetalles } = await supabase
      .from("detalles_orden")
      .insert(detallesProductos);

    if (errorDetalles) {
      console.error("Error al guardar detalles de la orden:", errorDetalles);
      // Nota: Opcionalmente podrías borrar la orden maestra aquí si falla para no dejar basura
      return NextResponse.json({ error: "No se pudieron guardar los detalles de los productos." }, { status: 500 });
    }

    // ==========================================
    // 💳 FLUJO DE STRIPE (INTEGRADO)
    // ==========================================
    if (metodoPago === "stripe") {
      const line_items = items.map((item: any) => {
        const foto = item.imagen_url || item.imagen || "";
        const fotoLimpia = foto.replace(/[{}]/g, "").trim();

        return {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `${item.nombre} - Talla: ${item.talla || "U"} / Color: ${item.color || "Único"}`,
              images: fotoLimpia ? [fotoLimpia] : [],
            },
            unit_amount: Math.round(item.precio * 100), // En centavos
          },
          quantity: item.amount || item.cantidad,
        };
      });

      // Agregar Costo de Envío a Stripe si aplica
      if(costoEnvio && Number(costoEnvio) >0){
        line_items.push({
          price_data:{
            currency: "mxn",
            product_data: {
              name: "Costo de Envío",
              description: "Envío a domicílio",
            },
            unit_amount: Math.round(Number(costoEnvio) * 100) // En centavos
          },
          quantity: 1,
        })
      }

      // Creamos la sesión en Stripe e inyectamos el orden_id en metadata
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        metadata: {
          orden_id: nuevaOrden.id, // 💡 Clave para identificar esta compra en el Webhook de Stripe
          nombre_cliente: datosEnvio?.nombre || "No especificado",
          telefono: datosEnvio?.telefono || "No especificado",
          direccion: `${datosEnvio?.direccion}, CP ${datosEnvio?.codigoPostal}, ${datosEnvio?.ciudad}, ${datosEnvio?.estado}`,
        },
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout`,
      });

      return NextResponse.json({ url: session.url });
    }

    // ==========================================
    // 🛒 FLUJO DE MERCADO PAGO (CON DETALLES E IMÁGENES)
    // ==========================================
    if (metodoPago === "mercadopago") {
      const mpItems = items.map((item: any) => {
        // 1. Limpieza estricta de la URL de la imagen
        const foto = item.imagen_url || item.imagen || "";
        let fotoLimpia = foto.replace(/[{}]/g, "").trim();

        // 2. Si la foto es una ruta relativa, le pegamos el dominio público de producción
        if (fotoLimpia && !fotoLimpia.startsWith("http")) {
          const dominioPublico = process.env.APP_URL || origin || "https://www.ropatipicaermys.com.mx/";
          fotoLimpia = `${dominioPublico}${fotoLimpia.startsWith("/") ? "" : "/"}${fotoLimpia}`;
        }

        return {
          id: String(item.id || item.producto_id_principal),
          title: String(item.nombre), // Solo el nombre del producto
          description: `Talla: ${item.talla || "U"} / Color: ${item.color || "Único"}`, // Variantes en descripción
          picture_url: fotoLimpia.startsWith("https") ? fotoLimpia : undefined, // MP exige HTTPS
          category_id: "clothing",
          quantity: Number(item.cantidad),
          unit_price: Number(item.precio),
          currency_id: "MXN",
        };
      });

      // 3. Agregar el Costo de Envío como ítem individual
      if (costoEnvio && Number(costoEnvio) > 0) {
        mpItems.push({
          id: "costo-envio",
          title: "Costo de Envío",
          description: "Envío a domicilio",
          picture_url: undefined,
          category_id: "shipping",
          quantity: 1,
          unit_price: Number(costoEnvio),
          currency_id: "MXN",
        });
      }

      const responseMP = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: mpItems,
          payer: {
            name: datosEnvio?.nombre || "",
            phone: { number: datosEnvio?.telefono || "" },
            address: {
              street_name: datosEnvio?.direccion || "",
              zip_code: datosEnvio?.codigoPostal || "",
            },
          },
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_APP_URL || origin}/success`,
            failure: `${process.env.NEXT_PUBLIC_APP_URL || origin}/checkout`,
            pending: `${process.env.NEXT_PUBLIC_APP_URL || origin}/success`,
          },
          auto_return: "approved",
          metadata: {
            orden_id: nuevaOrden.id,
            costo_envio: String(costoEnvio || 0),
            direccion_completa: `${datosEnvio?.direccion}, CP ${datosEnvio?.codigoPostal}, ${datosEnvio?.ciudad}, ${datosEnvio?.estado}`,
          },
        }),
      });

      const preference = await responseMP.json();

      if (!responseMP.ok) {
        console.error("Error detallado de Mercado Pago:", preference);
        return NextResponse.json({ error: preference.message || "Error en Mercado Pago" }, { status: responseMP.status });
      }

      const urlRedireccion = preference.sandbox_init_point || preference.init_point;
      return NextResponse.json({ url: urlRedireccion });
    }
  } catch (err: any) {
    console.error("Error en API Checkout:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}