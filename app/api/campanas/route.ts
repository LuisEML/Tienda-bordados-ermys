// app/api/campanas/route.ts
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
    const { asunto, mensaje } = await req.json();

    if (!asunto || !mensaje) {
      return NextResponse.json({ error: "Falta asunto o mensaje." }, { status: 400 });
    }

    const { data: suscriptores, error: dbError } = await supabase
      .from("suscriptores")
      .select("email");

    if (dbError || !suscriptores || suscriptores.length === 0) {
      return NextResponse.json({ error: "No hay suscriptores o hubo un error." }, { status: 400 });
    }

    const emailsBatch = suscriptores.map((s) => ({
      from: "Tu Marca <onboarding@resend.dev>",
      to: s.email,
      subject: asunto,
      html: `<div style="font-family: sans-serif; padding: 20px;">
              <h2>${asunto}</h2>
              <p style="white-space: pre-wrap;">${mensaje}</p>
             </div>`,
    }));

    const { error: resendError } = await resend.batch.send(emailsBatch);

    if (resendError) {
      return NextResponse.json({ error: resendError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, totalEnviados: suscriptores.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}