-- =====================================================================
--  HANSKUY PRODUCTIONS — SKEMA DATABASE
--  Cara pakai: Supabase → SQL Editor → New query → tempel SELURUH isi
--  file ini → Run. Aman dijalankan ulang kapan saja.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) LEADS — pesan singkat dari formulir "Hanya ingin bertanya?" di beranda
--    Siapa pun boleh MENGIRIM. Tidak ada yang bisa MEMBACA kecuali Anda
--    (lewat dasbor Supabase).
-- ---------------------------------------------------------------------
create table if not exists public.leads (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) <= 120),
  contact     text not null check (char_length(contact) <= 200),
  service     text,
  message     text not null check (char_length(message) <= 5000)
);

alter table public.leads enable row level security;

drop policy if exists "Pengunjung boleh mengirim pesan" on public.leads;
drop policy if exists "leads_insert_public" on public.leads;
create policy "leads_insert_public"
  on public.leads for insert
  to anon, authenticated
  with check (true);


-- ---------------------------------------------------------------------
-- 2) PROJECTS — pengajuan proyek & tawaran harga dari pelanggan
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now(),
  title        text not null check (char_length(title) between 3 and 150),
  service      text not null check (service in ('website', 'ai', 'chatbot', 'data', 'unsure')),
  description  text not null check (char_length(description) between 10 and 5000),
  budget       bigint check (budget is null or budget between 0 and 1000000000000),
  currency     text not null default 'IDR' check (currency in ('IDR', 'USD')),
  deadline     date,
  status       text not null default 'pending'
               check (status in ('pending', 'reviewing', 'accepted', 'in_progress', 'completed', 'rejected', 'cancelled')),
  admin_note   text check (admin_note is null or char_length(admin_note) <= 5000)
);

create index if not exists projects_user_created_idx on public.projects (user_id, created_at desc);

-- Kolom tambahan (versi 3): progres, WhatsApp pelanggan, waktu pembaruan terakhir.
-- "if not exists" → aman untuk database yang dibuat dengan versi sebelumnya.
alter table public.projects add column if not exists progress   smallint not null default 0;
alter table public.projects add column if not exists whatsapp   text;
alter table public.projects add column if not exists updated_at timestamptz not null default now();

alter table public.projects drop constraint if exists projects_progress_check;
alter table public.projects add  constraint projects_progress_check check (progress between 0 and 100);
alter table public.projects drop constraint if exists projects_whatsapp_check;
alter table public.projects add  constraint projects_whatsapp_check check (whatsapp is null or whatsapp ~ '^[1-9][0-9]{7,14}$');

-- updated_at otomatis diperbarui setiap kali baris berubah
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

alter table public.projects enable row level security;

-- Hak akses per KOLOM: pelanggan hanya bisa mengisi data proyeknya.
-- Ia TIDAK bisa mengisi/mengubah pemilik (user_id), status, atau catatan Anda (admin_note).
revoke all on public.projects from anon;
revoke insert, update, delete on public.projects from authenticated;
grant select on public.projects to authenticated;
grant insert (title, service, description, budget, currency, deadline, whatsapp) on public.projects to authenticated;
grant update (status) on public.projects to authenticated;

-- Pelanggan hanya bisa MELIHAT proyek miliknya sendiri.
drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
  on public.projects for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Penghitung pengajuan "menunggu" milik pengguna yang sedang login.
-- (Fungsi khusus agar aturan di bawah tidak memeriksa dirinya sendiri berulang-ulang.)
create or replace function public.my_pending_project_count()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int
  from public.projects
  where user_id = auth.uid() and status = 'pending';
$$;

revoke all on function public.my_pending_project_count() from public, anon;
grant execute on function public.my_pending_project_count() to authenticated;

-- Pelanggan hanya bisa MENGAJUKAN atas namanya sendiri,
-- maksimal 10 pengajuan yang masih "menunggu" (mencegah spam).
drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
  on public.projects for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and public.my_pending_project_count() < 10
  );

-- Pelanggan hanya bisa MEMBATALKAN pengajuan miliknya yang masih "menunggu".
drop policy if exists "projects_cancel_own_pending" on public.projects;
create policy "projects_cancel_own_pending"
  on public.projects for update
  to authenticated
  using ((select auth.uid()) = user_id and status = 'pending')
  with check ((select auth.uid()) = user_id and status = 'cancelled');


-- ---------------------------------------------------------------------
-- 3) PROJECT_UPDATES — riwayat progres yang dilihat pelanggan di dasbornya
--    Pelanggan hanya bisa MEMBACA riwayat proyek miliknya sendiri.
--    Hanya admin (lewat Panel Admin) yang bisa menulis.
-- ---------------------------------------------------------------------
create table if not exists public.project_updates (
  id          bigint generated always as identity primary key,
  project_id  uuid not null references public.projects (id) on delete cascade,
  created_at  timestamptz not null default now(),
  status      text not null
              check (status in ('pending', 'reviewing', 'accepted', 'in_progress', 'completed', 'rejected', 'cancelled')),
  progress    smallint not null check (progress between 0 and 100),
  message     text check (message is null or char_length(message) <= 2000),
  link        text check (link is null or (char_length(link) <= 500 and link ~* '^https?://[^[:space:]]+$'))
);

create index if not exists project_updates_project_idx on public.project_updates (project_id, created_at desc);

alter table public.project_updates enable row level security;

revoke all on public.project_updates from anon;
revoke insert, update, delete on public.project_updates from authenticated;
grant select on public.project_updates to authenticated;

drop policy if exists "project_updates_select_own" on public.project_updates;
create policy "project_updates_select_own"
  on public.project_updates for select
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = (select auth.uid())
    )
  );


-- ---------------------------------------------------------------------
-- 4) ADMIN — daftar akun yang boleh membuka Panel Admin (/admin)
--    Tabel ini TIDAK bisa diakses dari website sama sekali; hanya dari Supabase.
--    Cara menjadikan akun Anda admin (setelah mendaftar di website):
--
--      insert into public.admins (user_id)
--      select id from auth.users where email = 'email-anda@gmail.com';
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;


-- Semua proyek + nama, email, dan WhatsApp pelanggan (khusus admin)
drop function if exists public.admin_list_projects();
create function public.admin_list_projects()
returns table (
  id uuid, created_at timestamptz, updated_at timestamptz,
  title text, service text, description text,
  budget bigint, currency text, deadline date,
  status text, progress smallint, admin_note text, whatsapp text,
  customer_name text, customer_email text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;

  return query
    select p.id, p.created_at, p.updated_at,
           p.title, p.service, p.description,
           p.budget, p.currency, p.deadline,
           p.status, p.progress, p.admin_note, p.whatsapp,
           (u.raw_user_meta_data ->> 'full_name')::text,
           u.email::text
    from public.projects p
    join auth.users u on u.id = p.user_id
    order by p.created_at desc;
end;
$$;

revoke all on function public.admin_list_projects() from public, anon;
grant execute on function public.admin_list_projects() to authenticated;


-- Simpan status, progres, catatan, dan (opsional) tambahkan entri riwayat progres (khusus admin)
drop function if exists public.admin_save_project(uuid, text, integer, text, text, text);
create function public.admin_save_project(
  p_id       uuid,
  p_status   text,
  p_progress integer,
  p_note     text default null,
  p_message  text default null,
  p_link     text default null
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_old_status   text;
  v_old_progress smallint;
  v_message      text := nullif(btrim(p_message), '');
  v_link         text := nullif(btrim(p_link), '');
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;

  select status, progress into v_old_status, v_old_progress
  from public.projects where id = p_id
  for update;

  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;

  update public.projects
     set status = p_status,
         progress = p_progress,
         admin_note = nullif(btrim(p_note), '')
   where id = p_id;

  -- Catat ke riwayat hanya bila ada yang berubah atau ada pesan/link baru
  if v_message is not null
     or v_link is not null
     or p_status is distinct from v_old_status
     or p_progress is distinct from v_old_progress then
    insert into public.project_updates (project_id, status, progress, message, link)
    values (p_id, p_status, p_progress, v_message, v_link);
  end if;
end;
$$;

revoke all on function public.admin_save_project(uuid, text, integer, text, text, text) from public, anon;
grant execute on function public.admin_save_project(uuid, text, integer, text, text, text) to authenticated;


-- ---------------------------------------------------------------------
-- 5) TAMPILAN CADANGAN UNTUK ANDA di Supabase → Table Editor → "projects_inbox"
--    (Panel Admin di website lebih mudah; ini hanya cadangan.)
-- ---------------------------------------------------------------------
drop view if exists public.projects_inbox;
create view public.projects_inbox
with (security_invoker = true) as
select
  p.created_at,
  p.status,
  p.progress,
  p.title,
  p.service,
  p.budget,
  p.currency,
  p.deadline,
  u.email,
  u.raw_user_meta_data ->> 'full_name' as customer_name,
  p.whatsapp,
  p.description,
  p.admin_note,
  p.id
from public.projects p
join auth.users u on u.id = p.user_id
order by p.created_at desc;

revoke all on public.projects_inbox from anon, authenticated;
