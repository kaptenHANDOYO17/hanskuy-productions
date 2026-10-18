"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, Send, UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { useGuide } from "@/components/guide/GuideProvider";
import { siteConfig } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";
import { inputClass, labelClass } from "@/components/ui/styles";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { ServiceKey } from "@/lib/i18n/dictionaries";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/supabase/errors";

type Status = "idle" | "loading" | "success" | "error";
type Lead = { name: string; contact: string; service: ServiceKey; message: string };

const EMPTY: Lead = { name: "", contact: "", service: "website", message: "" };

export default function Contact() {
  const { t } = useI18n();
  const { openGuide } = useGuide();
  const c = t.contact;
  const [form, setForm] = useState<Lead>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update =
    (key: keyof Lead) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowser();

    if (!supabase) {
      setStatus("error");
      setErrorMsg(t.auth.notConfigured);
      return;
    }

    setStatus("loading");
    const { error } = await supabase.from("leads").insert({
      name: form.name.trim(),
      contact: form.contact.trim(),
      service: form.service,
      message: form.message.trim(),
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message?.toLowerCase().includes("fetch") ? friendlyError(error, t) : c.failed);
      return;
    }

    setStatus("success");
    setForm(EMPTY);
  };

  return (
    <section id="contact" className="relative scroll-mt-20 px-6 py-28">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold">{c.eyebrow}</p>
          <h2 className="font-serif text-4xl font-medium leading-tight text-white sm:text-5xl">
            {c.title1} <span className="italic text-gradient-gold">{c.title2}</span>
          </h2>
          <p className="mt-6 max-w-md text-lg text-zinc-400">{c.body}</p>

          {/* Jalur utama: buat akun */}
          <div className="mt-10 rounded-2xl border border-gold/30 bg-gold/[0.06] p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold text-ink">
                <UserPlus size={18} />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-white">{c.accountTitle}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{c.accountBody}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col items-start gap-4">
              <Button onClick={() => openGuide("choose")}>
                {c.accountCta} <ArrowRight size={16} />
              </Button>
              <Link href="/login" className="text-sm text-zinc-400 underline-offset-4 hover:text-gold hover:underline">
                {c.accountLogin}
              </Link>
            </div>
          </div>

          {/* Jalur cepat: WhatsApp */}
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-serif text-xl text-white">{t.whatsapp.contactTitle}</p>
              <p className="mt-1 text-sm text-zinc-500">{siteConfig.whatsapp.display}</p>
            </div>
            <a
              href={waLink(t.whatsapp.general)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
            >
              <WhatsAppIcon size={18} /> {t.whatsapp.contactCta}
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/10 bg-ink-50/60 p-8 backdrop-blur"
        >
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-[380px] flex-col items-center justify-center text-center"
              >
                <CheckCircle2 size={48} className="text-gold" strokeWidth={1.5} />
                <h3 className="mt-6 font-serif text-3xl text-white">{c.successTitle}</h3>
                <p className="mt-3 max-w-sm text-zinc-400">{c.successBody}</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-8 text-sm text-zinc-500 underline-offset-4 hover:text-gold hover:underline"
                >
                  {c.sendAnother}
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} exit={{ opacity: 0 }} className="space-y-5">
                <h3 className="font-serif text-2xl text-white">{c.quickTitle}</h3>
                <div>
                  <label htmlFor="lead-name" className={labelClass}>{c.name}</label>
                  <input id="lead-name" required maxLength={120} autoComplete="name" value={form.name} onChange={update("name")} placeholder={c.namePlaceholder} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="lead-contact" className={labelClass}>{c.contactField}</label>
                  <input id="lead-contact" required maxLength={200} value={form.contact} onChange={update("contact")} placeholder={c.contactPlaceholder} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="lead-service" className={labelClass}>{c.service}</label>
                  <select id="lead-service" value={form.service} onChange={update("service")} className={`${inputClass} appearance-none`}>
                    {(Object.keys(t.serviceOptions) as ServiceKey[]).map((key) => (
                      <option key={key} value={key} className="bg-ink">{t.serviceOptions[key]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="lead-message" className={labelClass}>{c.message}</label>
                  <textarea id="lead-message" required rows={4} maxLength={5000} value={form.message} onChange={update("message")} placeholder={c.messagePlaceholder} className={`${inputClass} resize-none`} />
                </div>

                {status === "error" && <p className="text-sm text-red-400" role="alert">{errorMsg}</p>}

                <Button type="submit" disabled={status === "loading"} className="w-full">
                  {status === "loading" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> {c.sending}
                    </>
                  ) : (
                    <>
                      {c.submit} <Send size={16} />
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
