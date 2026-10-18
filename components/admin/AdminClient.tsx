"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import AdminProjectRow from "@/components/admin/AdminProjectRow";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { AdminProject } from "@/lib/projects";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type Filter = "active" | "all" | "done";

const DONE = new Set(["completed", "rejected", "cancelled"]);

export default function AdminClient({ initialProjects }: { initialProjects: AdminProject[] }) {
  const { t } = useI18n();
  const a = t.admin;
  const [projects, setProjects] = useState(initialProjects);
  const [filter, setFilter] = useState<Filter>("active");
  const [query, setQuery] = useState("");

  const reload = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { data, error } = await supabase.rpc("admin_list_projects");
    if (!error && data) setProjects(data as AdminProject[]);
  }, []);

  const stats = useMemo(
    () => ({
      total: projects.length,
      pending: projects.filter((p) => p.status === "pending").length,
      active: projects.filter((p) => ["reviewing", "accepted", "in_progress"].includes(p.status)).length,
      completed: projects.filter((p) => p.status === "completed").length,
    }),
    [projects],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (filter === "active" && DONE.has(p.status)) return false;
      if (filter === "done" && !DONE.has(p.status)) return false;
      if (!q) return true;
      return [p.title, p.customer_name ?? "", p.customer_email ?? ""].some((v) => v.toLowerCase().includes(q));
    });
  }, [projects, filter, query]);

  const tabs: { key: Filter; label: string }[] = [
    { key: "active", label: a.filterActive },
    { key: "all", label: a.filterAll },
    { key: "done", label: a.filterDone },
  ];

  return (
    <main className="relative min-h-screen px-4 pb-24 pt-28 sm:px-6">
      <div aria-hidden className="bg-grid absolute inset-x-0 top-0 h-[420px]" />
      <div className="relative mx-auto max-w-5xl">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-gold">
          <ArrowLeft size={14} /> {a.back}
        </Link>

        <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-serif text-4xl font-medium text-white sm:text-5xl">{a.title}</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">{a.subtitle}</p>
        </motion.header>

        {/* Ringkasan */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ["total", a.stats.total],
              ["pending", a.stats.pending],
              ["active", a.stats.active],
              ["completed", a.stats.completed],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-ink-50/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
              <p className={`mt-1 font-serif text-3xl ${key === "pending" && stats.pending > 0 ? "text-gold" : "text-white"}`}>
                {stats[key]}
              </p>
            </div>
          ))}
        </div>

        {/* Filter & pencarian */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.02] p-1 text-sm">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`rounded-full px-4 py-1.5 transition-colors ${
                  filter === tab.key ? "bg-gold text-ink" : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <label className="relative block sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={a.search}
              aria-label={a.search}
              className="w-full rounded-full border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-gold/60 focus:outline-none"
            />
          </label>
        </div>

        {visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center italic text-zinc-500">{a.empty}</p>
        ) : (
          <div className="space-y-4">
            {visible.map((p) => (
              <AdminProjectRow key={p.id} project={p} onSaved={reload} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
