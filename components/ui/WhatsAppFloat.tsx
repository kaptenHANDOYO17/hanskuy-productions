"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { waLink } from "@/lib/whatsapp";

/** Tombol WhatsApp melayang di pojok kanan bawah, di semua halaman (kecuali panel admin). */
export default function WhatsAppFloat() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [hover, setHover] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  return (
    <motion.a
      href={waLink(t.whatsapp.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp.floating}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-3 sm:bottom-6 sm:right-6"
    >
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="hidden rounded-xl border border-white/10 bg-ink-50/95 px-4 py-2.5 text-right shadow-xl backdrop-blur sm:block"
          >
            <span className="block text-sm font-medium text-white">{t.whatsapp.floating}</span>
            <span className="block text-xs text-zinc-400">{t.whatsapp.floatingHint}</span>
          </motion.span>
        )}
      </AnimatePresence>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-25 [animation-duration:2.5s]" />
        <WhatsAppIcon size={28} className="relative" />
      </span>
    </motion.a>
  );
}
