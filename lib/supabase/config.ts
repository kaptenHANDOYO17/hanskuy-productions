/** Nilai dari file .env.local (lokal) atau Environment Variables (Vercel). */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Tombol "Lanjutkan dengan Google" hanya muncul bila diisi "true". */
export const isGoogleEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE === "true";

/** Cloudflare Turnstile (anti-bot, opsional). Kosongkan untuk menonaktifkan. */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
