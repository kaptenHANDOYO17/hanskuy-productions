import { siteConfig } from "@/lib/site";

/** Membuat link chat WhatsApp, lengkap dengan pesan yang sudah terisi. */
export function waLink(message?: string, number: string = siteConfig.whatsapp.number) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Merapikan nomor WhatsApp pelanggan ke format internasional (hanya angka).
 * "0812-3456-7890" → "6281234567890", "+62 812…" → "62812…", "812…" → "62812…"
 * Mengembalikan null bila formatnya tidak masuk akal.
 */
export function normalizeWhatsapp(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

/** Kode pendek proyek untuk referensi di chat, mis. "#A1B2C3D4". */
export const projectCode = (id: string) => `#${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
