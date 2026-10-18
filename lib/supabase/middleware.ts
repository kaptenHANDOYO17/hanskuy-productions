import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { orderFormPath, parseService } from "@/lib/projects";
import { safeNext } from "@/lib/validation";
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

const PROTECTED = ["/dashboard", "/admin"];
const GUEST_ONLY = ["/login", "/register"];

/**
 * Berjalan sebelum halaman akun dibuka:
 * - memperbarui sesi login yang hampir kedaluwarsa,
 * - memverifikasi pengguna ke server Supabase (bukan sekadar membaca cookie),
 * - mengarahkan tamu dari /dashboard ke /login, dan pengguna yang sudah masuk dari /login ke /dashboard.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  /** Alihkan ke alamat di dalam website ini (boleh berisi ?query). */
  const redirectTo = (target: string) => {
    const redirect = NextResponse.redirect(new URL(target, request.url));
    // Bawa cookie sesi yang baru diperbarui agar tidak hilang saat dialihkan.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!user && PROTECTED.some((p) => path.startsWith(p))) {
    // Simpan tujuan lengkap (termasuk ?service=…) agar setelah masuk langsung kembali ke sana.
    return redirectTo(`/login?next=${encodeURIComponent(path + request.nextUrl.search)}`);
  }
  if (user && GUEST_ONLY.includes(path)) {
    const params = request.nextUrl.searchParams;
    const service = parseService(params.get("service"));
    const target = params.get("next") ? safeNext(params.get("next")) : service ? orderFormPath(service) : "/dashboard";
    return redirectTo(target);
  }

  return response;
}
