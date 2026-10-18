import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";
import AuthShell, { FormMessage } from "@/components/auth/AuthShell";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getLang } from "@/lib/i18n/server";
import { PROJECT_WITH_UPDATES, parseService, type Project } from "@/lib/projects";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  if (!isSupabaseConfigured) {
    const t = dictionaries[await getLang()];
    return (
      <AuthShell title={t.dashboard.myProjects}>
        <FormMessage type="info">{t.auth.notConfigured}</FormMessage>
      </AuthShell>
    );
  }

  const supabase = await createSupabaseServer();

  // getUser() memverifikasi sesi ke server Supabase — tidak bisa dipalsukan dari browser.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const [{ data: projects }, { data: isAdmin }] = await Promise.all([
    supabase.from("projects").select(PROJECT_WITH_UPDATES).order("created_at", { ascending: false }),
    supabase.rpc("is_admin"),
  ]);

  const meta = user.user_metadata ?? {};
  const hasPassword = (user.identities ?? []).some((i) => i.provider === "email");

  return (
    <DashboardClient
      user={{
        email: user.email ?? "",
        name: (meta.full_name || meta.name || "") as string,
        hasPassword,
      }}
      initialProjects={(projects ?? []) as Project[]}
      isAdmin={isAdmin === true}
      openForm={one(params.new) === "1"}
      startService={parseService(one(params.service))}
    />
  );
}
