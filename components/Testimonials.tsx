"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const testimonials = [
  {
    quote:
      "PolloLabs replaced our entire SDR team's manual prospecting work. We went from 20 meetings a month to 80 — with a smaller team. The AI-written opening lines get replies I could never write myself.",
    name: "Marcus Delgado",
    role: "Head of Sales",
    company: "Forza Analytics",
    avatar: "MD",
    color: "#00D4FF",
    metric: "4× meetings booked",
  },
  {
    quote:
      "I was skeptical about AI-written messages feeling generic. But PolloLabs actually reads the prospect's LinkedIn posts and references them. Our reply rate jumped from 4% to 19% in the first two weeks.",
    name: "Sarah Kim",
    role: "Founder & CEO",
    company: "Pullr",
    avatar: "SK",
    color: "#FF006E",
    metric: "19% reply rate",
  },
  {
    quote:
      "We're a 5-person startup and PolloLabs lets us punch above our weight. The multi-channel sequences feel like we have a full outbound team, but it's just one tool running on autopilot.",
    name: "James Okafor",
    role: "Co-founder",
    company: "StackFlow",
    avatar: "JO",
    color: "#7B2FFF",
    metric: "$2.1M pipeline added",
  },
];

const logos = [
  "Forza Analytics",
  "Pullr",
  "StackFlow",
  "Meridian",
  "CloudNest",
  "VaultPay",
];

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="testimonials" className="py-24 px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 50%, rgba(0,212,255,0.04) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(123,47,255,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Logo strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-white/25 text-xs font-semibold tracking-widest uppercase mb-8">
            Built for teams like these
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {logos.map((logo) => (
              <span key={logo} className="text-white/25 font-bold text-sm tracking-wide">
                {logo}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[#00D4FF] text-sm font-semibold tracking-widest uppercase mb-3"
          >
            Customer Stories
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl sm:text-5xl font-bold"
          >
            What teams are{" "}
            <span className="gradient-text">saying about PolloLabs</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="card-glass rounded-2xl p-6 flex flex-col"
              style={{ borderColor: t.color + "22" }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill={t.color}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              <blockquote className="text-white/65 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5 self-start"
                style={{ background: t.color + "18", color: t.color, border: `1px solid ${t.color}33` }}
              >
                {t.metric}
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{
                    background: t.color + "22",
                    border: `1.5px solid ${t.color}44`,
                    color: t.color,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-white/40">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
