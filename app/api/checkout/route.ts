import { NextResponse } from "next/server";
import { MercadoPagoConfig } from "mercadopago";
import { createClient } from "@supabase/supabase-js"; // 💡 Importamos Supabase

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
    const { items, datosEnvio, metodoPago } = await req.json();
    const origin = req.headers.get("origin");

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
    }

    // 💡 Calculamos el total real de la orden en el servidor para mayor seguridad
    const totalOrden = items.reduce((acc: number, item: any) => acc + (item.precio * item.cantidad), 0);

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
    // 🛒 FLUJO DE MERCADO PAGO (INTEGRADO)
    // ==========================================
    if (metodoPago === "mercadopago") {
      const mpItems = items.map((item: any) => {
        const foto = item.imagen_url || item.imagen || "";
        const fotoLimpia = foto.replace(/[{}]/g, "").trim();

        return {
          id: item.id,
          title: `${item.nombre} (Talla: ${item.talla || "U"})`,
          description: `Color: ${item.color || "Único"}`,
          picture_url: fotoLimpia || undefined,
          category_id: "clothing",
          quantity: Number(item.cantidad),
          unit_price: Number(item.precio),
          currency_id: "MXN",
        };
      });

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
            phone: {
              number: datosEnvio?.telefono || "",
            },
            address: {
              street_name: datosEnvio?.direccion || "",
              zip_code: datosEnvio?.codigoPostal || "",
            },
          },
          back_urls: {
            success: `${origin}/success`,
            failure: `${origin}/checkout`,
            pending: `${origin}/success`,
          },
          metadata: {
            orden_id: nuevaOrden.id, // 💡 Clave para identificar esta compra en el Webhook de Mercado Pago
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