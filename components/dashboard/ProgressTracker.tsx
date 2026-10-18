"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { ProjectStatus } from "@/lib/i18n/dictionaries";
import { STAGE_INDEX } from "@/lib/projects";

/** Bilah progres (0–100%) + 5 tahapan proyek. */
export default function ProgressTracker({ status, progress }: { status: ProjectStatus; progress: number }) {
  const { t } = useI18n();
  const stage = STAGE_INDEX[status];
  const stages = t.dashboard.stages;
  const pct = Math.max(0, Math.min(100, progress));

  if (stage === null) return null; // ditolak / dibatalkan: cukup badge status

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-baseline justify-between text-sm">
        <span className="text-zinc-400">{t.dashboard.progress}</span>
        <span className="font-serif text-2xl text-gold">{pct}%</span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-white/[0.06]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t.dashboard.progress}
      >
        <motion.div
          className="relative h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="absolute inset-0 animate-pulse rounded-full bg-white/20" />
        </motion.div>
      </div>

      {/* Tahapan */}
      <ol className="mt-4 grid grid-cols-5 gap-1">
        {stages.map((label, i) => {
          const done = i < stage || (i === stage && status === "completed");
          const current = i === stage && status !== "completed";
          return (
            <li key={label} className="flex flex-col items-center text-center">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition-colors ${
                  done
                    ? "border-gold bg-gold text-ink"
                    : current
                      ? "border-gold bg-gold/15 text-gold ring-4 ring-gold/10"
                      : "border-white/15 text-zinc-600"
                }`}
              >
                {done ? <Check size={12} strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={`mt-1.5 text-[10px] leading-tight sm:text-xs ${
                  done || current ? "text-zinc-200" : "text-zinc-600"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
