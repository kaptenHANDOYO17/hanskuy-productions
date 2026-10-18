import type { Dictionary } from "@/lib/i18n/dictionaries";

type ErrorLike = { code?: string; message?: string; status?: number; name?: string } | null | undefined;

/**
 * Menerjemahkan pesan error teknis dari Supabase menjadi kalimat
 * yang dimengerti pelanggan, dalam bahasa yang sedang dipakai.
 */
export function friendlyError(err: ErrorLike, t: Dictionary): string {
  if (!err) return t.errors.generic;

  const code = err.code ?? "";
  const msg = (err.message ?? "").toLowerCase();
  const has = (s: string) => msg.includes(s);

  if (code === "invalid_credentials" || has("invalid login credentials")) return t.errors.invalidCredentials;
  if (code === "email_not_confirmed" || has("email not confirmed")) return t.errors.emailNotConfirmed;
  if (code === "user_already_exists" || code === "email_exists" || has("already registered")) {
    return t.errors.alreadyRegistered;
  }
  if (code === "weak_password" || has("password should")) return t.errors.weakPassword;
  if (code === "same_password" || has("different from the old")) return t.errors.samePassword;
  if (code === "otp_expired" || has("token has expired") || (has("invalid") && has("token"))) {
    return t.errors.codeInvalid;
  }
  if (code.startsWith("over_") || err.status === 429 || has("rate limit") || has("security purposes")) {
    return t.errors.rateLimit;
  }
  if (code.startsWith("captcha") || has("captcha")) return t.errors.captcha;
  if (code === "otp_disabled" || has("signups not allowed")) return t.errors.accountNotFound;
  if (code === "email_address_invalid") return t.errors.emailInvalid;
  if (err.name === "AuthRetryableFetchError" || has("failed to fetch") || has("network")) return t.errors.network;

  return t.errors.generic;
}
