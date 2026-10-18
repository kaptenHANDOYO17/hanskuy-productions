"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { fmt } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/LanguageProvider";

/**
 * Penanda "Anda di sini" untuk 4 langkah pemesanan.
 * Dipakai di wizard, halaman daftar, dan dasbor agar pelanggan selalu tahu langkah berikutnya.
 */
export default function OrderSteps({
  current,
  hint,
  complete = false,
  className = "",
}: {
  current: 1 | 2 | 3 | 4;
  hint?: string;
  /** true = langkah terakhir juga sudah selesai */
  complete?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const steps = t.guide.steps;

  return (
    <div className={className}>
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">
        {fmt(t.guide.stepOf, { n: current, total: steps.length })}
      </p>
      <ol className="relative grid grid-cols-4 gap-1" aria-label={fmt(t.guide.stepOf, { n: current, total: steps.length })}>
        {/* Garis penghubung */}
        <span aria-hidden className="absolute left-[12.5%] right-[12.5%] top-3.5 h-px bg-white/10" />
        <motion.span
          aria-hidden
          className="absolute left-[12.5%] top-3.5 h-px origin-left bg-gold"
          initial={{ width: 0 }}
          animate={{ width: `${((current - 1) / (steps.length - 1)) * 75}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        {steps.map((step, i) => {
          const n = i + 1;
          const isDone = n < current || (complete && n === current);
          const isCurrent = n === current && !isDone;
          return (
            <li key={step.title} className="relative flex flex-col items-center text-center" aria-current={isCurrent ? "step" : undefined}>
              <span className="relative flex h-7 w-7 items-center justify-center">
                {isCurrent && <span className="absolute inset-0 animate-ping rounded-full bg-gold/40" />}
                <span
                  className={`relative flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium transition-colors ${
                    isDone
                      ? "border-gold bg-gold text-ink"
                      : isCurrent
                        ? "border-gold bg-ink text-gold"
                        : "border-white/15 bg-ink text-zinc-600"
                  }`}
                >
                  {isDone ? <Check size={14} strokeWidth={3} /> : n}
                </span>
              </span>
              <span className={`mt-2 text-[10px] leading-tight sm:text-xs ${isDone || isCurrent ? "text-zinc-200" : "text-zinc-600"}`}>
                {step.title}
              </span>
            </li>
          );
        })}
      </ol>
      {hint && <p className="mt-4 text-sm leading-relaxed text-zinc-300">{hint}</p>}
    </div>
  );
}
