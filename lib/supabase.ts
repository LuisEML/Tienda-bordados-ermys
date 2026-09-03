// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Extraemos las variables de entorno que pusiste en .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Creamos una instancia única del cliente para toda la aplicación
export const supabase = createClient(supabaseUrl, supabaseAnonKey);