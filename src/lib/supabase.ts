import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

// Evita crash em runtime quando o .env ainda não foi configurado; a UI mostra
// uma tela de configuração nesse caso (ver App.tsx).
export const supabase = createClient(
  url || 'http://localhost:54321',
  anonKey || 'anon-key-nao-configurada',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
