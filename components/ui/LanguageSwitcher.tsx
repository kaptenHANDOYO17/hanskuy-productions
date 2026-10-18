"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { Lang } from "@/lib/i18n/dictionaries";

const OPTIONS: { value: Lang; label: string; full: string }[] = [
  { value: "id", label: "ID", full: "Bahasa Indonesia" },
  { value: "en", label: "EN", full: "English" },
];

export default function LanguageSwitcher({ id = "lang" }: { id?: string }) {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      role="radiogroup"
      aria-label={t.nav.switchLanguage}
      className="relative inline-flex rounded-full border border-white/10 bg-white/[0.03] p-0.5 text-xs"
    >
      {OPTIONS.map((opt) => {
        const active = lang === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            aria-label={opt.full}
            title={opt.full}
            onClick={() => setLang(opt.value)}
            className={`relative z-10 rounded-full px-3 py-1.5 font-medium tracking-wider transition-colors ${
              active ? "text-ink" : "text-zinc-400 hover:text-white"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`${id}-pill`}
                className="absolute inset-0 -z-10 rounded-full bg-gold"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
