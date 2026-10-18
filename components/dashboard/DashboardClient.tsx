"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FolderOpen, Plus, ShieldCheck, X } from "lucide-react";
import AccountPanel from "@/components/dashboard/AccountPanel";
import ProjectCard from "@/components/dashboard/ProjectCard";
import ProjectForm from "@/components/dashboard/ProjectForm";
import Footer from "@/components/ui/Footer";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import OrderSteps from "@/components/guide/OrderSteps";
import type { ServiceKey } from "@/lib/i18n/dictionaries";
import { fmt } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { PROJECT_WITH_UPDATES, type Project } from "@/lib/projects";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { projectCode, waLink } from "@/lib/whatsapp";

export type DashboardUser = { email: string; name: string; hasPassword: boolean };

/** Seberapa sering dasbor mengambil progres terbaru saat halaman sedang dibuka. */
const REFRESH_MS = 45_000;

export default function DashboardClient({
  user,
  initialProjects,
  isAdmin = false,
  openForm = false,
  startService = null,
}: {
  user: DashboardUser;
  initialProjects: Project[];
  isAdmin?: boolean;
  /** Datang dari panduan pemesanan → formulir langsung terbuka */
  openForm?: boolean;
  startService?: ServiceKey | null;
}) {
  const { t } = useI18n();
  const d = t.dashboard;
  const [projects, setProjects] = useState(initialProjects);
  const [showForm, setShowForm] = useState(openForm || initialProjects.length === 0);
  // Tampilkan penanda "Langkah 3 dari 4" bagi pelanggan baru / yang datang dari panduan.
  const guided = openForm || initialProjects.length === 0;
  const [justSubmitted, setJustSubmitted] = useState<Project | null>(null);

  const firstName = user.name.split(" ")[0];
  const lastWhatsapp = projects.find((p) => p.whatsapp)?.whatsapp ?? "";

  // Ambil progres terbaru secara otomatis: tiap 45 detik saat tab terbuka, dan saat pelanggan kembali ke tab ini.
  // Jika gagal (mis. internet putus), data lama tetap tampil — tidak ada layar error.
  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase || document.visibilityState !== "visible") return;
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_WITH_UPDATES)
      .order("created_at", { ascending: false });
    if (!error && data) setProjects(data as Project[]);
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, REFRESH_MS);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  return (
    <>
      <main className="relative min-h-screen px-4 pb-24 pt-28 sm:px-6">
        <div aria-hidden className="bg-grid absolute inset-x-0 top-0 h-[480px]" />

        <div className="relative mx-auto max-w-6xl">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10"
          >
            <h1 className="font-serif text-4xl font-medium text-white sm:text-5xl">
              {firstName ? fmt(d.hello, { name: firstName }) : d.helloNoName}
            </h1>
            <p className="mt-3 text-lg text-zinc-400">{d.subtitle}</p>
          </motion.header>

          {isAdmin && (
            <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-gold/30 bg-gold/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex items-center gap-2 text-sm text-zinc-200">
                <ShieldCheck size={18} className="text-gold" /> {d.adminBanner}
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold-light"
              >
                {d.adminOpen}
              </Link>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Kolom proyek */}
            <section className="space-y-6 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl text-white">{d.myProjects}</h2>
                  {projects.length > 0 && (
                    <p className="mt-1 inline-flex items-center gap-2 text-xs text-zinc-500">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                      {d.liveHint}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowForm((v) => !v)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                    showForm ? "border border-white/15 text-zinc-300 hover:border-gold/50" : "bg-gold text-ink hover:bg-gold-light"
                  }`}
                >
                  {showForm ? <X size={16} /> : <Plus size={16} />}
                  {showForm ? d.closeForm : d.newProject}
                </button>
              </div>

              {/* Setelah mengajukan: ajakan konfirmasi via WhatsApp */}
              <AnimatePresence>
                {justSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.07] p-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                  >
                    {guided && <OrderSteps current={4} complete hint={t.guide.trackHint} className="w-full" />}
                    <p className="inline-flex items-start gap-3 text-sm text-zinc-200">
                      <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-400" />
                      {d.submittedBanner}
                    </p>
                    <div className="flex items-center gap-3">
                      <a
                        href={waLink(
                          fmt(t.whatsapp.newProjectMsg, { code: projectCode(justSubmitted.id), title: justSubmitted.title }),
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-105"
                      >
                        <WhatsAppIcon size={16} /> {t.whatsapp.confirmProject}
                      </a>
                      <button onClick={() => setJustSubmitted(null)} aria-label={d.closeForm} className="text-zinc-500 hover:text-white">
                        <X size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    {guided && (
                      <OrderSteps
                        current={3}
                        hint={t.guide.formHint}
                        className="mb-4 rounded-2xl border border-gold/20 bg-gold/[0.04] p-5"
                      />
                    )}
                    <ProjectForm
                      defaultService={startService ?? undefined}
                      defaultWhatsapp={lastWhatsapp}
                      onCreated={(p) => {
                        setProjects((list) => [p, ...list]);
                        setShowForm(false);
                        setJustSubmitted(p);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {projects.length === 0 && !showForm ? (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
                  <FolderOpen size={36} className="text-zinc-600" strokeWidth={1.5} />
                  <p className="mt-4 max-w-sm font-serif text-lg italic text-zinc-400">{d.empty}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {projects.map((p) => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        onUpdated={(updated) => setProjects((list) => list.map((x) => (x.id === updated.id ? updated : x)))}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>

            {/* Kolom akun */}
            <aside>
              <AccountPanel user={user} />
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
