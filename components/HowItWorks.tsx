"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Find your leads",
    description:
      "Type a niche and a city — “dentists in Austin, TX”. PolloLabs searches the web, crawls business sites, and hands you verified emails in about a minute. Or upload your own CSV.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    color: "#00D4FF",
  },
  {
    number: "02",
    title: "Approve every email",
    description:
      "PolloLabs writes one unique email per lead — subject line and all, in your voice. You read it, tweak it if you want, and hit approve. Nothing sends without your say-so.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: "#FF006E",
  },
  {
    number: "03",
    title: "Follow-ups run themselves",
    description:
      "Emails send from your own domain. Automatic follow-ups bump the silent ones and stop the instant someone replies. You watch opens and replies land on the dashboard.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "#7B2FFF",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,212,255,0.04) 0%, transparent 70%), radial-gradient(ellipse 40% 80% at 0% 100%, rgba(255,0,110,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative" ref={sectionRef}>
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#FF006E] text-sm font-semibold tracking-widest uppercase mb-3"
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold"
          >
            From first import{" "}
            <span className="gradient-text-alt">to first reply in minutes</span>
          </motion.h2>
        </div>

        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-16 left-1/6 right-1/6 h-px">
            <div
              className="h-full"
              style={{
                background:
                  "linear-gradient(90deg, #00D4FF 0%, #FF006E 50%, #7B2FFF 100%)",
                opacity: 0.3,
              }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
            {steps.map((step, i) => {
              const stepRef = useRef(null);
              const stepInView = useInView(stepRef, { once: true, margin: "-60px" });

              return (
                <motion.div
                  key={step.number}
                  ref={stepRef}
                  initial={{ opacity: 0, y: 40 }}
                  animate={stepInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  className="flex flex-col items-start lg:items-center text-left lg:text-center"
                >
                  <div className="relative mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10"
                      style={{
                        background: step.color + "15",
                        border: `1.5px solid ${step.color}40`,
                        color: step.color,
                        boxShadow: `0 0 30px ${step.color}20`,
                      }}
                    >
                      {step.icon}
                    </div>
                    <span
                      className="absolute -top-3 -right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: step.color + "20",
                        color: step.color,
                        border: `1px solid ${step.color}40`,
                      }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-20 text-center"
        >
          <a
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#00D4FF] text-[#050508] font-bold text-base px-10 py-4 rounded-full hover:bg-[#00D4FF]/90 transition-all duration-200 glow-cyan"
          >
            Start free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
