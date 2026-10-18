"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { dictionaries, type Dictionary, type Lang } from "./dictionaries";

type I18nContext = {
  lang: Lang;
  t: Dictionary;
  setLang: (lang: Lang) => void;
};

const Context = createContext<I18nContext | null>(null);

export const LANG_COOKIE = "lang";

export function LanguageProvider({ initialLang, children }: { initialLang: Lang; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const mounted = useRef(false);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    // Diingat selama 1 tahun, agar kunjungan berikutnya langsung memakai bahasa ini.
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    if (mounted.current) document.title = dictionaries[lang].meta.title;
    mounted.current = true;
  }, [lang]);

  const value = useMemo(() => ({ lang, t: dictionaries[lang], setLang }), [lang, setLang]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useI18n() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useI18n harus dipakai di dalam <LanguageProvider>");
  return ctx;
}

/** Format tanggal & angka sesuai bahasa. */
export function localeOf(lang: Lang) {
  return lang === "id" ? "id-ID" : "en-US";
}
