import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface DatosNotificacion {
  ordenId: string | number;
  nombreCliente: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  total: number;
  items: Array<{
    nombre: string;
    talla: string;
    color: string;
    cantidad: number;
    precio: number;
  }>;
}

export async function enviarNotificacionNuevaVenta(datos: DatosNotificacion) {
  const adminEmail = process.env.EMAIL_ADMIN || "admin@ejemplo.com";

  // Generamos la lista HTML de productos comprados
  const listaProductosHtml = datos.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 0;">
          <strong>${item.nombre}</strong><br/>
          <small style="color: #666;">Talla: ${item.talla} | Color: ${item.color} | Cant: ${item.cantidad}</small>
        </td>
        <td style="padding: 10px 0; text-align: right; font-weight: bold;">
          $${(item.precio * item.cantidad).toLocaleString("es-MX")} MXN
        </td>
      </tr>
    `
    )
    .join("");

  try {
    const data = await resend.emails.send({
      from: "Tienda Online <onboarding@resend.dev>", // Cambia por tu dominio verificado en producción
      to: [adminEmail],
      subject: `🚨 ¡Nueva venta recibida! Orden #${datos.ordenId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #111; border-bottom: 2px solid #eee; padding-bottom: 10px;">🎉 ¡Tienes una nueva venta!</h2>
          <p><strong>Orden ID:</strong> #${datos.ordenId}</p>
          <p><strong>Total:</strong> $${datos.total.toLocaleString("es-MX")} MXN</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <h3 style="color: #444;">👤 Datos del Cliente</h3>
          <p style="margin: 4px 0;"><strong>Nombre:</strong> ${datos.nombreCliente}</p>
          <p style="margin: 4px 0;"><strong>Teléfono:</strong> ${datos.telefono}</p>
          <p style="margin: 4px 0;"><strong>Dirección:</strong> ${datos.direccion}</p>
          <p style="margin: 4px 0;"><strong>Ubicación:</strong> ${datos.ciudad}, ${datos.estado}. CP: ${datos.codigoPostal}</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <h3 style="color: #444;">🛍️ Resumen del Pedido</h3>
          <table style="width: 100%; text-align: left; border-collapse: collapse;">
            <tbody>
              ${listaProductosHtml}
            </tbody>
          </table>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error enviando email con Resend:", error);
    return { success: false, error };
  }
}