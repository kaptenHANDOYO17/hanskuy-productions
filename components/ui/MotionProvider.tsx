"use client";

import { MotionConfig } from "framer-motion";

/** Menghormati pengaturan "kurangi animasi" di perangkat pengunjung. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
