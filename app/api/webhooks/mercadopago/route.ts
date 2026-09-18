import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import { enviarNotificacionNuevaVenta } from "@/lib/resend";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Leemos query params
    let type = searchParams.get("type") || searchParams.get("topic");
    let dataId = searchParams.get("data.id") || searchParams.get("id");

    // 2. Si no vienen en la URL, intentamos leerlos del body JSON
    if (!dataId) {
      try {
        const body = await req.json();
        type = type || body.type || body.topic;
        dataId = body.data?.id || body.id;
      } catch (e) {
        // El body no era un JSON válido o venía vacío
      }
    }


    // Mercado Pago notifica eventos de tipo 'payment'
    if ((type === "payment" || type === "action.payment.created") && dataId) {
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: dataId });

      // 💡 VERIFICAMOS SI EL PAGO FUE APROBADO
      if (paymentData.status === "approved") {
        const ordenId = paymentData.metadata?.orden_id;


        if (ordenId) {

          // Consultamos primero la orden para verificar si ya estaba pagada
          const { data: ordenPrevia } = await supabase
            .from("ordenes")
            .select("estado_pago")
            .eq("id", ordenId)
            .single();

        // Solo procesamos si no se ha marcado como pagado (idempotencia)
          if (ordenPrevia && ordenPrevia.estado_pago !== "pagado") {    

          // 1. Actualizamos el estado en Supabase
          const { data: orden } = await supabase
            .from("ordenes")
            .update({ estado_pago: "pagado" })
            .eq("id", ordenId)
            .select()
            .single();

          // 2. Traemos los detalles del pedido
          const { data: detalles } = await supabase
            .from("detalles_orden")
            .select("*")
            .eq("orden_id", ordenId);

          // 3. Enviamos el correo con Resend
          if (orden) {
            await enviarNotificacionNuevaVenta({
              ordenId: orden.id,
              nombreCliente: orden.nombre_cliente,
              telefono: orden.telefono,
              direccion: orden.direccion,
              ciudad: orden.ciudad,
              estado: orden.estado,
              codigoPostal: orden.codigo_postal,
              total: orden.total,
              items: (detalles || []).map((d: any) => ({
                nombre: `Producto #${d.producto_id}`,
                talla: d.talla,
                color: d.color,
                cantidad: d.cantidad,
                precio: d.precio_unitario,
              })),
            });
          }
         } 
        }
      }
    }

    // Siempre responder con 200 OK a Mercado Pago rápidamente
    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Error en Webhook Mercado Pago:", error);
    // Respondemos 200 a MP para evitar reintentos masivos si es error de parsing
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}