import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // 1. Guardar en Supabase
    const { error: dbError } = await supabase
      .from("suscriptores")
      .insert([{ email }]);

    if (dbError) {
      if (dbError.code === "23505") {
        return NextResponse.json(
          { error: "Este correo ya está registrado." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 2. Enviar correo con Resend
    const { error: emailError } = await resend.emails.send({
      from: "Confecciones ERMYS <contacto@ropatipicaermys.com.mx>",
      to: [email],
      subject: "¡Bienvenido a nuestra comunidad artesana!",
      text: `¡Gracias por unirte a Confecciones ERMY'S!\n\nNos alegra mucho tenerte aquí. A partir de ahora recibirás lanzamientos exclusivos, historias de nuestros productos y promociones especiales.\n\nSi deseas dejar de recibir correos, puedes responder a este mensaje.`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f5f5f4; padding: 20px 0;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 550px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e7e5e4; overflow: hidden; padding: 32px 24px;">
                    <tr>
                      <td style="color: #1c1917; font-size: 16px; line-height: 1.6;">
                        <h2 style="color: #292524; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">¡Gracias por unirte! 🎉</h2>
                        <p style="margin: 0 0 16px 0; color: #44403c;">Nos alegra mucho tenerte aquí. A partir de ahora recibirás lanzamientos exclusivos, historias de nuestros productos y promociones especiales.</p>
                        
                        <div style="border-top: 1px solid #f5f5f4; margin: 24px 0;"></div>
                        
                        <p style="font-size: 12px; color: #a8a29e; margin: 0; text-align: center;">
                          Recibiste este correo porque te suscribiste en <strong>ropatipicaermys.com.mx</strong>.<br>
                          Si deseas dejar de recibir correos, puedes responder a este mensaje.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Resend Error:", emailError);
      return NextResponse.json({ error: "Error enviando el correo." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno del servidor" }, { status: 500 });
  }
}