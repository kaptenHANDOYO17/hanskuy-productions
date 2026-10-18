"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  /** Jeda animasi masuk (detik), untuk efek muncul bergiliran. */
  delay?: number;
};

/**
 * Kartu dengan "lampu sorot" emas yang mengikuti kursor,
 * sedikit terangkat saat di-hover, dan muncul halus saat di-scroll.
 */
export default function Card({ children, className = "", delay = 0 }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-50/60 p-8 backdrop-blur transition-colors duration-500 hover:border-gold/40 ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--x, 50%) var(--y, 50%), rgba(212,175,55,0.12), transparent 45%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
