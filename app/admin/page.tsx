import Link from "next/link";
import { redirect } from "next/navigation";
import AdminClient from "@/components/admin/AdminClient";
import AuthShell, { FormMessage } from "@/components/auth/AuthShell";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getLang } from "@/lib/i18n/server";
import type { AdminProject } from "@/lib/projects";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminPage() {
  const t = dictionaries[await getLang()];

  if (!isSupabaseConfigured) {
    return (
      <AuthShell title={t.admin.title}>
        <FormMessage type="info">{t.auth.notConfigured}</FormMessage>
      </AuthShell>
    );
  }

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  // Pemeriksaan sebenarnya ada di database (fungsi admin_* menolak non-admin).
  // Ini hanya agar non-admin melihat pesan yang ramah, bukan halaman kosong.
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    return (
      <AuthShell title={t.admin.title}>
        <FormMessage type="error">{t.errors.notAdmin}</FormMessage>
        <Link href="/dashboard" className="mt-6 inline-block text-sm text-gold hover:underline">
          {t.admin.back}
        </Link>
      </AuthShell>
    );
  }

  const { data } = await supabase.rpc("admin_list_projects");
  return <AdminClient initialProjects={(data ?? []) as AdminProject[]} />;
}
