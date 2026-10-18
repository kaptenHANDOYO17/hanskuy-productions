"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

/** Bingkai halaman akun: latar elegan + kartu di tengah. */
export default function AuthShell({
  title,
  subtitle,
  children,
  stepKey,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Ganti nilai ini untuk memicu animasi saat pindah langkah. */
  stepKey?: string;
}) {
  const { t } = useI18n();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-16 pt-28 sm:px-6">
      <div aria-hidden className="bg-grid absolute inset-0" />
      <div aria-hidden className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gold/[0.06] blur-[120px]" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-gold">
          <ArrowLeft size={14} /> {t.auth.backHome}
        </Link>

        <motion.div
          key={stepKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/10 bg-ink-50/70 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8"
        >
          <h1 className="font-serif text-3xl font-medium text-white sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-zinc-400">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </main>
  );
}

/** Kotak pesan: error (merah), sukses (emas), atau info (abu-abu). */
export function FormMessage({ type, children }: { type: "error" | "success" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "border-red-500/30 bg-red-500/10 text-red-300",
    success: "border-gold/30 bg-gold/10 text-gold-light",
    info: "border-white/10 bg-white/[0.03] text-zinc-400",
  };
  return (
    <p role={type === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles[type]}`}>
      {children}
    </p>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-zinc-600">
      <span className="h-px flex-1 bg-white/10" />
      {label}
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
