"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const FeatureScene = dynamic(() => import("./three/FeatureScene"), { ssr: false });

const features = [
  {
    number: "01",
    title: "Every email written from scratch",
    description:
      "PolloLabs reads each prospect's LinkedIn activity, funding history, tech stack, and recent news. It writes a message that references something real — so it reads like you spent 20 minutes on each one. You didn't.",
    bullets: ["Deep research on every contact", "Writes in your voice, not a template voice", "Subject lines crafted per prospect"],
    type: "cube" as const,
    color: "#00D4FF",
    emissive: "#003366",
  },
  {
    number: "02",
    title: "Email and LinkedIn in one sequence",
    description:
      "Build a sequence that touches prospects on email and LinkedIn. When someone replies, PolloLabs pulls them out of the queue and flags them for you. No more following up with leads who are already interested.",
    bullets: ["Email + LinkedIn in one workflow", "Auto-pauses when they reply", "A/B test every message"],
    type: "sphere" as const,
    color: "#FF006E",
    emissive: "#660028",
  },
  {
    number: "03",
    title: "Live data on every message",
    description:
      "Your dashboard updates as emails open, replies come in, and meetings book. See which subject lines win, which opening lines get replies, and where prospects drop off. Cut what fails. Run more of what works.",
    bullets: ["Live open & reply tracking", "Message-level performance data", "Pipeline attribution reports"],
    type: "diamond" as const,
    color: "#7B2FFF",
    emissive: "#330066",
  },
];

function FeatureRow({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className="relative">
      {/* Divider line */}
      {index > 0 && (
        <div className="w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
      )}

      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[520px] ${
          isEven ? "" : "lg:[&>*:first-child]:order-2"
        }`}
      >
        {/* 3D Panel */}
        <motion.div
          initial={{ opacity: 0, x: isEven ? -60 : 60 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="relative min-h-[380px] lg:min-h-[520px]"
          style={{
            background: `radial-gradient(ellipse at center, ${feature.color}12 0%, transparent 70%)`,
          }}
        >
          <FeatureScene type={feature.type} color={feature.color} emissive={feature.emissive} />

          {/* Number watermark */}
          <div
            className="absolute top-6 left-8 text-[120px] font-bold leading-none select-none pointer-events-none"
            style={{ color: feature.color + "08" }}
          >
            {feature.number}
          </div>
        </motion.div>

        {/* Text Panel */}
        <motion.div
          initial={{ opacity: 0, x: isEven ? 60 : -60 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
          className="flex flex-col justify-center px-10 py-16 lg:px-16"
        >
          <div
            className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-5"
            style={{ color: feature.color }}
          >
            <span className="w-6 h-px" style={{ background: feature.color }} />
            Feature {feature.number}
          </div>

          <h3 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
            {feature.title}
          </h3>

          <p className="text-white/65 text-base leading-relaxed mb-8">
            {feature.description}
          </p>

          <ul className="space-y-3">
            {feature.bullets.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-white/70">
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  style={{ color: feature.color, flexShrink: 0 }}
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

export default function Features() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  return (
    <section id="features" className="py-20 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(123,47,255,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6" ref={headerRef}>
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#00D4FF] text-sm font-semibold tracking-widest uppercase mb-3"
          >
            Why PolloLabs
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold"
          >
            Three tools that{" "}
            <span className="gradient-text">fill your calendar</span>
          </motion.h2>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5">
        {features.map((feature, i) => (
          <FeatureRow key={feature.number} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}
