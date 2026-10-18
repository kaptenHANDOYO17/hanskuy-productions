"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { inputClass, labelClass } from "@/components/ui/styles";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { passwordScore } from "@/lib/validation";

const BAR_COLORS = ["bg-red-500", "bg-orange-400", "bg-gold", "bg-emerald-400"];

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  showStrength?: boolean;
  disabled?: boolean;
  rightLabel?: React.ReactNode;
};

/** Kolom sandi dengan tombol "lihat sandi" dan indikator kekuatan. */
export default function PasswordInput({ id, label, value, onChange, autoComplete, showStrength, disabled, rightLabel }: Props) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const score = passwordScore(value);

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className={labelClass}>{label}</label>
        {rightLabel}
      </div>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          maxLength={72}
          disabled={disabled}
          required
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t.auth.hidePassword : t.auth.showPassword}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-zinc-500 transition-colors hover:text-gold"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showStrength && (
        <div className="mt-2">
          <div className="flex gap-1.5" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  value && i < score ? BAR_COLORS[score - 1] : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <p className="mt-1.5 flex justify-between text-xs text-zinc-500">
            <span>{t.auth.passwordHint}</span>
            {value && <span className="text-zinc-300">{t.auth.strength[score - 1]}</span>}
          </p>
        </div>
      )}
    </div>
  );
}
