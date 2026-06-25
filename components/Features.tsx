"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const FeatureScene = dynamic(() => import("./three/FeatureScene"), { ssr: false });

const features = [
  {
    title: "AI Personalization Engine",
    description:
      "NEXUS researches each prospect and crafts messages that feel hand-written. Reference their LinkedIn activity, funding rounds, tech stack — automatically.",
    type: "cube" as const,
    color: "#00D4FF",
    emissive: "#004488",
    badge: "GPT-4 Powered",
    stats: "3× higher reply rates",
  },
  {
    title: "Multi-Channel Campaigns",
    description:
      "Orchestrate email, LinkedIn, and follow-ups in a single workflow. Smart sequencing adapts based on how each prospect responds — or doesn't.",
    type: "sphere" as const,
    color: "#FF006E",
    emissive: "#660028",
    badge: "Email + LinkedIn",
    stats: "5 channels, 1 dashboard",
  },
  {
    title: "Real-Time Analytics",
    description:
      "See open rates, reply rates, and booked meetings in real time. NEXUS surfaces which messages and subject lines are winning so you can scale them.",
    type: "octahedron" as const,
    color: "#7B2FFF",
    emissive: "#330066",
    badge: "Live Insights",
    stats: "Track every touchpoint",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="card-glass rounded-2xl overflow-hidden group hover:border-white/15 transition-all duration-300"
      style={{
        borderColor: feature.color + "22",
        boxShadow: `0 0 40px ${feature.color}08`,
      }}
    >
      {/* 3D Scene */}
      <div className="relative w-full h-44 bg-gradient-to-br from-black/40 to-black/10">
        <FeatureScene type={feature.type} color={feature.color} emissive={feature.emissive} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center bottom, ${feature.color}15 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-4"
          style={{
            background: feature.color + "18",
            color: feature.color,
            border: `1px solid ${feature.color}33`,
          }}
        >
          {feature.badge}
        </div>
        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
        <p className="text-white/50 text-sm leading-relaxed mb-4">{feature.description}</p>
        <div
          className="text-sm font-semibold"
          style={{ color: feature.color }}
        >
          {feature.stats}
        </div>
      </div>
    </motion.div>
  );
}

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="features" className="py-24 px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(123,47,255,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        <div ref={ref} className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#00D4FF] text-sm font-semibold tracking-widest uppercase mb-3"
          >
            Why NEXUS
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold mb-5"
          >
            Everything you need to{" "}
            <span className="gradient-text">book more meetings</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/50 text-lg max-w-xl mx-auto"
          >
            One platform replaces your SDR stack, email tools, and analytics — with AI doing the heavy lifting.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
