import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Falta configurar las variables de entorno de Supabase');
    console.error('Por favor, crea un archivo .env.local con:');
    console.error('VITE_SUPABASE_URL=tu_url_de_supabase');
    console.error('VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
