"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ClipboardList,
  HelpCircle,
  LineChart,
  MessagesSquare,
  MonitorSmartphone,
  MousePointer2,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-react";
import OrderSteps from "@/components/guide/OrderSteps";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { fmt, type ServiceKey } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { waLink } from "@/lib/whatsapp";

export type GuideScreen = "intro" | "choose" | "account";

const SERVICE_ICONS: Record<ServiceKey, LucideIcon> = {
  website: MonitorSmartphone,
  ai: BrainCircuit,
  chatbot: MessagesSquare,
  data: BarChart3,
  unsure: HelpCircle,
};
const STEP_ICONS: LucideIcon[] = [MousePointer2, UserPlus, ClipboardList, LineChart];
const ORDER: GuideScreen[] = ["intro", "choose", "account"];
const EASE = [0.22, 1, 0.36, 1] as const;

/** Tombol utama yang "menyala" — menunjukkan dengan jelas tombol mana yang harus ditekan. */
function GlowButton({
  children,
  onClick,
  href,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}) {
  const cls =
    "group relative inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink shadow-[0_0_40px_-8px_rgba(212,175,55,0.7)] transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none";
  const glow = !disabled && (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute -inset-1 rounded-full border-2 border-gold/60"
      animate={{ opacity: [0.9, 0, 0.9], scale: [1, 1.08, 1] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
  const pointer = !disabled && (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute -bottom-3 right-6 text-white drop-shadow-lg"
      animate={{ y: [0, -6, 0], x: [0, -4, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <MousePointer2 size={22} fill="currentColor" className="rotate-[-10deg]" />
    </motion.span>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={cls}>
        {glow}
        <span className="relative inline-flex items-center gap-2">{children}</span>
        {pointer}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls}>
      {glow}
      <span className="relative inline-flex items-center gap-2">{children}</span>
      {pointer}
    </button>
  );
}

export default function OrderGuide({
  open,
  initialScreen,
  signedIn,
  onClose,
}: {
  open: boolean;
  initialScreen: GuideScreen;
  signedIn: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const g = t.guide;
  const [screen, setScreen] = useState<GuideScreen>(initialScreen);
  const [direction, setDirection] = useState(1);
  const [service, setService] = useState<ServiceKey | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Setiap kali dibuka, mulai dari layar yang diminta.
  useEffect(() => {
    if (open) {
      setScreen(initialScreen);
      setDirection(1);
    }
  }, [open, initialScreen]);

  // Kunci scroll halaman + tombol Esc untuk menutup + fokus ke dialog.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const go = (next: GuideScreen) => {
    setDirection(ORDER.indexOf(next) >= ORDER.indexOf(screen) ? 1 : -1);
    setScreen(next);
  };

  const chosen = service ?? "unsure";
  const dashboardTarget = `/dashboard?new=1&service=${chosen}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="guide"
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Latar gelap */}
          <motion.button
            aria-label={g.close}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
            tabIndex={-1}
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto overflow-x-hidden rounded-t-3xl border border-white/10 bg-ink-50 shadow-2xl shadow-black/60 outline-none sm:rounded-3xl"
          >
            <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />

            <button
              onClick={onClose}
              aria-label={g.close}
              className="absolute right-4 top-4 z-10 rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="relative p-6 sm:p-8">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                {/* ---------- 1. PENGANTAR: 4 langkah ---------- */}
                {screen === "intro" && (
                  <motion.section
                    key="intro"
                    custom={direction}
                    initial={{ x: 40 * direction, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -40 * direction, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <p className="text-xs uppercase tracking-[0.25em] text-gold">{g.introEyebrow}</p>
                    <h2 id="guide-title" className="mt-3 pr-8 font-serif text-3xl font-medium leading-tight text-white sm:text-4xl">
                      {g.introTitle}
                    </h2>
                    <p className="mt-3 text-zinc-400">{g.introBody}</p>

                    <ol className="relative mt-8 space-y-5">
                      <motion.span
                        aria-hidden
                        className="absolute left-[19px] top-5 w-px origin-top bg-gradient-to-b from-gold via-gold/60 to-gold/10"
                        style={{ bottom: 20 }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
                      />
                      {g.steps.map((step, i) => {
                        const Icon = STEP_ICONS[i];
                        return (
                          <motion.li
                            key={step.title}
                            className="relative flex items-start gap-4"
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 + i * 0.35, duration: 0.5, ease: EASE }}
                          >
                            <motion.span
                              className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-ink text-gold"
                              initial={{ scale: 0.4 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.35 + i * 0.35, type: "spring", stiffness: 300, damping: 16 }}
                            >
                              <Icon size={18} />
                            </motion.span>
                            <div className="pt-1">
                              <p className="font-medium text-white">
                                <span className="mr-2 text-gold">{i + 1}.</span>
                                {step.title}
                              </p>
                              <p className="mt-0.5 text-sm text-zinc-500">{step.desc}</p>
                            </div>
                          </motion.li>
                        );
                      })}
                    </ol>

                    <motion.div
                      className="mt-9 space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.8, duration: 0.5 }}
                    >
                      <GlowButton onClick={() => go("choose")}>
                        {g.start} <ArrowRight size={16} />
                      </GlowButton>
                      <button onClick={onClose} className="w-full text-center text-sm text-zinc-500 transition-colors hover:text-white">
                        {g.skip}
                      </button>
                    </motion.div>
                  </motion.section>
                )}

                {/* ---------- 2. PILIH JASA ---------- */}
                {screen === "choose" && (
                  <motion.section
                    key="choose"
                    custom={direction}
                    initial={{ x: 40 * direction, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -40 * direction, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <OrderSteps current={1} className="pr-8" />
                    <h2 id="guide-title" className="mt-7 font-serif text-3xl font-medium leading-tight text-white">
                      {g.chooseTitle}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">{g.chooseBody}</p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={g.chooseTitle}>
                      {(Object.keys(t.serviceOptions) as ServiceKey[]).map((key, i) => {
                        const Icon = SERVICE_ICONS[key];
                        const active = service === key;
                        return (
                          <motion.button
                            key={key}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setService(key)}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className={`relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                              key === "unsure" ? "sm:col-span-2" : ""
                            } ${
                              active
                                ? "border-gold bg-gold/10 shadow-[0_0_30px_-12px_rgba(212,175,55,0.8)]"
                                : "border-white/10 bg-white/[0.02] hover:border-white/25"
                            }`}
                          >
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                active ? "bg-gold text-ink" : "bg-white/[0.04] text-zinc-400"
                              }`}
                            >
                              <Icon size={18} />
                            </span>
                            <span className="min-w-0 pr-5">
                              <span className="block text-sm font-medium text-white">{t.serviceOptions[key]}</span>
                              <span className="mt-0.5 block text-xs leading-snug text-zinc-500">{g.serviceHints[key]}</span>
                            </span>
                            <AnimatePresence>
                              {active && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-ink"
                                >
                                  <Check size={12} strokeWidth={3} />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="mt-7 flex items-center gap-3">
                      <button
                        onClick={() => go("intro")}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-3 text-sm text-zinc-400 transition-colors hover:text-white"
                      >
                        <ArrowLeft size={16} /> {g.back}
                      </button>
                      <div className="flex-1">
                        <GlowButton onClick={() => go("account")} disabled={!service}>
                          {g.next} <ArrowRight size={16} />
                        </GlowButton>
                      </div>
                    </div>
                  </motion.section>
                )}

                {/* ---------- 3. BUAT AKUN / LANJUT KE FORMULIR ---------- */}
                {screen === "account" && (
                  <motion.section
                    key="account"
                    custom={direction}
                    initial={{ x: 40 * direction, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -40 * direction, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <OrderSteps current={signedIn ? 3 : 2} className="pr-8" />

                    <div className="mt-7 flex items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/[0.06] px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {(() => {
                          const Icon = SERVICE_ICONS[chosen];
                          return <Icon size={18} className="shrink-0 text-gold" />;
                        })()}
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{g.chosen}</p>
                          <p className="truncate text-sm font-medium text-white">{t.serviceOptions[chosen]}</p>
                        </div>
                      </div>
                      <button onClick={() => go("choose")} className="shrink-0 text-xs text-gold hover:underline">
                        {g.change}
                      </button>
                    </div>

                    <h2 id="guide-title" className="mt-6 font-serif text-3xl font-medium leading-tight text-white">
                      {signedIn ? g.signedInTitle : g.accountTitle}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">{signedIn ? g.signedInBody : g.accountBody}</p>

                    {!signedIn && (
                      <ul className="mt-5 space-y-2.5">
                        {g.accountPoints.map((point, i) => (
                          <motion.li
                            key={point}
                            className="flex items-center gap-3 text-sm text-zinc-300"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + i * 0.15 }}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                              <Check size={12} strokeWidth={3} />
                            </span>
                            {point}
                          </motion.li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-8 space-y-4">
                      {signedIn ? (
                        <GlowButton href={dashboardTarget} onClick={onClose}>
                          {g.ctaDashboard} <ArrowRight size={16} />
                        </GlowButton>
                      ) : (
                        <>
                          <GlowButton href={`/register?service=${chosen}`} onClick={onClose}>
                            <UserPlus size={16} /> {g.ctaRegister}
                          </GlowButton>
                          <Link
                            href={`/login?next=${encodeURIComponent(dashboardTarget)}`}
                            onClick={onClose}
                            className="block text-center text-sm text-zinc-400 transition-colors hover:text-gold"
                          >
                            {g.ctaLogin}
                          </Link>
                        </>
                      )}

                      <div className="flex items-center gap-3 pt-2 text-xs text-zinc-600">
                        <span className="h-px flex-1 bg-white/10" />
                        {t.auth.or}
                        <span className="h-px flex-1 bg-white/10" />
                      </div>

                      <a
                        href={waLink(fmt(g.waMsg, { service: t.serviceOptions[chosen] }))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-full border border-[#25D366]/40 px-6 py-3 text-sm text-[#4ade80] transition-colors hover:bg-[#25D366] hover:text-white"
                      >
                        <WhatsAppIcon size={16} /> {g.orWhatsapp}
                      </a>

                      <button
                        onClick={() => go("choose")}
                        className="inline-flex w-full items-center justify-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-white"
                      >
                        <ArrowLeft size={14} /> {g.back}
                      </button>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
