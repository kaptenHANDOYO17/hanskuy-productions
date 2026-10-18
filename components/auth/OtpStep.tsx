"use client";

import { useEffect, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import { FormMessage } from "@/components/auth/AuthShell";
import { useCaptcha } from "@/components/auth/Captcha";
import { inputClass, labelClass } from "@/components/ui/styles";
import { fmt } from "@/lib/i18n/dictionaries";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { cleanCode, isValidCode } from "@/lib/validation";

type Props = {
  email: string;
  submitLabel: string;
  /** Mengembalikan pesan error, atau null bila berhasil. */
  onSubmit: (code: string) => Promise<string | null>;
  /** Mengirim ulang kode. Mengembalikan pesan error, atau null bila berhasil. */
  onResend: (captchaToken?: string) => Promise<string | null>;
  onBack: () => void;
  initialCooldown?: number;
  notice?: string;
  /** Kolom tambahan (mis. sandi baru) yang ikut dikirim bersama kode. */
  children?: React.ReactNode;
};

const COOLDOWN = 60;

/**
 * Langkah "masukkan kode dari email".
 * Kode angka lebih andal daripada link: tidak gagal walau email dibuka
 * di HP/browser lain, dan tidak "terpakai" oleh pemindai keamanan email.
 */
export default function OtpStep({
  email,
  submitLabel,
  onSubmit,
  onResend,
  onBack,
  initialCooldown = COOLDOWN,
  notice,
  children,
}: Props) {
  const { t } = useI18n();
  const captcha = useCaptcha();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(notice ?? null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!isValidCode(code)) return setError(t.errors.codeFormat);
    setError(null);
    setLoading(true);
    const err = await onSubmit(code);
    setLoading(false);
    if (err) setError(err);
  };

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    if (!captcha.ready) return setError(t.errors.captchaRequired);
    setResending(true);
    setError(null);
    const err = await onResend(captcha.token);
    captcha.reset();
    setResending(false);
    if (err) return setError(err);
    setInfo(t.auth.otpResent);
    setCode("");
    setCooldown(COOLDOWN);
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="flex items-start gap-3 rounded-xl border border-gold/20 bg-gold/[0.06] p-4">
        <MailCheck size={20} className="mt-0.5 shrink-0 text-gold" />
        <div className="text-sm leading-relaxed text-zinc-300">
          <p className="font-medium text-white">{t.auth.otpTitle}</p>
          <p className="mt-1">{fmt(t.auth.otpBody, { email })}</p>
          <p className="mt-2 text-xs text-zinc-500">{t.auth.otpSpamTip}</p>
        </div>
      </div>

      <div>
        <label htmlFor="otp" className={labelClass}>{t.auth.otpCode}</label>
        <input
          id="otp"
          value={code}
          onChange={(e) => setCode(cleanCode(e.target.value))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="••••••"
          autoFocus
          className={`${inputClass} text-center font-mono text-2xl tracking-[0.5em]`}
        />
      </div>

      {children}

      {info && !error && <FormMessage type="success">{info}</FormMessage>}
      {error && <FormMessage type="error">{error}</FormMessage>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {submitLabel}
      </Button>

      {cooldown <= 0 && captcha.widget}

      <div className="flex flex-col items-center gap-3 text-sm sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0 || resending}
          className="text-zinc-400 transition-colors hover:text-gold disabled:cursor-not-allowed disabled:text-zinc-600"
        >
          {resending ? <Loader2 size={14} className="inline animate-spin" /> : null}{" "}
          {cooldown > 0 ? fmt(t.auth.otpResendIn, { s: cooldown }) : t.auth.otpResend}
        </button>
        <button type="button" onClick={onBack} className="text-zinc-500 transition-colors hover:text-gold">
          {t.auth.otpChangeEmail}
        </button>
      </div>
    </form>
  );
}
