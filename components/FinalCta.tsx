"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function FinalCta() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 px-6 relative overflow-hidden" ref={ref}>
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,212,255,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 50% 50%, rgba(123,47,255,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Top border glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(0,212,255,0.3), transparent)" }}
      />

      <div className="max-w-3xl mx-auto text-center relative">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-[#00D4FF] text-sm font-semibold tracking-widest uppercase mb-4"
        >
          Get started today
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
        >
          Your first campaign is{" "}
          <span className="gradient-text">5 minutes away.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-white/55 text-lg leading-relaxed mb-10 max-w-xl mx-auto"
        >
          Import your leads, let NEXUS write the first batch of messages, and watch replies come in. No setup fees. No long onboarding. Just outbound that works.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 bg-[#00D4FF] text-[#050508] font-bold text-base px-10 py-4 rounded-full hover:bg-[#00D4FF]/90 transition-all duration-200 glow-cyan"
          >
            Start my free trial
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="#features"
            className="text-sm text-white/50 hover:text-white/80 transition-colors underline underline-offset-4"
          >
            See all features
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="text-xs text-white/30 mt-5 flex items-center justify-center gap-3"
        >
          <span>No credit card required</span>
          <span className="w-px h-3 bg-white/15" />
          <span>14-day free trial</span>
          <span className="w-px h-3 bg-white/15" />
          <span>Cancel anytime</span>
        </motion.p>
      </div>
    </section>
  );
}
