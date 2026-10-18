"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import AuthShell, { FormMessage } from "@/components/auth/AuthShell";
import GoogleButton from "@/components/auth/GoogleButton";
import OtpStep from "@/components/auth/OtpStep";
import PasswordInput from "@/components/auth/PasswordInput";
import { useCaptcha } from "@/components/auth/Captcha";
import Button from "@/components/ui/Button";
import OrderSteps from "@/components/guide/OrderSteps";
import { orderFormPath, parseService } from "@/lib/projects";
import type { ServiceKey } from "@/lib/i18n/dictionaries";
import { inputClass, labelClass } from "@/components/ui/styles";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/supabase/errors";
import { isValidEmail, isValidPassword, normalizeEmail } from "@/lib/validation";

export default function RegisterPage() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const captcha = useCaptcha();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingCode, setAwaitingCode] = useState(false);
  // Jasa yang dipilih di panduan pemesanan (dibawa lewat ?service=…)
  const [service, setService] = useState<ServiceKey | null>(null);

  useEffect(() => {
    setService(parseService(new URLSearchParams(window.location.search).get("service")));
  }, []);

  const target = orderFormPath(service);

  const goDashboard = () => {
    router.replace(target);
    router.refresh();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return setError(t.auth.notConfigured);

    const cleanName = name.trim();
    const cleanEmail = normalizeEmail(email);
    if (!cleanName) return setError(t.errors.nameRequired);
    if (!isValidEmail(cleanEmail)) return setError(t.errors.emailInvalid);
    if (!isValidPassword(password)) return setError(t.errors.weakPassword);
    if (!captcha.ready) return setError(t.errors.captchaRequired);

    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: cleanName, preferred_language: lang },
        captchaToken: captcha.token,
      },
    });
    captcha.reset();
    setLoading(false);

    if (error) return setError(friendlyError(error, t));

    // Supabase tidak memberi error untuk email yang sudah terdaftar (demi privasi),
    // tapi daftar "identities"-nya kosong. Kita tangkap agar pengguna tidak bingung.
    if (data.user && data.user.identities?.length === 0) return setError(t.errors.alreadyRegistered);

    // Verifikasi email dimatikan di Supabase → langsung masuk.
    if (data.session) return goDashboard();

    setEmail(cleanEmail);
    setAwaitingCode(true);
  };

  if (awaitingCode) {
    const supabase = getSupabaseBrowser()!;
    return (
      <AuthShell title={t.auth.otpTitle} stepKey="otp">
        <OtpStep
          email={email}
          submitLabel={t.auth.otpVerify}
          onBack={() => setAwaitingCode(false)}
          onSubmit={async (code) => {
            const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
            if (error) return friendlyError(error, t);
            goDashboard();
            return null;
          }}
          onResend={async (captchaToken) => {
            const { error } = await supabase.auth.resend({ type: "signup", email, options: { captchaToken } });
            return error ? friendlyError(error, t) : null;
          }}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t.auth.registerTitle} subtitle={t.auth.registerSubtitle} stepKey="form">
      <OrderSteps current={2} hint={t.guide.registerHint} className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-4" />
      <GoogleButton onError={setError} next={target} />

      <form onSubmit={submit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="name" className={labelClass}>{t.auth.fullName}</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder={t.auth.fullNamePlaceholder}
            maxLength={100}
            required
            className={inputClass}
          />
        </div>
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
        <PasswordInput
          id="password"
          label={t.auth.password}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          showStrength
        />

        {captcha.widget}
        {error && <FormMessage type="error">{error}</FormMessage>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          {t.auth.registerSubmit}
        </Button>
      </form>

      <p className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-zinc-500">
        {t.auth.haveAccount}{" "}
        <Link href={`/login?next=${encodeURIComponent(target)}`} className="font-medium text-gold hover:underline">
          {t.auth.signInLink}
        </Link>
      </p>
    </AuthShell>
  );
}
