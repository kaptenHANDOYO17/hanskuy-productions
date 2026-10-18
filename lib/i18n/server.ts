import { cookies, headers } from "next/headers";
import type { Lang } from "./dictionaries";

/**
 * Menentukan bahasa untuk pengunjung:
 * 1. Pilihan yang pernah ia klik (disimpan di cookie), lalu
 * 2. Bahasa browser-nya (Indonesia → id, selain itu → en).
 */
export async function getLang(): Promise<Lang> {
  const saved = (await cookies()).get("lang")?.value;
  if (saved === "id" || saved === "en") return saved;

  const accept = (await headers()).get("accept-language");
  if (!accept) return "id";
  return /(^|,)\s*id\b/i.test(accept) ? "id" : "en";
}
