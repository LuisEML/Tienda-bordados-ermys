import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import { createClient } from "@supabase/supabase-js";
import { enviarNotificacionNuevaVenta } from "@/lib/resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Error al verificar signature del Webhook:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 💡 SE DISPARA CUANDO EL PAGO FUE APROBADO CON ÉXITO
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const ordenId = session.metadata?.orden_id; // recuperamos el orden_id de la metadata

    if (ordenId) {
      // 1. Cambiamos el estado de la orden en Supabase
      const { data: orden, error } = await supabase
        .from("ordenes")
        .update({ estado_pago: "pagado" })
        .eq("id", ordenId)
        .select()
        .single();

      if (error) {
        console.error("Error al actualizar la orden en Supabase:", error);
      }

      // 2. Traemos los detalles de los productos para incluirlos en el correo
      const { data: detalles } = await supabase
        .from("detalles_orden")
        .select("*")
        .eq("orden_id", ordenId);

      // 3. Enviamos el correo de notificación al administrador
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

  return NextResponse.json({ received: true });
}