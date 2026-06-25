"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const HeroScene = dynamic(() => import("./three/HeroScene"), { ssr: false });

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Radial gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 50%, rgba(0,212,255,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 30% 80%, rgba(255,0,110,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-24">
        {/* Left: Copy */}
        <div className="order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/5 text-xs text-[#00D4FF] font-medium mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] pulse-glow" />
            Now in public beta — join 2,000+ teams
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
          >
            Outreach that{" "}
            <span className="gradient-text">actually</span>{" "}
            closes deals.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-lg text-white/55 leading-relaxed mb-10 max-w-lg"
          >
            NEXUS writes hyper-personalized emails and LinkedIn messages for every prospect —
            at any scale. Set your campaign, let the AI run it, and watch replies land.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 bg-[#00D4FF] text-[#050508] font-bold text-base px-8 py-4 rounded-full hover:bg-[#00D4FF]/90 transition-all duration-200 glow-cyan"
            >
              Start for free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 border border-white/15 text-white/80 font-medium text-base px-8 py-4 rounded-full hover:bg-white/5 hover:border-white/25 transition-all duration-200"
            >
              See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-12 flex items-center gap-6"
          >
            <div className="flex -space-x-3">
              {["A", "B", "C", "D"].map((l, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#050508] flex items-center justify-center text-xs font-bold"
                  style={{
                    background: ["#00D4FF", "#FF006E", "#7B2FFF", "#00D4FF"][i] + "33",
                    borderColor: ["#00D4FF", "#FF006E", "#7B2FFF", "#00D4FF"][i],
                    color: ["#00D4FF", "#FF006E", "#7B2FFF", "#00D4FF"][i],
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/45">
              <span className="text-white/80 font-semibold">2,000+</span> sales teams trust NEXUS
            </p>
          </motion.div>
        </div>

        {/* Right: 3D Scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="order-1 lg:order-2 w-full h-[380px] sm:h-[460px] lg:h-[580px] relative"
        >
          <HeroScene />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-[#00D4FF]/40" />
        <span className="text-xs text-white/30 tracking-widest uppercase">Scroll</span>
      </motion.div>
    </section>
  );
}
