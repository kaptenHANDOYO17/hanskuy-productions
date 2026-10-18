"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, BarChart3, BrainCircuit, MessagesSquare, MonitorSmartphone } from "lucide-react";
import Card from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/LanguageProvider";

/** Ikon untuk tiap layanan, urutannya sama dengan `services.items` di dictionaries.ts */
const ICONS = [MonitorSmartphone, BrainCircuit, MessagesSquare, BarChart3];

export default function Services() {
  const { t } = useI18n();
  const s = t.services;

  return (
    <section id="services" className="relative scroll-mt-20 px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-3xl"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold">{s.eyebrow}</p>
          <h2 className="font-serif text-4xl font-medium leading-tight text-white sm:text-5xl lg:text-6xl">
            {s.title1} <br className="hidden sm:block" />
            <span className="italic text-gradient-gold">{s.title2}</span>
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2">
          {s.items.map(({ title, observation, description }, i) => {
            const Icon = ICONS[i] ?? MonitorSmartphone;
            return (
              <Card key={i} delay={i * 0.1}>
                <div className="flex items-start justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300 transition-all duration-500 group-hover:border-gold/40 group-hover:text-gold">
                    <Icon size={22} strokeWidth={1.75} />
                  </div>
                  <ArrowUpRight
                    size={20}
                    className="text-zinc-600 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-gold"
                  />
                </div>

                <h3 className="mt-6 font-serif text-2xl font-semibold text-white">{title}</h3>

                <p className="mt-4 text-sm text-zinc-500">
                  <span className="text-xs uppercase tracking-[0.2em] text-gold/70">{s.observed} · </span>
                  <span className="italic">{observation}</span>
                </p>

                <p className="mt-3 leading-relaxed text-zinc-300">{description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
