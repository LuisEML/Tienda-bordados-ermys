import { NextResponse } from "next/server";
import { Resend } from "resend";
import {supabase} from "@/lib/supabase";

// Inicializamos Resend con tu llave secreta
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, email, telefono, interes, metodoContacto, mensaje } = body;

    // Validación básica de seguridad
    if (!nombre || !email || !mensaje) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios por llenar." },
        { status: 400 }
      );
    }

    // --- NUEVO: 2. GUARDAR EN LA BASE DE DATOS DE SUPABASE ---
    const {error: dbError} = await supabase
        .from('mensajes_contacto')
        .insert([
            {
                nombre,
                email,
                telefono,
                interes,
                metodo_contacto: metodoContacto,
                mensaje
            }
        ])

    // Si hay un error guardando en la base de datos, lo registramos en consola
    if (dbError) {
        console.error("Error al guardar en Supabase:", dbError.message);
        // Opcional: puedes decidir si detener el proceso o continuar con el correo.
        // Aquí decidimos continuar para que al menos te llegue el correo.
    }

    // Enviamos el correo electrónico
    const data = await resend.emails.send({
      from: "Bordados Ermy Web <onboarding@resend.dev>", 
      to: "guero560mlb@gmail.com", // <-- ¡AQUÍ COLOCA TU CORREO DONDE QUIERES RECIBIRLOS!
      replyTo: email, // <--- ¡AÑADE ESTA LÍNEA!
      subject: `🧶 Nueva Solicitud de Cliente: ${interes}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; rounded: 12px;">
          <h2 style="color: #1c1917; border-bottom: 2px solid #e4e4e7; padding-bottom: 10px; font-style: italic;">
            Confecciones y Bordados Ermy
          </h2>
          <p style="font-size: 16px; color: #444;">Has recibido un nuevo mensaje desde el formulario de contacto de tu sitio web:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; background: #fafaf9; font-weight: bold; width: 30%; color: #78716c;">Nombre:</td>
              <td style="padding: 10px; background: #fafaf9; color: #1c1917;">${nombre}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #78716c;">Correo:</td>
              <td style="padding: 10px; color: #1c1917;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #fafaf9; font-weight: bold; color: #78716c;">WhatsApp/Tel:</td>
              <td style="padding: 10px; background: #fafaf9; color: #1c1917;">
                <a href="https://wa.me/${telefono.replace(/\s+/g, '')}" target="_blank">${telefono}</a> (Clic para ir a WhatsApp)
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #78716c;">Interés:</td>
              <td style="padding: 10px; color: #1c1917;"><strong>${interes}</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #fafaf9; font-weight: bold; color: #78716c;">Contacto por:</td>
              <td style="padding: 10px; background: #fafaf9; color: #1c1917;">Prefiere ser contactado por <strong>${metodoContacto}</strong></td>
            </tr>
          </table>

          <div style="margin-top: 30px; padding: 20px; background: #f5f5f4; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #444; font-size: 12px; uppercase; tracking-wider;">La idea/historia del cliente:</p>
            <p style="margin: 0; color: #1c1917; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">"${mensaje}"</p>
          </div>
          
          <p style="font-size: 11px; color: #a8a29e; text-align: center; margin-top: 30px;">
            Este es un correo automático generado por tu plataforma web.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}