import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { safeNext } from "@/lib/validation";

const ALLOWED_TYPES: EmailOtpType[] = ["email", "signup", "magiclink", "recovery", "email_change"];

/**
 * Tujuan link di dalam email (alternatif selain kode).
 * Bekerja di browser mana pun karena memakai token_hash, bukan sesi browser asal.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type && ALLOWED_TYPES.includes(type)) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      const next = type === "recovery" ? "/forgot-password?step=reset" : safeNext(searchParams.get("next"));
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link`);
}
