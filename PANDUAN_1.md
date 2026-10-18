# 📖 Panduan Orang Awam — Website Hanskuy Productions

Panduan ini untuk Anda yang **belum pernah ngoding sama sekali**. Ikuti urutannya pelan-pelan.
Dari nol sampai website online dengan sistem akun pelanggan: kira-kira **1–2 jam**.

> 💡 Tampilan menu di Supabase, Vercel, dan lainnya kadang berubah sedikit. Jika nama tombol
> tidak persis sama, cari yang paling mirip — alurnya tetap sama.

---

## 🧭 Gambaran Besar (1 menit)

| Istilah teknis | Analogi sederhana |
|---|---|
| **Kode (folder ini)** | Cetak biru / denah rumah |
| **Node.js** | Tukang yang bisa membaca denah |
| **VS Code** | Meja kerja untuk membuka & mengedit denah |
| **Supabase** | Kantor arsip + satpam: menyimpan akun pelanggan & pengajuan proyek, dan memeriksa siapa boleh masuk |
| **GitHub** | Lemari arsip online untuk menyimpan denah |
| **Vercel** | Tanah + alamat tempat rumah dibangun (agar bisa dikunjungi orang) |

**Apa yang bisa dilakukan pelanggan Anda:**
1. Membuka website (Bahasa Indonesia atau Inggris — tombol **ID / EN** di kanan atas).
2. Membuat akun sendiri → menerima **kode 6 angka** di email → akun aktif.
3. Mengajukan proyek + **tawaran harga** + nomor WhatsApp-nya dari dasbor pribadinya.
4. **Memantau progres proyeknya**: persentase (0–100%), tahapan (Diajukan → Ditinjau → Diterima →
   Dikerjakan → Selesai), dan riwayat update lengkap dengan link hasil kerja. Dasbor diperbarui otomatis.
5. Tidak bingung harus mulai dari mana: **panduan interaktif "Cara Pesan"** muncul di kunjungan pertama
   dan menuntun langkah demi langkah sampai pesanan terkirim.
6. **Chat Anda di WhatsApp** dengan satu klik (tombol hijau di setiap halaman & di setiap proyek) —
   pesannya sudah terisi otomatis dengan kode & judul proyek, jadi Anda langsung tahu proyek yang mana.
7. Lupa sandi? Minta kode ke email → buat sandi baru → langsung masuk lagi.

**Apa yang Anda lakukan:** membuka **Panel Admin** (`/admin`) di website, lalu menggeser progres,
mengubah status, menulis pesan update, dan menempelkan link hasil. Setelah menyimpan, satu klik
**"Kabari pelanggan via WhatsApp"** mengirim ringkasan update ke WhatsApp pelanggan.

---

## LANGKAH 1 — Pasang alat (sekali saja)

1. **Node.js** → https://nodejs.org → unduh versi **LTS** → instal (Next, Next, Finish).
2. **VS Code** → https://code.visualstudio.com → unduh → instal.

Cek Node.js: buka **cmd** (Windows) atau **Terminal** (Mac), ketik `node -v`, tekan Enter.
Muncul angka seperti `v22.x.x` → ✅ berhasil.

---

## LANGKAH 2 — Buka & jalankan website di komputer Anda

1. Ekstrak `hanskuy-productions.zip` (klik kanan → *Extract All*).
2. Buka VS Code → **File → Open Folder** → pilih folder `hanskuy-productions`.
3. Menu **Terminal → New Terminal**. Ketik satu per satu, tekan Enter, tunggu selesai:
   ```
   npm install
   ```
   ```
   npm run dev
   ```
4. Buka Chrome → `http://localhost:3000` 🎉

- **Mematikan:** klik terminal, tekan `Ctrl + C`.
- **Menyalakan lagi:** `npm run dev` saja.

Pada tahap ini website sudah tampil, tetapi **daftar/masuk belum berfungsi** sampai Langkah 4 selesai.

---

## LANGKAH 3 — Mengubah isi website (tanpa takut merusak)

| Yang ingin diubah | Buka file |
|---|---|
| **Semua kalimat** (Indonesia & Inggris) | `lib/i18n/dictionaries.ts` |
| Nama brand di logo & **nomor WhatsApp** | `lib/site.ts` |
| Warna emas | `tailwind.config.ts` → cari `#d4af37` |

**Mengedit teks di `dictionaries.ts`:**
- File ini punya dua bagian: `const id = { ... }` (Indonesia) lalu `const en: Dictionary = { ... }` (Inggris).
- Cari teks dengan `Ctrl + F`, **ubah hanya tulisan di dalam tanda kutip** `"..."`.
- Jika mengubah kalimat Indonesia, **ubah juga pasangannya** di bagian Inggris.
- Simpan (`Ctrl + S`) → lihat hasilnya di browser.

😱 **Layar merah/error?** Tekan `Ctrl + Z` sampai normal lagi, simpan. Biasanya karena tanda kutip atau koma terhapus.

---

## LANGKAH 4 — Supabase: database & sistem akun (WAJIB)

### 4.1 Buat proyek
1. https://supabase.com → **Start your project** → daftar.
2. **New project** → nama `hanskuy-productions` → buat password database (simpan baik-baik) →
   region **Southeast Asia (Singapore)** → **Create**. Tunggu ±2 menit.

### 4.2 Buat tabel + aturan keamanan (sekali klik)
1. Menu kiri **SQL Editor** → **New query**.
2. Di VS Code, buka `supabase/schema.sql` → `Ctrl + A` → `Ctrl + C`.
3. Tempel di Supabase → klik **Run**. Muncul "Success" → ✅

> Aman dijalankan ulang. **Sudah pernah menjalankan versi sebelumnya?** Jalankan file ini sekali lagi —
> fitur progres & WhatsApp akan ditambahkan tanpa menghapus akun atau proyek yang sudah ada.

### 4.3 Hubungkan website ke Supabase
1. Menu kiri **Project Settings** (ikon gerigi) → **API** / **API Keys**. Catat:
   - **Project URL** (contoh `https://abcdxyz.supabase.co`)
   - **anon public key** atau **publishable key**
2. Di VS Code, salin `.env.example` → tempel → ganti nama jadi **`.env.local`**. Isi:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdxyz.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=kunci-anda
   ```
3. Matikan server (`Ctrl + C`) lalu `npm run dev` lagi.

> ⚠️ **Jangan pernah** menaruh **service_role key / secret key** di file ini atau membagikannya.

### 4.4 Pengaturan akun (Authentication)
Menu kiri **Authentication**, lalu:

| Bagian | Atur menjadi |
|---|---|
| **Sign In / Providers → Email** | Aktif. **Confirm email: ON** (agar akun palsu tidak bisa dibuat dengan email orang lain) |
| **Sign In / Providers → Email → Minimum password length** | `8` |
| **Password requirements** | `Letters and digits` (huruf & angka) |
| **URL Configuration → Site URL** | `http://localhost:3000` (nanti diganti alamat Vercel di Langkah 7) |
| **URL Configuration → Redirect URLs** | tambahkan `http://localhost:3000/**` |

### 4.5 Pasang template email (kode 6 angka, dua bahasa)
Menu **Authentication → Emails** (atau *Email Templates*). Untuk masing-masing template:
buka file di VS Code → salin semua → tempel ke kotak **Message body** → ubah **Subject** → **Save**.

| Template di Supabase | File di proyek | Subject |
|---|---|---|
| **Confirm signup** | `supabase/email-templates/1-confirm-signup.html` | `Kode verifikasi Hanskuy Productions / Your verification code` |
| **Magic Link** | `supabase/email-templates/2-magic-link.html` | `Kode masuk Hanskuy Productions / Your sign-in code` |
| **Reset Password** | `supabase/email-templates/3-reset-password.html` | `Kode reset sandi Hanskuy Productions / Your password reset code` |

**Kenapa kode, bukan link?** Link sering gagal: dibuka di HP padahal daftar di laptop, atau "terpakai"
duluan oleh pemindai keamanan email kantor. Kode 6 angka selalu berhasil. (Link tetap disertakan sebagai cadangan.)

### 4.6 ⚠️ PENTING: Layanan pengirim email sendiri (sebelum dipakai pelanggan sungguhan)

Pengirim email bawaan Supabase **hanya untuk uji coba**: jatahnya sangat sedikit per jam dan
umumnya hanya mengirim ke email anggota tim proyek Anda. Pelanggan sungguhan **tidak akan menerima kode**
sampai Anda memasang pengirim sendiri. Cara termudah dengan **Resend** (gratis 3.000 email/bulan):

1. Daftar di https://resend.com.
2. **Domains → Add Domain** → masukkan domain Anda (misal `hanskuyproductions.com`) → ikuti petunjuk
   menambahkan catatan DNS di tempat Anda membeli domain → tunggu status **Verified**.
3. **API Keys → Create API Key** → salin.
4. Supabase → **Authentication → Emails → SMTP Settings** → **Enable Custom SMTP**:

   | Kolom | Isi |
   |---|---|
   | Sender email | `noreply@hanskuyproductions.com` (domain Anda) |
   | Sender name | `Hanskuy Productions` |
   | Host | `smtp.resend.com` |
   | Port | `465` |
   | Username | `resend` |
   | Password | API key Resend tadi |

5. Supabase → **Authentication → Rate Limits** → naikkan batas email per jam (misal `30`).

> Belum punya domain? Beli dulu (±Rp150 ribu/tahun di Niagahoster, Domainesia, Cloudflare, dll.).
> Domain yang sama nanti juga dipakai untuk alamat website Anda.

### 4.7 Uji coba 🧪
1. Buka `http://localhost:3000/register` → daftar dengan email Anda.
2. Cek email → masukkan kode → otomatis masuk ke **Dasbor**.
3. Klik **Ajukan Proyek Baru** → isi → **Kirim Pengajuan**.
4. Coba **Keluar**, lalu **Masuk** lagi; coba juga **Lupa sandi**.

---

## LANGKAH 5 — Jadikan akun Anda Admin & kelola progres proyek

### 5.1 Jadikan akun Anda admin (sekali saja)
1. Daftar di website Anda sendiri (`/register`) seperti pelanggan biasa, dengan email Anda.
2. Supabase → **SQL Editor** → **New query** → tempel kode ini (**ganti emailnya** dengan email Anda) → **Run**:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'email-anda@gmail.com';
   ```
   Muncul `INSERT 0 1` → ✅ berhasil. (Jika `INSERT 0 0`: emailnya salah ketik atau belum mendaftar.)
3. Buka website → **Dasbor**. Kini muncul kotak emas **"Buka Panel Admin"**. Atau langsung ke `/admin`.

> Ingin menambah admin lain (misal partner)? Ulangi langkah 2 dengan email mereka.
> Pelanggan biasa yang membuka `/admin` hanya melihat pesan "Halaman ini khusus admin".

### 5.2 Memperbarui progres pekerjaan
Di **Panel Admin**, setiap proyek tampil lengkap dengan nama, email, WhatsApp, dan tawaran harga pelanggan.

1. Klik **"Kelola & perbarui progres"** pada proyek.
2. Atur **Status** dan geser **Progres** (atau klik 0/25/50/75/100%).
   - Memilih status **Selesai** otomatis membuat progres 100%.
   - Menggeser progres dari 0 otomatis mengubah status menjadi **Sedang dikerjakan**.
3. (Opsional) Tulis **Pesan update**, misal *"Desain halaman utama selesai."*
4. (Opsional) Tempel **Link hasil / preview**: link Google Drive, Figma, website percobaan, dll.
5. (Opsional) **Catatan untuk pelanggan**: tampil sebagai kotak "Catatan dari saya" (harga final, jadwal, dll.).
6. Klik **Simpan & Kirim Update** → pelanggan langsung melihatnya di dasbor (otomatis diperbarui tiap ±45 detik).
7. Klik tombol hijau **"Kabari pelanggan via WhatsApp"** → WhatsApp terbuka dengan ringkasan update
   yang sudah tersusun rapi → tinggal tekan **Kirim**.

Setiap kali progres, status, atau pesan berubah, satu entri ditambahkan ke **Riwayat progres** yang
bisa dibaca pelanggan — mereka bisa melihat perjalanan pekerjaannya dari awal sampai selesai.

### 5.3 Nomor WhatsApp
Nomor Anda (**0895-3781-69126**) sudah terpasang. Untuk menggantinya, buka `lib/site.ts`:
```ts
whatsapp: {
  number: "62895378169126",     // ← format internasional: 0 di depan diganti 62, tanpa spasi/tanda
  display: "0895-3781-69126",   // ← cara nomor ditampilkan di website
},
```
Tombol WhatsApp muncul di: pojok kanan bawah semua halaman, bagian Kontak, setiap kartu proyek
pelanggan, dan setelah pelanggan mengajukan proyek. Setiap pesan otomatis menyertakan **kode proyek**
(misal `#A1B2C3D4`) yang juga tampil di Panel Admin, jadi Anda langsung tahu proyek yang dimaksud.

### 5.4 Panduan pemesanan interaktif ("Cara Pesan")
Agar pengunjung tidak bingung harus menekan apa dulu, website punya panduan bergerak 4 langkah:

1. **Pilih jasa** → 2. **Buat akun gratis** → 3. **Isi detail & tawaran** → 4. **Pantau progres**

- Panduan **muncul otomatis** ±2 detik setelah pengunjung pertama kali membuka beranda (hanya sekali per browser).
- Tombol yang harus ditekan selalu **menyala** dan ditunjuk oleh **kursor bergerak**.
- Jasa yang dipilih di panduan **terbawa otomatis** sampai ke formulir pesanan di dasbor.
- Penanda **"Langkah X dari 4"** tetap menemani di halaman daftar dan dasbor, sampai pesanan terkirim.
- Bisa dibuka lagi kapan saja lewat tombol **"Cara Pesan"** di navbar, tombol **"Buktikan Sekarang"**,
  tautan **"Pertama kali? Lihat cara pesan"** di bawahnya, atau tombol **"Ajukan Proyek"**.
- Ada pilihan **"Masih ragu? Tanya dulu via WhatsApp"** dengan pesan yang sudah menyebut jasa pilihannya.

**Ingin melihat panduan muncul otomatis lagi** (misal untuk mengetes)? Buka website di jendela
Incognito/Private, atau hapus data situs di pengaturan browser.

**Mengubah teks panduan:** `lib/i18n/dictionaries.ts` → cari bagian `guide:` (ada di bagian Indonesia dan Inggris).

### 5.5 Lainnya
- **Pesan singkat dari pengunjung** (formulir "Hanya ingin bertanya singkat?") ada di Supabase → **Table Editor → `leads`**.
- Cadangan bila website sedang bermasalah: Supabase → **Table Editor → `projects_inbox`** menampilkan semua pengajuan.

---

## LANGKAH 6 (OPSIONAL) — Tambahan kemudahan & keamanan

### 6A. Tombol "Lanjutkan dengan Google" (daftar 1 klik)
1. Buka https://console.cloud.google.com → buat proyek baru.
2. **APIs & Services → OAuth consent screen** → isi nama aplikasi & email → simpan.
3. **Credentials → Create Credentials → OAuth client ID** → tipe **Web application**.
4. Di **Authorized redirect URIs** tambahkan:
   `https://abcdxyz.supabase.co/auth/v1/callback` (ganti `abcdxyz` dengan ID proyek Supabase Anda).
5. Salin **Client ID** & **Client Secret** → Supabase → **Authentication → Sign In / Providers → Google**
   → aktifkan → tempel → **Save**.
6. Di `.env.local` (dan di Vercel), ubah: `NEXT_PUBLIC_AUTH_GOOGLE=true` → jalankan ulang server.

### 6B. Perisai anti-bot Cloudflare Turnstile (gratis, tanpa teka-teki gambar)
Mencegah robot membuat ribuan akun palsu atau menebak sandi.
1. Daftar di https://dash.cloudflare.com → menu **Turnstile** → **Add widget**.
2. Isi nama, tambahkan domain Anda **dan** `localhost` → mode **Managed** → **Create**.
3. Catat **Site Key** dan **Secret Key**.
4. Supabase → **Authentication → Attack Protection** → **Enable Captcha protection** →
   pilih **Turnstile** → tempel **Secret Key** → **Save**.
5. Di `.env.local` (dan di Vercel): `NEXT_PUBLIC_TURNSTILE_SITE_KEY=site-key-anda` → jalankan ulang server.

> ⚠️ **Langkah 4 dan 5 harus dilakukan bersamaan.** Jika CAPTCHA aktif di Supabase tetapi
> Site Key belum diisi di website, semua pelanggan akan gagal daftar/masuk.

---

## LANGKAH 7 — Simpan ke GitHub & online-kan dengan Vercel

### GitHub
1. Daftar di https://github.com, unduh **GitHub Desktop** (https://desktop.github.com) → login.
2. **File → Add local repository** → pilih folder `hanskuy-productions` → *create a repository*.
3. **Publish repository** → biarkan **Keep this code private** tercentang → **Publish**.

`.env.local` (berisi kunci) **otomatis tidak ikut terunggah** — memang disengaja.

### Vercel
1. https://vercel.com → **Continue with GitHub** → **Add New… → Project** → pilih `hanskuy-productions` → **Import**.
2. **Environment Variables** → masukkan semua isi `.env.local` Anda (nama & nilai sama persis).
3. **Deploy** → tunggu 1–2 menit → website online, misal `hanskuy-productions.vercel.app`.

### Setelah online — WAJIB
Supabase → **Authentication → URL Configuration**:
- **Site URL** → ganti menjadi alamat website Anda (misal `https://hanskuyproductions.com`).
- **Redirect URLs** → tambahkan `https://hanskuyproductions.com/**` (dan `https://hanskuy-productions.vercel.app/**`).

**Domain sendiri:** Vercel → proyek → **Settings → Domains** → masukkan domain → ikuti petunjuk DNS.

**Update website:** ubah file → GitHub Desktop → tulis ringkasan → **Commit to main** → **Push origin**.
Vercel memperbarui otomatis dalam 1–2 menit.

---

## 🛡️ Apa saja yang melindungi akun pelanggan Anda?

| Perlindungan | Artinya |
|---|---|
| Sandi dienkripsi satu arah (oleh Supabase) | Bahkan Anda tidak bisa melihat sandi pelanggan |
| Verifikasi email dengan kode | Orang tidak bisa mendaftar memakai email orang lain |
| Sesi diperiksa ulang di server | Halaman dasbor tidak bisa dibuka dengan "mengakali" browser |
| Aturan database per baris & per kolom | Pelanggan hanya bisa melihat proyeknya sendiri; tidak bisa mengubah harga, status, atau catatan Anda setelah mengirim |
| Batas 10 pengajuan "menunggu" per akun | Mencegah spam pengajuan |
| Lupa sandi tidak membocorkan data | Halaman tidak memberi tahu apakah sebuah email terdaftar |
| Panel Admin dikunci di database | Hanya akun di daftar admin yang bisa melihat semua proyek atau mengubah progres — pelanggan tidak bisa menaikkan progres atau mengubah status proyeknya sendiri |
| Link hasil kerja diperiksa | Hanya link `http://` / `https://` yang diterima, sehingga tidak bisa disisipi link berbahaya |
| Ganti sandi wajib sandi lama | Orang yang meminjam perangkat tidak bisa mengambil alih akun |
| "Keluar dari semua perangkat" | Jika HP pelanggan hilang, sesinya bisa dimatikan semua |
| Batas percobaan (Supabase) + Turnstile opsional | Menghalangi robot penebak sandi |
| Header keamanan & pengalihan aman | Website tidak bisa disisipkan ke situs penipu, link tidak bisa dibelokkan |

---

## 🆘 Masalah yang Sering Terjadi

| Gejala | Solusi |
|---|---|
| `'npm' is not recognized` | Node.js belum terpasang. Ulangi Langkah 1, tutup & buka ulang VS Code. |
| "Sistem akun belum terhubung ke database" | `.env.local` belum dibuat/diisi, atau server belum dijalankan ulang. |
| Kode verifikasi tidak sampai | Cek folder Spam/Promosi. Untuk pelanggan sungguhan, **wajib** Langkah 4.6 (SMTP sendiri). |
| "Terlalu banyak percobaan" | Batas email per jam tercapai. Tunggu, atau naikkan di **Authentication → Rate Limits** (setelah SMTP sendiri). |
| "Kode salah atau sudah kedaluwarsa" | Pakai kode di email **paling baru**; kode berlaku 1 jam. Klik **Kirim ulang kode**. |
| Email berisi link, bukan kode | Template email belum diganti (Langkah 4.5). |
| "Verifikasi keamanan gagal" | Turnstile aktif di Supabase tapi Site Key di website kosong/salah (Langkah 6B). |
| Tombol Google tidak muncul | `NEXT_PUBLIC_AUTH_GOOGLE` belum `true`, atau server belum dijalankan ulang. |
| Di Vercel daftar/masuk gagal | Environment Variables belum diisi → isi → **Deployments → ⋯ → Redeploy**. Cek juga Site URL (Langkah 7). |
| Pengajuan gagal terkirim | Pastikan `schema.sql` **versi terbaru** sudah dijalankan. Jika pelanggan punya 10 pengajuan menunggu, itu batas anti-spam. |
| Kotak "Buka Panel Admin" tidak muncul | Langkah 5.1 belum dilakukan, atau email di kode SQL berbeda dengan email akun Anda. Keluar lalu masuk lagi. |
| `/admin` bilang "Halaman ini khusus admin" | Sama seperti di atas — akun ini belum ada di daftar admin. |
| Progres di dasbor pelanggan belum berubah | Dasbor memperbarui otomatis tiap ±45 detik atau saat tab dibuka kembali. Pelanggan juga bisa memuat ulang halaman. |
| Tombol WhatsApp membuka nomor yang salah | Periksa `number` di `lib/site.ts`: harus diawali `62`, tanpa `0`, `+`, spasi, atau tanda hubung. |
| "Kabari pelanggan via WhatsApp" tidak muncul | Pelanggan tidak mengisi nomor WhatsApp saat mengajukan. Hubungi lewat email yang tertera. |
| Huruf terlihat biasa, bukan elegan | Perlu internet saat `npm run dev` pertama kali agar font terunduh. |

---

## 🗂️ Peta Folder

```
hanskuy-productions/
├── app/
│   ├── page.tsx              → Beranda (menyusun semua bagian)
│   ├── layout.tsx            → Kerangka: font, bahasa, navbar, tombol WhatsApp
│   ├── login/                → Halaman Masuk
│   ├── register/             → Halaman Daftar
│   ├── forgot-password/      → Halaman Lupa Sandi
│   ├── dashboard/            → Dasbor pelanggan (proyek + progres)
│   ├── admin/                → Panel Admin (khusus Anda)
│   └── auth/                 → Penerima link email & login Google (jangan diubah)
├── components/
│   ├── sections/             → Bagian beranda: Hero, Layanan, Keunggulan, Kontak
│   ├── auth/                 → Formulir akun: kolom sandi, kode email, Google, anti-bot
│   ├── dashboard/            → Formulir pengajuan, kartu proyek, bilah progres, panel akun
│   ├── admin/                → Daftar proyek & formulir update progres (Panel Admin)
│   ├── guide/                → Panduan pemesanan interaktif & penanda "Langkah X dari 4"
│   └── ui/                   → Navbar, tombol ID/EN, Tombol, Kartu, Footer
├── lib/
│   ├── i18n/dictionaries.ts  → ⭐ SEMUA TEKS (Indonesia & Inggris)
│   ├── site.ts               → ⭐ Nama brand
│   └── supabase/             → Sambungan & keamanan database
├── supabase/
│   ├── schema.sql            → ⭐ Tempel di SQL Editor Supabase
│   └── email-templates/      → ⭐ Tempel di Email Templates Supabase
├── middleware.ts             → Satpam halaman dasbor
└── .env.example              → Contoh isi kunci rahasia
```

Selamat. Anda baru saja membangun sistem yang biasanya ditagih agensi puluhan juta rupiah.
Ironis, bukan? 😉
