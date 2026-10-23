import { createClient } from "@supabase/supabase-js"

// Clave PÚBLICA de Supabase (publishable): está pensada para usarse en el navegador.
// Si existen las variables de entorno de Vercel se usan; si no, se usan estos valores.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://pfhwubdnifaaybjluuja.supabase.co"
const supabaseKey =
  import.meta.env.VITE_SUPABASE_KEY || "sb_publishable_kI2Ir1XOEAzH2rcWoicZog_nfz14OwA"

export const supabase = createClient(supabaseUrl, supabaseKey)
