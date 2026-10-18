"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, ChevronDown, ExternalLink, Loader2, MessageSquareQuote, Wallet } from "lucide-react";
import ProgressTracker from "@/components/dashboard/ProgressTracker";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { fmt } from "@/lib/i18n/dictionaries";
import { localeOf, useI18n } from "@/lib/i18n/LanguageProvider";
import { PROJECT_WITH_UPDATES, STATUS_STYLES, isSafeLink, sortUpdates, type Project } from "@/lib/projects";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/supabase/errors";
import { projectCode, waLink } from "@/lib/whatsapp";

export default function ProjectCard({ project, onUpdated }: { project: Project; onUpdated: (p: Project) => void }) {
  const { t, lang } = useI18n();
  const d = t.dashboard;
  const locale = localeOf(lang);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const dateTimeFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const submitted = dateFmt.format(new Date(project.created_at));
  const deadline = project.deadline ? dateFmt.format(new Date(`${project.deadline}T00:00:00`)) : null;
  const offer =
    project.budget !== null
      ? new Intl.NumberFormat(locale, { style: "currency", currency: project.currency, maximumFractionDigits: 0 }).format(project.budget)
      : d.askingQuote;

  const updates = sortUpdates(project.project_updates);
  const code = projectCode(project.id);
  const waMessage = fmt(t.whatsapp.projectMsg, {
    code,
    title: project.title,
    status: d.status[project.status],
    progress: project.progress,
  });

  const cancel = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { data, error } = await supabase
      .from("projects")
      .update({ status: "cancelled" })
      .eq("id", project.id)
      .select(PROJECT_WITH_UPDATES)
      .single();
    setBusy(false);
    setConfirming(false);
    if (error) return setError(friendlyError(error, t));
    onUpdated(data as Project);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`rounded-2xl border border-white/10 bg-ink-50/60 p-6 transition-colors hover:border-white/20 ${
        project.status === "cancelled" ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-gold/70">
            {t.serviceOptions[project.service]} <span className="text-zinc-600">· {code}</span>
          </p>
          <h3 className="mt-1 break-words font-serif text-2xl text-white">{project.title}</h3>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[project.status]}`}>
          {d.status[project.status]}
        </span>
      </div>

      <ProgressTracker status={project.status} progress={project.progress} />

      <p className="mt-5 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-zinc-400">{project.description}</p>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
        <span className="inline-flex items-center gap-2">
          <Wallet size={15} className="text-gold/70" />
          {d.offer}: <span className="text-zinc-200">{offer}</span>
        </span>
        {deadline && (
          <span className="inline-flex items-center gap-2">
            <CalendarClock size={15} className="text-gold/70" />
            {d.deadline}: <span className="text-zinc-200">{deadline}</span>
          </span>
        )}
      </div>

      {project.admin_note && (
        <div className="mt-5 rounded-xl border border-gold/20 bg-gold/[0.06] p-4">
          <p className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gold">
            <MessageSquareQuote size={14} /> {d.noteFromMe}
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">{project.admin_note}</p>
        </div>
      )}

      {/* Riwayat progres */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-5 inline-flex items-center gap-2 text-sm text-gold/90 transition-colors hover:text-gold"
      >
        {open ? d.hideDetails : d.showDetails}
        {updates.length > 0 && (
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">{updates.length}</span>
        )}
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4">
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">{d.timeline}</p>
              {updates.length === 0 ? (
                <p className="text-sm italic text-zinc-500">{d.noUpdates}</p>
              ) : (
                <ol className="relative ml-2 space-y-5 border-l border-white/10 pl-5">
                  {updates.map((u, i) => (
                    <li key={u.id} className="relative">
                      <span
                        className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 ${
                          i === 0 ? "border-gold bg-gold" : "border-white/20 bg-ink"
                        }`}
                      />
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span>{dateTimeFmt.format(new Date(u.created_at))}</span>
                        <span className={`rounded-full border px-2 py-0.5 ${STATUS_STYLES[u.status]}`}>{d.status[u.status]}</span>
                        <span className="font-medium text-gold">{u.progress}%</span>
                      </div>
                      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
                        {u.message || fmt(d.progressTo, { progress: u.progress })}
                      </p>
                      {u.link && isSafeLink(u.link) && (
                        <a
                          href={u.link}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="mt-1 inline-flex items-center gap-1.5 text-sm text-gold underline-offset-4 hover:underline"
                        >
                          <ExternalLink size={14} /> {d.viewResult}
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4 text-xs text-zinc-500">
        <span>
          {fmt(d.submittedOn, { date: submitted })}
          {project.updated_at && project.updated_at !== project.created_at && (
            <> · {fmt(d.updatedAt, { date: dateFmt.format(new Date(project.updated_at)) })}</>
          )}
        </span>

        <div className="flex flex-wrap items-center gap-4">
          {project.status === "pending" &&
            (confirming ? (
              <span className="inline-flex items-center gap-3">
                <span className="text-zinc-300">{d.cancelConfirm}</span>
                <button onClick={cancel} disabled={busy} className="font-medium text-red-400 hover:text-red-300">
                  {busy ? <Loader2 size={14} className="animate-spin" /> : d.yes}
                </button>
                <button onClick={() => setConfirming(false)} className="text-zinc-400 hover:text-white">
                  {d.no}
                </button>
              </span>
            ) : (
              <button onClick={() => setConfirming(true)} className="text-zinc-500 transition-colors hover:text-red-400">
                {d.cancel}
              </button>
            ))}

          {project.status !== "cancelled" && (
            <a
              href={waLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2 text-sm font-medium text-[#4ade80] transition-colors hover:bg-[#25D366] hover:text-white"
            >
              <WhatsAppIcon size={16} /> {t.whatsapp.askProject}
            </a>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-400" role="alert">{error}</p>}
    </motion.article>
  );
}
