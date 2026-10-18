/**
 * IDENTITAS WEBSITE
 * Nama brand dipakai di navbar, footer, dan email.
 * Slogan & semua teks lain ada di lib/i18n/dictionaries.ts (dua bahasa).
 */
export const siteConfig = {
  name: "Hanskuy Productions",
  /** Bagian nama yang ditulis biasa & bagian yang diberi warna emas di logo */
  logo: { main: "Hanskuy", accent: "Productions" },

  /**
   * NOMOR WHATSAPP ANDA
   * `number`  : format internasional, hanya angka, tanpa "+" dan tanpa 0 di depan (0895… → 62895…)
   * `display` : cara nomor ditampilkan di website
   */
  whatsapp: {
    number: "62895378169126",
    display: "0895-3781-69126",
  },
};

export const navLinks = [
  { key: "services", href: "/#services" },
  { key: "advantages", href: "/#advantages" },
  { key: "contact", href: "/#contact" },
] as const;
