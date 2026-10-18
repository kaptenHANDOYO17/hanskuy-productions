"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { FormMessage } from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import { inputClass, labelClass } from "@/components/ui/styles";
import type { ServiceKey } from "@/lib/i18n/dictionaries";
import { localeOf, useI18n } from "@/lib/i18n/LanguageProvider";
import { PROJECT_WITH_UPDATES, type Currency, type Project } from "@/lib/projects";
import { normalizeWhatsapp } from "@/lib/whatsapp";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/supabase/errors";

const MAX_DESC = 5000;

export default function ProjectForm({
  onCreated,
  defaultWhatsapp = "",
  defaultService = "website",
}: {
  onCreated: (p: Project) => void;
  defaultWhatsapp?: string;
  defaultService?: ServiceKey;
}) {
  const { t, lang } = useI18n();
  const f = t.dashboard.form;

  const [title, setTitle] = useState("");
  const [service, setService] = useState<ServiceKey>(defaultService);
  const [description, setDescription] = useState("");
  const [budgetDigits, setBudgetDigits] = useState("");
  const [currency, setCurrency] = useState<Currency>(lang === "id" ? "IDR" : "USD");
  const [deadline, setDeadline] = useState("");
  const [whatsapp, setWhatsapp] = useState(defaultWhatsapp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const budgetDisplay = budgetDigits ? new Intl.NumberFormat(localeOf(lang)).format(Number(budgetDigits)) : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return setError(t.auth.notConfigured);

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    if (cleanTitle.length < 3) return setError(f.titleInvalid);
    if (cleanDesc.length < 10) return setError(f.descriptionInvalid);
    const wa = whatsapp.trim() ? normalizeWhatsapp(whatsapp) : null;
    if (whatsapp.trim() && !wa) return setError(t.errors.whatsappInvalid);

    setError(null);
    setLoading(true);

    // Hanya kolom ini yang boleh diisi pelanggan. Status, pemilik, dan catatan
    // diatur oleh database (lihat supabase/schema.sql) — tidak bisa dimanipulasi.
    const { data, error } = await supabase
      .from("projects")
      .insert({
        title: cleanTitle,
        service,
        description: cleanDesc,
        budget: budgetDigits ? Number(budgetDigits) : null,
        currency,
        deadline: deadline || null,
        whatsapp: wa,
      })
      .select(PROJECT_WITH_UPDATES)
      .single();

    setLoading(false);

    if (error) {
      // 42501 = ditolak aturan keamanan → kemungkinan besar batas 10 pengajuan menunggu tercapai.
      return setError(error.code === "42501" ? t.dashboard.limitReached : friendlyError(error, t));
    }

    onCreated(data as Project);
    setTitle("");
    setDescription("");
    setBudgetDigits("");
    setDeadline("");
    // Nomor WhatsApp sengaja tidak dikosongkan — biasanya sama untuk proyek berikutnya.
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5 rounded-2xl border border-gold/20 bg-ink-50/70 p-6 sm:p-8">
      <div>
        <label htmlFor="p-title" className={labelClass}>{f.title}</label>
        <input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} placeholder={f.titlePlaceholder} className={inputClass} />
      </div>

      <div>
        <label htmlFor="p-service" className={labelClass}>{f.service}</label>
        <select id="p-service" value={service} onChange={(e) => setService(e.target.value as ServiceKey)} className={`${inputClass} appearance-none`}>
          {(Object.keys(t.serviceOptions) as ServiceKey[]).map((key) => (
            <option key={key} value={key} className="bg-ink">{t.serviceOptions[key]}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="p-desc" className={labelClass}>{f.description}</label>
        <textarea
          id="p-desc"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={MAX_DESC}
          placeholder={f.descriptionPlaceholder}
          className={`${inputClass} resize-y`}
        />
        <p className="mt-1 text-right text-xs text-zinc-600">
          {description.length}/{MAX_DESC}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
        <div>
          <label htmlFor="p-budget" className={labelClass}>{f.budget}</label>
          <input
            id="p-budget"
            inputMode="numeric"
            value={budgetDisplay}
            onChange={(e) => setBudgetDigits(e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 13))}
            placeholder={f.budgetPlaceholder}
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-zinc-500">{f.budgetHint}</p>
        </div>
        <div>
          <label htmlFor="p-currency" className={labelClass}>{f.currency}</label>
          <select id="p-currency" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className={`${inputClass} appearance-none sm:w-28`}>
            <option value="IDR" className="bg-ink">IDR (Rp)</option>
            <option value="USD" className="bg-ink">USD ($)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="p-deadline" className={labelClass}>{f.deadline}</label>
        <input id="p-deadline" type="date" min={today} value={deadline} onChange={(e) => setDeadline(e.target.value)} className={`${inputClass} [color-scheme:dark]`} />
      </div>

      <div>
        <label htmlFor="p-whatsapp" className={labelClass}>{f.whatsapp}</label>
        <input
          id="p-whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value.slice(0, 20))}
          placeholder={f.whatsappPlaceholder}
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-zinc-500">{f.whatsappHint}</p>
      </div>

      {error && <FormMessage type="error">{error}</FormMessage>}

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {loading ? f.submitting : f.submit}
      </Button>
    </form>
  );
}
