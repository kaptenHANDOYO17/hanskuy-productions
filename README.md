# Hanskuy Productions

Bilingual (ID/EN) landing page with customer accounts, project submissions with budget offers, live progress tracking, an admin panel, and WhatsApp integration.

**Stack:** Next.js 15 (App Router) · React 19 · Tailwind CSS 3 · Framer Motion · Supabase (Auth + Postgres, `@supabase/ssr`) · Lucide React

👉 **Belum pernah ngoding?** Baca [PANDUAN.md](./PANDUAN.md) — langkah demi langkah dari nol sampai online.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + anon/publishable key
npm run dev                  # http://localhost:3000
```

Then run `supabase/schema.sql` in the Supabase SQL Editor, paste the templates in `supabase/email-templates/`, and add yourself to `public.admins` (see PANDUAN.md §5.1).

## Highlights

- **i18n:** all copy in `lib/i18n/dictionaries.ts`; language from cookie → `Accept-Language` fallback; server-rendered `<html lang>` and metadata.
- **Auth:** email + password with 6-digit email OTP verification, passwordless OTP sign-in, OTP-based password reset (token-hash links as fallback), optional Google OAuth and Cloudflare Turnstile. Cookie sessions verified server-side with `getUser()` in middleware and on protected pages.
- **Progress tracking:** `projects.progress` (0–100) + `project_updates` timeline (status, progress, message, http(s)-only link). Customers see a progress bar, 5-stage stepper, and history; the dashboard re-fetches every 45 s and on tab focus.
- **Admin panel (`/admin`):** gated by `public.admins` via `is_admin()`; reads/writes only through `SECURITY DEFINER` RPCs (`admin_list_projects`, `admin_save_project`) that re-check admin status, so customer grants stay minimal.
- **WhatsApp:** number in `lib/site.ts`; floating button, contact CTA, per-project "ask" links and post-submission confirmation with prefilled messages including a short project code; admin can notify customers with a prefilled update summary.
- **Data security:** RLS + column-level grants — customers read only their own projects/updates, insert only content columns, and can only move `pending → cancelled`; 10-pending-submissions cap.
- **Hardening:** security headers, open-redirect-safe `next` param, enumeration-safe reset, current-password check on password change, global sign-out.

## Structure

```
app/            page · layout · login · register · forgot-password · dashboard · admin · auth/{callback,confirm}
components/     sections/ · auth/ · dashboard/ · admin/ · ui/
lib/            i18n/ · supabase/ · site.ts · whatsapp.ts · validation.ts · projects.ts
supabase/       schema.sql · email-templates/
middleware.ts
```
