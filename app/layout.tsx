import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Navbar from "@/components/ui/Navbar";
import MotionProvider from "@/components/ui/MotionProvider";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import { GuideProvider } from "@/components/guide/GuideProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getLang } from "@/lib/i18n/server";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const { meta } = dictionaries[lang];
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "website",
      locale: lang === "id" ? "id_ID" : "en_US",
      siteName: "Hanskuy Productions",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();

  return (
    <html lang={lang} className={`${serif.variable} ${sans.variable}`}>
      <body>
        <LanguageProvider initialLang={lang}>
          <MotionProvider>
            <GuideProvider>
              <Navbar />
              {children}
              <WhatsAppFloat />
            </GuideProvider>
          </MotionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
