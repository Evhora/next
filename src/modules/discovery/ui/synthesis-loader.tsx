"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import type { Answer } from "../proto/v1/session_pb";

interface SynthesisLoaderProps {
  answers: Answer[];
}

export function SynthesisLoader({ answers }: SynthesisLoaderProps) {
  const t = useTranslations();
  const basePhrases = t.raw("pages.discovery.synthesisLoader.phrases") as string[];
  const phrases = [
    ...basePhrases,
    ...answers
      .filter((a) => !a.skipped && a.text.length > 20)
      .slice(0, 3)
      .map((a) => `"${a.text.slice(0, 60)}..."`)
  ];

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 min-h-[300px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
      />

      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-white/70 text-center text-lg max-w-sm italic"
        >
          {phrases[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
