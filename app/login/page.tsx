"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn, Mail } from "lucide-react";
import AuthShell, { FormMessage } from "@/components/auth/AuthShell";
import GoogleButton from "@/components/auth/GoogleButton";
import OtpStep from "@/components/auth/OtpStep";
import PasswordInput from "@/components/auth/PasswordInput";
import { useCaptcha } from "@/components/auth/Captcha";
import Button from "@/components/ui/Button";
import { inputClass, labelClass } from "@/components/ui/styles";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/supabase/errors";
import { isValidEmail, normalizeEmail, safeNext } from "@/lib/validation";

type Mode = "password" | "code";
type Otp = { kind: "signup" | "magic"; cooldown: number; notice?: string };

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const captcha = useCaptcha();

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState<Otp | null>(null);

  // Pesan bila datang dari link email yang sudah kedaluwarsa
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "link") setError(t.auth.linkExpired);
  }, [t]);

  const goNext = () => {
    router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
    router.refresh();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return setError(t.auth.notConfigured);

    const cleanEmail = normalizeEmail(email);
    if (!isValidEmail(cleanEmail)) return setError(t.errors.emailInvalid);
    if (mode === "password" && !password) return setError(t.errors.passwordRequired);
    if (!captcha.ready) return setError(t.errors.captchaRequired);

    setError(null);
    setLoading(true);

    if (mode === "password") {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
        options: { captchaToken: captcha.token },
      });
      captcha.reset();
      setLoading(false);

      if (!error) return goNext();
      if (error.code === "email_not_confirmed") {
        setEmail(cleanEmail);
        return setOtp({ kind: "signup", cooldown: 0, notice: t.errors.emailNotConfirmed });
      }
      return setError(friendlyError(error, t));
    }

    // Masuk tanpa sandi: kirim kode ke email (hanya untuk akun yang sudah ada)
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { shouldCreateUser: false, captchaToken: captcha.token },
    });
    captcha.reset();
    setLoading(false);
    if (error) return setError(friendlyError(error, t));
    setEmail(cleanEmail);
    setOtp({ kind: "magic", cooldown: 60 });
  };

  if (otp) {
    const supabase = getSupabaseBrowser()!;
    return (
      <AuthShell title={t.auth.otpTitle} stepKey="otp">
        <OtpStep
          email={email}
          submitLabel={t.auth.otpVerify}
          initialCooldown={otp.cooldown}
          notice={otp.notice}
          onBack={() => setOtp(null)}
          onSubmit={async (code) => {
            const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
            if (error) return friendlyError(error, t);
            goNext();
            return null;
          }}
          onResend={async (captchaToken) => {
            const { error } =
              otp.kind === "signup"
                ? await supabase.auth.resend({ type: "signup", email, options: { captchaToken } })
                : await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false, captchaToken } });
            return error ? friendlyError(error, t) : null;
          }}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t.auth.loginTitle} subtitle={t.auth.loginSubtitle} stepKey="form">
      <GoogleButton onError={setError} />

      <form onSubmit={submit} className="space-y-5" noValidate>
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
            className={inputClass}
          />
        </div>

        {mode === "password" && (
          <PasswordInput
            id="password"
            label={t.auth.password}
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            rightLabel={
              <Link href="/forgot-password" className="mb-2 text-sm text-gold/80 hover:text-gold">
                {t.auth.forgotLink}
              </Link>
            }
          />
        )}

        {captcha.widget}
        {error && <FormMessage type="error">{error}</FormMessage>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : mode === "password" ? <LogIn size={16} /> : <Mail size={16} />}
          {mode === "password" ? t.auth.loginSubmit : t.auth.sendCode}
        </Button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "password" ? "code" : "password");
            setError(null);
          }}
          className="w-full text-center text-sm text-zinc-400 transition-colors hover:text-gold"
        >
          {mode === "password" ? t.auth.useCode : t.auth.usePassword}
        </button>
      </form>

      <p className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-zinc-500">
        {t.auth.noAccount}{" "}
        <Link href="/register" className="font-medium text-gold hover:underline">
          {t.auth.signUpLink}
        </Link>
      </p>
    </AuthShell>
  );
}
