"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import OrderGuide, { type GuideScreen } from "@/components/guide/OrderGuide";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type GuideContext = {
  /** Buka panduan pemesanan. `screen: "choose"` langsung ke pilihan jasa. */
  openGuide: (screen?: GuideScreen) => void;
  /** Sudah pernah melihat panduan? (untuk efek "pulse" di tombol Cara Pesan) */
  seen: boolean;
  signedIn: boolean;
};

const Context = createContext<GuideContext | null>(null);

const SEEN_KEY = "hk_order_guide_seen";
const AUTO_OPEN_DELAY = 1800;

/** Penyimpanan lokal bisa diblokir (mode privat, dll.) — jangan sampai membuat website error. */
function readSeen() {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}
function writeSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* abaikan */
  }
}

export function GuideProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<GuideScreen>("intro");
  const [seen, setSeen] = useState(true); // anggap sudah, sampai dicek di browser (menghindari kedip)
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  // Kunjungan pertama ke beranda → panduan muncul otomatis sekali.
  useEffect(() => {
    const alreadySeen = readSeen();
    setSeen(alreadySeen);
    if (alreadySeen || pathname !== "/") return;
    const id = setTimeout(() => {
      setScreen("intro");
      setOpen(true);
    }, AUTO_OPEN_DELAY);
    return () => clearTimeout(id);
  }, [pathname]);

  const openGuide = useCallback((s: GuideScreen = "intro") => {
    setScreen(s);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setSeen(true);
    writeSeen();
  }, []);

  const value = useMemo(() => ({ openGuide, seen, signedIn }), [openGuide, seen, signedIn]);

  return (
    <Context.Provider value={value}>
      {children}
      <OrderGuide open={open} initialScreen={screen} signedIn={signedIn} onClose={close} />
    </Context.Provider>
  );
}

export function useGuide() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useGuide harus dipakai di dalam <GuideProvider>");
  return ctx;
}
