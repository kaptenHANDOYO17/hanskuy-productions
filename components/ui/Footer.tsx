"use client";

import { useI18n } from "@/lib/i18n/LanguageProvider";
import { siteConfig } from "@/lib/site";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center text-sm text-zinc-500 sm:flex-row sm:text-left">
        <p>
          © {new Date().getFullYear()} <span className="font-serif text-zinc-300">{siteConfig.name}</span>. {t.tagline}
        </p>
        <p className="font-serif italic">{t.footer.motto}</p>
      </div>
    </footer>
  );
}
