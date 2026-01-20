import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

// Validation: Anon key should be a JWT (starts with 'ey')
if (!supabaseAnonKey.startsWith('ey')) {
    console.error('Invalid VITE_SUPABASE_ANON_KEY format. It should be a JWT starting with "ey...".');
    // We won't throw hard here to avoid breaking everything if it's a weird key format, but we'll log loudly.
    // Actually, if it causes a crash later, better to know now.
    // The "Forbidden use of secret API key" suggests the user put a secret key here (`sk-...`).
    if (supabaseAnonKey.startsWith('sk-') || supabaseAnonKey.startsWith('gsk_')) {
        throw new Error('Security Error: You have put a Secret API Key (Groq/OpenAI) into VITE_SUPABASE_ANON_KEY. This is dangerous and causes browser crashes. Please check your .env file.');
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
