"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const MotionLink = motion.create(Link);

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
};

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary:
    "bg-gold text-ink shadow-[0_0_40px_-10px_rgba(212,175,55,0.6)] hover:bg-gold-light",
  ghost:
    "border border-white/15 bg-white/[0.02] text-zinc-200 backdrop-blur hover:border-gold/60 hover:text-white",
};

export default function Button({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  disabled,
  className = "",
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;

  const content = (
    <>
      {/* Kilau emas yang menyapu tombol saat di-hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-shine"
      />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );

  const motionProps = {
    whileHover: disabled ? undefined : { scale: 1.04 },
    whileTap: disabled ? undefined : { scale: 0.97 },
    transition: { type: "spring" as const, stiffness: 400, damping: 22 },
  };

  if (href) {
    return (
      <MotionLink href={href} className={classes} {...motionProps}>
        {content}
      </MotionLink>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...motionProps}
    >
      {content}
    </motion.button>
  );
}
