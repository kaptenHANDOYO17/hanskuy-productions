"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, KeyRound, Loader2, LogOut, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { FormMessage } from "@/components/auth/AuthShell";
import { useCaptcha } from "@/components/auth/Captcha";
import PasswordInput from "@/components/auth/PasswordInput";
import Button from "@/components/ui/Button";
import type { DashboardUser } from "@/components/dashboard/DashboardClient";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/supabase/errors";
import { isValidPassword } from "@/lib/validation";

export default function AccountPanel({ user }: { user: DashboardUser }) {
  const { t } = useI18n();
  const d = t.dashboard;
  const router = useRouter();
  const captcha = useCaptcha();

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState<"local" | "global" | null>(null);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    if (!current) return setMsg({ type: "error", text: t.errors.passwordRequired });
    if (!isValidPassword(next)) return setMsg({ type: "error", text: t.errors.weakPassword });
    if (!captcha.ready) return setMsg({ type: "error", text: t.errors.captchaRequired });

    setLoading(true);
    setMsg(null);

    // Keamanan ekstra: sandi lama wajib benar sebelum sandi baru disimpan,
    // sehingga orang yang meminjam perangkat yang masih login tidak bisa mengambil alih akun.
    const check = await supabase.auth.signInWithPassword({
      email: user.email,
      password: current,
      options: { captchaToken: captcha.token },
    });
    captcha.reset();
    if (check.error) {
      setLoading(false);
      const wrong = check.error.code === "invalid_credentials";
      return setMsg({ type: "error", text: wrong ? t.errors.currentPasswordWrong : friendlyError(check.error, t) });
    }

    const { error } = await supabase.auth.updateUser({ password: next });
    setLoading(false);
    if (error) return setMsg({ type: "error", text: friendlyError(error, t) });

    setCurrent("");
    setNext("");
    setMsg({ type: "success", text: d.passwordChanged });
  };

  const signOut = async (scope: "local" | "global") => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setSigningOut(scope);
    await supabase.auth.signOut({ scope });
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <div className="rounded-2xl border border-white/10 bg-ink-50/60 p-6">
        <h2 className="font-serif text-2xl text-white">{d.account}</h2>
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-zinc-500">{d.signedInAs}</p>
        {user.name && <p className="mt-1 text-zinc-200">{user.name}</p>}
        <p className="break-all text-sm text-zinc-400">{user.email}</p>

        <div className="mt-6 border-t border-white/10 pt-4">
          {user.hasPassword ? (
            <>
              <button
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="flex w-full items-center justify-between text-sm text-zinc-300 transition-colors hover:text-gold"
              >
                <span className="inline-flex items-center gap-2">
                  <KeyRound size={16} /> {d.changePassword}
                </span>
                <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={changePassword}
                    noValidate
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pt-4">
                      <PasswordInput id="current-password" label={t.auth.currentPassword} value={current} onChange={setCurrent} autoComplete="current-password" />
                      <PasswordInput id="new-password" label={t.auth.newPassword} value={next} onChange={setNext} autoComplete="new-password" showStrength />
                      {captcha.widget}
                      {msg && <FormMessage type={msg.type}>{msg.text}</FormMessage>}
                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                        {d.savePassword}
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
              {!open && msg?.type === "success" && <p className="mt-3 text-sm text-gold-light">{msg.text}</p>}
            </>
          ) : (
            <p className="text-sm text-zinc-500">{d.googleNoPassword}</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-ink-50/60 p-6">
        <button
          onClick={() => signOut("local")}
          disabled={signingOut !== null}
          className="flex w-full items-center gap-2 text-sm text-zinc-300 transition-colors hover:text-gold"
        >
          {signingOut === "local" ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
          {d.signOut}
        </button>
        <button
          onClick={() => signOut("global")}
          disabled={signingOut !== null}
          className="mt-4 flex w-full items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-red-400"
        >
          {signingOut === "global" ? <Loader2 size={16} className="animate-spin" /> : <MonitorSmartphone size={16} />}
          {d.signOutAll}
        </button>
        <p className="mt-6 text-xs leading-relaxed text-zinc-600">{d.securityTip}</p>
      </div>
    </div>
  );
}
