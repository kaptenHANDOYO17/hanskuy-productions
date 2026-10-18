"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { TURNSTILE_SITE_KEY } from "@/lib/supabase/config";

/**
 * Cloudflare Turnstile — pemeriksa "Anda manusia, bukan bot" yang gratis
 * dan biasanya tanpa teka-teki gambar. Hanya aktif bila
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY diisi.
 */

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error("turnstile"));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

function TurnstileWidget({ onToken }: { onToken: (token: string | null) => void }) {
  const { lang } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  callback.current = onToken;

  useEffect(() => {
    let widgetId: string | null = null;
    let cancelled = false;

    loadTurnstile()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetId = window.turnstile.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "dark",
          language: lang,
          callback: (token: string) => callback.current(token),
          "expired-callback": () => callback.current(null),
          "error-callback": () => callback.current(null),
        });
      })
      .catch(() => callback.current(null));

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [lang]);

  return <div ref={ref} className="flex min-h-[65px] justify-center" />;
}

/**
 * Pemakaian:
 *   const captcha = useCaptcha();
 *   ... {captcha.widget}
 *   supabase.auth.signUp({ ..., options: { captchaToken: captcha.token } })
 *   captcha.reset()  // wajib setelah setiap percobaan (token hanya sekali pakai)
 */
export function useCaptcha() {
  const enabled = Boolean(TURNSTILE_SITE_KEY);
  const [token, setToken] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reset = useCallback(() => {
    setToken(null);
    setNonce((n) => n + 1);
  }, []);

  return {
    enabled,
    token: token ?? undefined,
    ready: !enabled || Boolean(token),
    widget: enabled ? <TurnstileWidget key={nonce} onToken={setToken} /> : null,
    reset,
  };
}
