"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Compass, LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import { useGuide } from "@/components/guide/GuideProvider";
import Logo from "@/components/ui/Logo";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { navLinks } from "@/lib/site";

export default function Navbar() {
  const { t } = useI18n();
  const { openGuide, seen } = useGuide();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // Hanya untuk tampilan tombol (Masuk / Dasbor). Keamanan tetap dicek di server.
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  const account = signedIn
    ? { href: "/dashboard", label: t.nav.dashboard, Icon: LayoutDashboard }
    : { href: "/login", label: t.nav.login, Icon: LogIn };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open ? "border-b border-white/10 bg-ink/80 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Logo className="text-xl sm:text-2xl" />

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="group relative text-sm text-zinc-400 transition-colors hover:text-white">
              {t.nav[link.key]}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => openGuide("intro")}
            className="relative inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-zinc-300 transition-colors hover:text-gold"
          >
            {!seen && <span className="absolute inset-0 animate-ping rounded-full border border-gold/50" />}
            <Compass size={15} className="text-gold" />
            {t.guide.navButton}
          </button>
          <LanguageSwitcher id="desktop" />
          <Link
            href={account.href}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-zinc-300 transition-colors hover:text-gold"
          >
            <account.Icon size={15} />
            {account.label}
          </Link>
          {signedIn ? (
            <Link
              href="/dashboard?new=1"
              className="rounded-full border border-gold/50 px-5 py-2 text-sm text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              {t.nav.startProject}
            </Link>
          ) : (
            <button
              onClick={() => openGuide("choose")}
              className="rounded-full border border-gold/50 px-5 py-2 text-sm text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              {t.nav.startProject}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitcher id="mobile" />
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-zinc-300"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-ink/95 px-6 backdrop-blur-xl md:hidden"
          >
            <ul className="py-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={() => setOpen(false)} className="block py-3 text-zinc-300 hover:text-gold">
                    {t.nav[link.key]}
                  </a>
                </li>
              ))}
              <li>
                <Link href={account.href} onClick={() => setOpen(false)} className="flex items-center gap-2 py-3 text-zinc-300 hover:text-gold">
                  <account.Icon size={16} /> {account.label}
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    setOpen(false);
                    openGuide("intro");
                  }}
                  className="flex w-full items-center gap-2 py-3 text-left text-zinc-300 hover:text-gold"
                >
                  <Compass size={16} className="text-gold" /> {t.guide.navButton}
                </button>
              </li>
              <li className="pb-4 pt-2">
                {signedIn ? (
                  <Link
                    href="/dashboard?new=1"
                    onClick={() => setOpen(false)}
                    className="block rounded-full bg-gold py-3 text-center text-sm font-medium text-ink"
                  >
                    {t.nav.startProject}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setOpen(false);
                      openGuide("choose");
                    }}
                    className="block w-full rounded-full bg-gold py-3 text-center text-sm font-medium text-ink"
                  >
                    {t.nav.startProject}
                  </button>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
