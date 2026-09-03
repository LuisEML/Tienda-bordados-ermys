import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// Inicializar clientes
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

    // 1. Guardar o verificar en Supabase (tabla 'suscriptores' o 'boletin')
    const { error: dbError } = await supabase
      .from("suscriptores")
      .insert([{ email }]);

    if (dbError) {
      // Si el correo ya existe (error de duplicado en Postgres code 23505)
      if (dbError.code === "23505") {
        return NextResponse.json(
          { error: "Este correo ya está registrado." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 2. Enviar correo de bienvenida con Resend
    const { error: emailError } = await resend.emails.send({
      from: "Bordados ERMY'S <onboarding@resend.dev>", // Cambia por tu dominio verificado cuando esté listo
      to: [email],
      subject: "✨ ¡Bienvenido a nuestra comunidad artesana!",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1c1917; background-color: #fafaf9;">
          <h2 style="color: #44403c;">¡Gracias por unirte! 🎉</h2>
          <p>Nos alegra mucho tenerte aquí. A partir de ahora recibirás lanzamientos exclusivos, historias de nuestros productos y promociones especiales.</p>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 20px 0;" />
          <p style="font-size: 12px; color: #78716c;">Si no solicitaste este correo, puedes ignorarlo.</p>
        </div>
      `,
    });

    if (emailError) {
      return NextResponse.json({ error: "Error enviando el correo." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno del servidor" }, { status: 500 });
  }
}