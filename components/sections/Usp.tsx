"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gem, Globe2, Handshake, Zap } from "lucide-react";
import Card from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/LanguageProvider";

/* ---------- Detail interaktif kecil di tiap kartu ---------- */

/** 4 tahap kecepatan yang menyala bergiliran saat kartu di-hover. */
function SpeedSteps({ steps }: { steps: string[] }) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {steps.map((s, i) => (
        <span
          key={s}
          style={{ transitionDelay: `${i * 120}ms` }}
          className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500 transition-all duration-300 group-hover:border-gold/50 group-hover:bg-gold/10 group-hover:text-gold-light"
        >
          {s}
        </span>
      ))}
    </div>
  );
}

const GREETINGS = ["Halo", "Hello", "こんにちは", "Hola", "مرحبا", "Bonjour", "你好", "Sugeng rawuh"];

/** Sapaan yang terus berganti bahasa. */
function LanguageTicker({ label }: { label: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % GREETINGS.length), 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-6 flex h-8 items-center gap-3 text-sm text-zinc-500">
      <span>{label}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={GREETINGS[i]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          className="font-serif text-xl italic text-gold"
        >
          {GREETINGS[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/** Kuota revisi: tak terhingga. */
function InfiniteRevision({ label }: { label: string }) {
  return (
    <div className="mt-6 flex items-center gap-3 text-sm text-zinc-500">
      <span>{label}</span>
      <span className="inline-block font-serif text-3xl leading-none text-gold transition-transform duration-500 group-hover:rotate-180 group-hover:scale-125">
        ∞
      </span>
    </div>
  );
}

/** Empat peran, satu tagihan. */
function RolesCollapse({ roles, before, after }: { roles: string[]; before: string; after: string }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      {roles.map((r, i) => (
        <span
          key={r}
          style={{ transitionDelay: `${i * 80}ms` }}
          className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400 transition-all duration-300 group-hover:border-gold/40 group-hover:text-zinc-200"
        >
          {r}
        </span>
      ))}
      <span className="ml-1 text-xs text-zinc-500">
        = <span className="line-through">{before}</span> <span className="font-semibold text-gold">{after}</span>
      </span>
    </div>
  );
}

/* ---------- Section ---------- */

const ICONS = [Zap, Globe2, Handshake, Gem];

export default function Usp() {
  const { t } = useI18n();
  const u = t.usp;

  const extras = [
    <SpeedSteps key="speed" steps={u.speedSteps} />,
    <LanguageTicker key="lang" label={u.languageLabel} />,
    <InfiniteRevision key="rev" label={u.revisionLabel} />,
    <RolesCollapse key="roles" roles={u.roles} before={u.billsBefore} after={u.billsAfter} />,
  ];

  return (
    <section id="advantages" className="relative scroll-mt-20 px-6 py-28">
      <div aria-hidden className="absolute left-1/2 top-1/3 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-gold/[0.04] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-3xl"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold">{u.eyebrow}</p>
          <h2 className="font-serif text-4xl font-medium leading-tight text-white sm:text-5xl lg:text-6xl">
            {u.title1} <br className="hidden sm:block" />
            <span className="italic text-gradient-gold">{u.title2}</span>
          </h2>
          <p className="mt-6 text-lg text-zinc-400">{u.intro}</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {u.items.map(({ title, tagline, body }, i) => {
            const Icon = ICONS[i] ?? Zap;
            return (
              <Card key={i} delay={i * 0.12} className="flex flex-col">
                <span
                  aria-hidden
                  className="absolute -right-2 -top-6 font-serif text-[7rem] font-semibold leading-none text-white/[0.03] transition-colors duration-500 group-hover:text-gold/[0.08]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold transition-all duration-500 group-hover:rotate-[8deg] group-hover:scale-110 group-hover:bg-gold group-hover:text-ink">
                  <Icon size={22} strokeWidth={1.75} />
                </div>

                <h3 className="font-serif text-2xl font-semibold text-white sm:text-3xl">{title}</h3>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gold/80">{tagline}</p>
                <p className="mt-4 leading-relaxed text-zinc-400">{body}</p>

                {extras[i]}
              </Card>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-16 text-center font-serif text-2xl italic text-zinc-400"
        >
          {u.closing1} <span className="text-gold">{u.closing2}</span>
        </motion.p>
      </div>
    </section>
  );
}
