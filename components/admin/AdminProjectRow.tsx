"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, ChevronDown, Loader2, Mail, Save, Wallet } from "lucide-react";
import { FormMessage } from "@/components/auth/AuthShell";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { inputClass, labelClass } from "@/components/ui/styles";
import { fmt, type ProjectStatus } from "@/lib/i18n/dictionaries";
import { localeOf, useI18n } from "@/lib/i18n/LanguageProvider";
import { STATUSES, STATUS_STYLES, isSafeLink, type AdminProject } from "@/lib/projects";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/supabase/errors";
import { projectCode, waLink } from "@/lib/whatsapp";

type Saved = { status: ProjectStatus; progress: number; message: string };

export default function AdminProjectRow({ project, onSaved }: { project: AdminProject; onSaved: () => Promise<void> }) {
  const { t, lang } = useI18n();
  const a = t.admin;
  const locale = localeOf(lang);

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [progress, setProgress] = useState(project.progress);
  const [note, setNote] = useState(project.admin_note ?? "");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Saved | null>(null);

  const code = projectCode(project.id);
  const offer =
    project.budget !== null
      ? new Intl.NumberFormat(locale, { style: "currency", currency: project.currency, maximumFractionDigits: 0 }).format(project.budget)
      : t.dashboard.askingQuote;
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  // Kenyamanan: status "Selesai" otomatis 100%, dan progres 100% otomatis "Selesai".
  const changeStatus = (s: ProjectStatus) => {
    setStatus(s);
    if (s === "completed") setProgress(100);
  };
  const changeProgress = (v: number) => {
    setProgress(v);
    if (v === 100 && !["rejected", "cancelled"].includes(status)) setStatus("completed");
    if (v > 0 && v < 100 && ["pending", "reviewing", "accepted"].includes(status)) setStatus("in_progress");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    if (link.trim() && !isSafeLink(link)) return setError(a.linkInvalid);

    setSaving(true);
    setError(null);
    const { error } = await supabase.rpc("admin_save_project", {
      p_id: project.id,
      p_status: status,
      p_progress: progress,
      p_note: note,
      p_message: message,
      p_link: link,
    });
    if (error) {
      setSaving(false);
      return setError(friendlyError(error, t));
    }
    setSaved({ status, progress, message: message.trim() });
    setMessage("");
    setLink("");
    await onSaved();
    setSaving(false);
  };

  const customerEmail = project.customer_email ?? "";
  const customerName = project.customer_name || customerEmail.split("@")[0] || "—";
  const notifyText = saved
    ? fmt(a.customerMsg, {
        name: customerName,
        code,
        title: project.title,
        status: t.dashboard.status[saved.status],
        progress: saved.progress,
        message: saved.message ? `\n\n${saved.message}` : "",
        url: `${window.location.origin}/dashboard`,
      })
    : "";

  return (
    <article className="rounded-2xl border border-white/10 bg-ink-50/60 transition-colors hover:border-white/20">
      {/* Ringkasan */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-gold/70">
              {t.serviceOptions[project.service]} <span className="text-zinc-600">· {code}</span>
            </p>
            <h3 className="mt-1 break-words font-serif text-2xl text-white">{project.title}</h3>
          </div>
          <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[project.status]}`}>
            {t.dashboard.status[project.status]} · {project.progress}%
          </span>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-gold transition-all duration-700" style={{ width: `${project.progress}%` }} />
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
          <span>
            {a.customer}: <span className="text-zinc-200">{customerName}</span>
          </span>
          {customerEmail && (
            <a href={`mailto:${customerEmail}`} className="inline-flex items-center gap-1.5 hover:text-gold">
              <Mail size={14} /> {customerEmail}
            </a>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Wallet size={14} className="text-gold/70" /> {offer}
          </span>
          {project.deadline && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock size={14} className="text-gold/70" />
              {dateFmt.format(new Date(`${project.deadline}T00:00:00`))}
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {project.whatsapp ? (
            <a
              href={waLink(undefined, project.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2 text-sm text-[#4ade80] transition-colors hover:bg-[#25D366] hover:text-white"
            >
              <WhatsAppIcon size={16} /> {a.chatCustomer}
            </a>
          ) : (
            <span className="text-xs italic text-zinc-600">{a.noWhatsapp}</span>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            {open ? a.collapse : a.manage}
            <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Formulir kelola */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <form onSubmit={save} noValidate className="space-y-5 border-t border-white/10 p-5 sm:p-6">
              <p className="whitespace-pre-line rounded-xl bg-white/[0.02] p-4 text-sm leading-relaxed text-zinc-400">{project.description}</p>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor={`st-${project.id}`} className={labelClass}>{a.status}</label>
                  <select
                    id={`st-${project.id}`}
                    value={status}
                    onChange={(e) => changeStatus(e.target.value as ProjectStatus)}
                    className={`${inputClass} appearance-none`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-ink">{t.dashboard.status[s]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor={`pr-${project.id}`} className={labelClass}>
                    {a.progress}: <span className="font-serif text-lg text-gold">{progress}%</span>
                  </label>
                  <input
                    id={`pr-${project.id}`}
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={progress}
                    onChange={(e) => changeProgress(Number(e.target.value))}
                    className="mt-3 w-full accent-[#d4af37]"
                  />
                  <div className="mt-2 flex gap-1.5">
                    {[0, 25, 50, 75, 100].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => changeProgress(v)}
                        className={`flex-1 rounded-lg border py-1 text-xs transition-colors ${
                          progress === v ? "border-gold bg-gold/15 text-gold" : "border-white/10 text-zinc-500 hover:text-white"
                        }`}
                      >
                        {v}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor={`msg-${project.id}`} className={labelClass}>{a.updateMessage}</label>
                <textarea
                  id={`msg-${project.id}`}
                  rows={3}
                  maxLength={2000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={a.updateMessagePlaceholder}
                  className={`${inputClass} resize-y`}
                />
              </div>

              <div>
                <label htmlFor={`lk-${project.id}`} className={labelClass}>{a.updateLink}</label>
                <input
                  id={`lk-${project.id}`}
                  type="url"
                  maxLength={500}
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor={`note-${project.id}`} className={labelClass}>{a.note}</label>
                <textarea
                  id={`note-${project.id}`}
                  rows={2}
                  maxLength={5000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={a.notePlaceholder}
                  className={`${inputClass} resize-y`}
                />
              </div>

              {error && <FormMessage type="error">{error}</FormMessage>}
              {saved && !error && <FormMessage type="success">{a.saved}</FormMessage>}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-gold-light disabled:opacity-60"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? a.saving : a.save}
                </button>

                {saved && project.whatsapp && (
                  <a
                    href={waLink(notifyText, project.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
                  >
                    <WhatsAppIcon size={16} /> {a.notify}
                  </a>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
