import type { ProjectStatus, ServiceKey } from "@/lib/i18n/dictionaries";

export const SERVICE_KEYS: ServiceKey[] = ["website", "ai", "chatbot", "data", "unsure"];

/** Mengubah teks dari URL menjadi jenis layanan yang valid (atau null). */
export const parseService = (v: string | null | undefined): ServiceKey | null =>
  SERVICE_KEYS.includes(v as ServiceKey) ? (v as ServiceKey) : null;

/** Alamat dasbor yang langsung membuka formulir pesanan. */
export const orderFormPath = (service?: ServiceKey | null) =>
  service ? `/dashboard?new=1&service=${service}` : "/dashboard?new=1";

export type Currency = "IDR" | "USD";

/** Satu entri riwayat progres (tabel `project_updates`). */
export type ProjectUpdate = {
  id: number;
  created_at: string;
  status: ProjectStatus;
  progress: number;
  message: string | null;
  link: string | null;
};

/** Satu baris di tabel `projects` (lihat supabase/schema.sql). */
export type Project = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  service: ServiceKey;
  description: string;
  budget: number | null;
  currency: Currency;
  deadline: string | null;
  status: ProjectStatus;
  progress: number;
  admin_note: string | null;
  whatsapp: string | null;
  project_updates?: ProjectUpdate[];
};

/** Baris yang dilihat admin: proyek + identitas pelanggan. */
export type AdminProject = Omit<Project, "project_updates"> & {
  customer_name: string | null;
  customer_email: string | null;
};

export const PROJECT_COLUMNS =
  "id, created_at, updated_at, title, service, description, budget, currency, deadline, status, progress, admin_note, whatsapp";

/** Proyek + riwayat progresnya, dalam satu permintaan. */
export const PROJECT_WITH_UPDATES = `${PROJECT_COLUMNS}, project_updates(id, created_at, status, progress, message, link)`;

export const STATUSES: ProjectStatus[] = [
  "pending",
  "reviewing",
  "accepted",
  "in_progress",
  "completed",
  "rejected",
  "cancelled",
];

export const STATUS_STYLES: Record<ProjectStatus, string> = {
  pending: "border-gold/40 bg-gold/10 text-gold-light",
  reviewing: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  accepted: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  in_progress: "border-violet-400/40 bg-violet-400/10 text-violet-300",
  completed: "border-emerald-400/60 bg-emerald-400/20 text-emerald-200",
  rejected: "border-red-400/40 bg-red-400/10 text-red-300",
  cancelled: "border-white/10 bg-white/[0.03] text-zinc-500",
};

/** Posisi status pada tahapan Diajukan → Ditinjau → Diterima → Dikerjakan → Selesai (null = di luar alur). */
export const STAGE_INDEX: Record<ProjectStatus, number | null> = {
  pending: 0,
  reviewing: 1,
  accepted: 2,
  in_progress: 3,
  completed: 4,
  rejected: null,
  cancelled: null,
};

/** Urutkan riwayat progres dari yang terbaru. */
export function sortUpdates(updates: ProjectUpdate[] | undefined) {
  return [...(updates ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

/** Hanya izinkan link http/https (mencegah link berbahaya seperti javascript:). */
export const isSafeLink = (url: string) => /^https?:\/\/\S+$/i.test(url.trim());
