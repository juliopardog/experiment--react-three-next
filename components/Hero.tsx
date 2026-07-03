"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const HeroScene = dynamic(() => import("./three/HeroScene"), { ssr: false });

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Full-screen 3D canvas — fills the entire section */}
      <div className="absolute inset-0">
        <HeroScene />
      </div>

      {/* Dark vignette so left-side text is readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,5,8,0.85) 0%, rgba(5,5,8,0.55) 45%, rgba(5,5,8,0.1) 100%)",
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #050508)" }}
      />

      {/* Text — overlaid on top of the 3D */}
      <div className="relative z-10 w-full px-8 sm:px-14 lg:px-20 xl:px-28 py-28">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.02] tracking-tight mb-6 max-w-2xl"
        >
          Stop writing{" "}
          <span className="gradient-text">cold emails.</span>{" "}
          Start booking meetings.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg sm:text-xl text-white/60 leading-relaxed mb-10 max-w-xl"
        >
          PolloLabs finds local businesses, writes each one a personal email in
          your voice, sends from your domain, and follows up automatically —
          until they reply.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-[#00D4FF] text-[#050508] font-bold text-base px-8 py-4 rounded-full hover:bg-[#00D4FF]/90 transition-all duration-200 glow-cyan"
          >
            Start free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 border border-white/20 text-white/80 font-medium text-base px-8 py-4 rounded-full hover:bg-white/5 hover:border-white/30 transition-all duration-200 backdrop-blur-sm"
          >
            See how it works
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-xs text-white/35 mt-4 flex items-center gap-3"
        >
          <span>Free plan</span>
          <span className="w-px h-3 bg-white/20" />
          <span>No credit card required</span>
          <span className="w-px h-3 bg-white/20" />
          <span>Cancel anytime</span>
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-px h-14 bg-gradient-to-b from-transparent to-[#00D4FF]/50" />
        <span className="text-xs text-white/25 tracking-widest uppercase">Scroll</span>
      </motion.div>
    </section>
  );
}
