"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  type Variants,
} from "framer-motion";
import { ArrowRight, ChevronDown, Compass, Eye } from "lucide-react";
import { useGuide } from "@/components/guide/GuideProvider";
import Button from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const EASE = [0.22, 1, 0.36, 1] as const;

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

/** Satu baris teks yang muncul kata demi kata, seperti diucapkan perlahan. */
function SpokenLine({
  text,
  delay,
  stagger,
  className = "",
  wordClassName = "",
}: {
  text: string;
  delay: number;
  stagger: number;
  className?: string;
  wordClassName?: string;
}) {
  return (
    <motion.span
      className={`block ${className}`}
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {text.split(" ").map((word, i) => (
        <motion.span key={i} variants={wordVariants} className={`mr-[0.25em] inline-block pr-[0.05em] ${wordClassName}`}>
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

/** Kata "masalah" yang dicoret garis emas — masalah lama, dihapus. */
function Struck({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <motion.span initial={{ opacity: 1 }} animate={{ opacity: 0.45 }} transition={{ delay: delay + 0.2, duration: 0.6 }}>
        {children}
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute left-0 top-1/2 h-[1.5px] w-full origin-left bg-gold"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay, duration: 0.5, ease: EASE }}
      />
    </span>
  );
}

export default function Hero() {
  const { t, lang } = useI18n();
  const { openGuide } = useGuide();
  const h = t.hero;

  // Intro dramatis penuh hanya di kunjungan pertama; saat ganti bahasa, teks muncul lebih cepat.
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setIntroDone(true), 5000);
    return () => clearTimeout(id);
  }, []);
  const k = introDone ? 0.25 : 1;

  // Lampu sorot yang mengikuti kursor
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(35);
  const x = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const y = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const spotlight = useMotionTemplate`radial-gradient(650px circle at ${x}% ${y}%, rgba(212,175,55,0.11), transparent 60%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  // "Baca Pikiran Saya"
  const [thoughtIndex, setThoughtIndex] = useState<number | null>(null);
  const [reading, setReading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const readMind = () => {
    if (reading) return;
    setReading(true);
    timer.current = setTimeout(() => {
      setThoughtIndex((prev) => (prev === null ? 0 : (prev + 1) % h.thoughts.length));
      setReading(false);
    }, 1100);
  };

  const strikeAt = (i: number) => (3.2 + i * 0.25) * k;

  return (
    <section onMouseMove={handleMouseMove} className="relative flex min-h-screen items-center overflow-hidden px-6 pb-24 pt-32">
      {/* Latar: grid tipis + lampu sorot + cahaya emas samar */}
      <div aria-hidden className="bg-grid absolute inset-0" />
      <motion.div aria-hidden className="absolute inset-0" style={{ background: spotlight }} />
      <div aria-hidden className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gold/5 blur-[120px]" />

      <div className="relative mx-auto w-full max-w-5xl">
        {/* Lencana pembuka */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-xs sm:tracking-[0.25em]"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
          </span>
          {h.badge}
        </motion.div>

        {/* Headline */}
        <h1 key={`h1-${lang}`} className="font-serif text-4xl font-medium leading-[1.1] text-white sm:text-6xl lg:text-7xl">
          <SpokenLine text={h.line1} delay={0.5 * k} stagger={0.07 * k} />
          <SpokenLine
            text={h.line2}
            delay={1.5 * k}
            stagger={0.07 * k}
            className="mt-2 italic"
            wordClassName="text-gradient-gold pb-[0.12em]"
          />
        </h1>

        {/* Sub-headline */}
        <motion.p
          key={`sub-${lang}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.6 * k, ease: EASE }}
          className="mt-10 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl"
        >
          <span className="text-zinc-100">{h.intro}</span> <Struck delay={strikeAt(0)}>{h.pains[0]}</Struck>,{" "}
          <Struck delay={strikeAt(1)}>{h.pains[1]}</Struck>, <Struck delay={strikeAt(2)}>{h.pains[2]}</Struck>, {h.and}{" "}
          <Struck delay={strikeAt(3)}>{h.pains[3]}</Struck>. {h.afterPains}{" "}
          <span className="text-zinc-100">
            {h.closing} <em className="font-serif text-xl text-gold sm:text-2xl">{h.noDrama}</em>
          </span>
        </motion.p>

        {/* Tombol CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 4.2, ease: EASE }}
          className="mt-12 flex flex-col gap-4 sm:flex-row"
        >
          <Button onClick={() => openGuide("choose")}>
            {h.ctaPrimary}
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
          <Button variant="ghost" onClick={readMind} disabled={reading}>
            <Eye size={16} className={reading ? "animate-pulse text-gold" : ""} />
            {thoughtIndex === null ? h.ctaRead : h.ctaReadAgain}
          </Button>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.6 }}
          onClick={() => openGuide("intro")}
          className="mt-5 inline-flex items-center gap-2 text-sm text-zinc-400 underline-offset-4 transition-colors hover:text-gold hover:underline"
        >
          <Compass size={15} className="text-gold" /> {t.guide.firstTime}
        </motion.button>

        {/* Hasil "pembacaan pikiran" */}
        <div className="mt-8 min-h-[96px] max-w-xl" aria-live="polite">
          <AnimatePresence mode="wait">
            {reading ? (
              <motion.p
                key="reading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-serif text-lg italic text-zinc-500"
              >
                {h.reading}
              </motion.p>
            ) : (
              thoughtIndex !== null && (
                <motion.blockquote
                  key={`${lang}-${thoughtIndex}`}
                  initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="border-l-2 border-gold/60 pl-5 font-serif text-xl italic leading-relaxed text-zinc-200"
                >
                  {h.thoughts[thoughtIndex]}
                </motion.blockquote>
              )
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Petunjuk scroll */}
      <motion.a
        href="#services"
        aria-label={h.scrollHint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 4.8 }, y: { delay: 4.8, duration: 2, repeat: Infinity } }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-500 hover:text-gold"
      >
        <ChevronDown size={28} />
      </motion.a>
    </section>
  );
}
