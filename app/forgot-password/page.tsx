"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import AuthShell, { FormMessage } from "@/components/auth/AuthShell";
import OtpStep from "@/components/auth/OtpStep";
import PasswordInput from "@/components/auth/PasswordInput";
import { useCaptcha } from "@/components/auth/Captcha";
import Button from "@/components/ui/Button";
import { inputClass, labelClass } from "@/components/ui/styles";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/supabase/errors";
import { isValidEmail, isValidPassword, normalizeEmail } from "@/lib/validation";

/**
 * Lupa sandi, 2 langkah:
 *  1. Masukkan email → kode dikirim.
 *  2. Masukkan kode + sandi baru → langsung masuk ke dasbor.
 * Jika pengguna mengklik link di email (bukan kode), ia tiba di sini
 * dengan ?step=reset dan cukup mengisi sandi baru.
 */
type Step = "email" | "code" | "link" | "done";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const router = useRouter();
  const captcha = useCaptcha();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verified = useRef(false);

  // Datang dari link "reset password" di email (sesi pemulihan sudah aktif)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("step") !== "reset") return;
    getSupabaseBrowser()
      ?.auth.getSession()
      .then(({ data }) => {
        if (data.session) {
          verified.current = true;
          setStep("link");
        }
      });
  }, []);

  const finish = () => {
    setStep("done");
    setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 1200);
  };

  /** Simpan sandi baru (sesi pemulihan harus sudah aktif). */
  const saveNewPassword = async (): Promise<string | null> => {
    const supabase = getSupabaseBrowser()!;
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return friendlyError(error, t);
    finish();
    return null;
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return setError(t.auth.notConfigured);

    const cleanEmail = normalizeEmail(email);
    if (!isValidEmail(cleanEmail)) return setError(t.errors.emailInvalid);
    if (!captcha.ready) return setError(t.errors.captchaRequired);

    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { captchaToken: captcha.token });
    captcha.reset();
    setLoading(false);

    if (error) return setError(friendlyError(error, t));
    setEmail(cleanEmail);
    setStep("code");
  };

  if (step === "done") {
    return (
      <AuthShell title={t.auth.resetTitle} stepKey="done">
        <FormMessage type="success">{t.auth.resetDone}</FormMessage>
      </AuthShell>
    );
  }

  if (step === "link") {
    return (
      <AuthShell title={t.auth.resetTitle} stepKey="link">
        <form
          noValidate
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!isValidPassword(password)) return setError(t.errors.weakPassword);
            setLoading(true);
            const err = await saveNewPassword();
            setLoading(false);
            setError(err);
          }}
        >
          <PasswordInput id="new-password" label={t.auth.newPassword} value={password} onChange={setPassword} autoComplete="new-password" showStrength />
          {error && <FormMessage type="error">{error}</FormMessage>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
            {t.auth.resetSubmit}
          </Button>
        </form>
      </AuthShell>
    );
  }

  if (step === "code") {
    const supabase = getSupabaseBrowser()!;
    return (
      <AuthShell title={t.auth.resetTitle} stepKey="code">
        <OtpStep
          email={email}
          submitLabel={t.auth.resetSubmit}
          notice={t.auth.forgotSent}
          onBack={() => {
            verified.current = false;
            setStep("email");
          }}
          onSubmit={async (code) => {
            if (!isValidPassword(password)) return t.errors.weakPassword;
            // Kode diverifikasi sekali saja; jika sandi ditolak, pengguna cukup memperbaiki sandinya.
            if (!verified.current) {
              const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "recovery" });
              if (error) return friendlyError(error, t);
              verified.current = true;
            }
            return saveNewPassword();
          }}
          onResend={async (captchaToken) => {
            verified.current = false;
            const { error } = await supabase.auth.resetPasswordForEmail(email, { captchaToken });
            return error ? friendlyError(error, t) : null;
          }}
        >
          <PasswordInput id="new-password" label={t.auth.newPassword} value={password} onChange={setPassword} autoComplete="new-password" showStrength />
        </OtpStep>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t.auth.forgotTitle} subtitle={t.auth.forgotSubtitle} stepKey="email">
      <form onSubmit={sendCode} className="space-y-5" noValidate>
        <div>
          <label htmlFor="email" className={labelClass}>{t.auth.email}</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder={t.auth.emailPlaceholder}
            required
            autoFocus
            className={inputClass}
          />
        </div>

        {captcha.widget}
        {error && <FormMessage type="error">{error}</FormMessage>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
          {t.auth.sendCode}
        </Button>
      </form>

      <p className="mt-8 border-t border-white/10 pt-6 text-center text-sm">
        <Link href="/login" className="text-zinc-400 hover:text-gold">
          {t.auth.backToLogin}
        </Link>
      </p>
    </AuthShell>
  );
}
