/** Pemeriksaan input di sisi browser — memberi pesan jelas SEBELUM data dikirim. */

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

/** Minimal 8 karakter, ada huruf & angka, maksimal 72 (batas teknis enkripsi sandi). */
export const isValidPassword = (p: string) =>
  p.length >= 8 && p.length <= 72 && /[A-Za-z]/.test(p) && /\d/.test(p);

/** Skor 1–4 untuk indikator kekuatan sandi. */
export function passwordScore(p: string): number {
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) score++;
  return Math.min(4, Math.max(1, score));
}

/** Hanya angka; Supabase bisa diatur 6–10 digit. */
export const cleanCode = (code: string) => code.replace(/\D/g, "").slice(0, 10);
export const isValidCode = (code: string) => /^\d{6,10}$/.test(code);

/** Mencegah "open redirect": hanya izinkan alamat di dalam website ini sendiri. */
export function safeNext(next: string | null | undefined, fallback = "/dashboard") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
