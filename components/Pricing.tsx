"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const plans = [
  {
    name: "Starter",
    monthly: 49,
    annual: 39,
    description: "For solo founders and individual reps.",
    contacts: "500 contacts/mo",
    highlight: false,
    color: "#00D4FF",
    features: [
      "500 enriched contacts/month",
      "AI personalization (email only)",
      "Basic analytics dashboard",
      "Gmail & Outlook integration",
      "Email support",
    ],
  },
  {
    name: "Growth",
    monthly: 149,
    annual: 119,
    description: "For teams scaling their outbound.",
    contacts: "5,000 contacts/mo",
    highlight: true,
    color: "#FF006E",
    features: [
      "5,000 enriched contacts/month",
      "AI personalization (email + LinkedIn)",
      "Multi-step sequences",
      "A/B testing for subject lines",
      "CRM sync (HubSpot, Salesforce)",
      "Real-time analytics & heatmaps",
      "Priority support",
    ],
  },
  {
    name: "Scale",
    monthly: 399,
    annual: 319,
    description: "For high-volume teams that need everything.",
    contacts: "Unlimited contacts",
    highlight: false,
    color: "#7B2FFF",
    features: [
      "Unlimited enriched contacts",
      "All channels + SMS",
      "Custom AI fine-tuning",
      "Dedicated account manager",
      "SOC 2 compliance",
      "Custom integrations",
      "SLA & 24/7 support",
    ],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" className="py-24 px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(255,0,110,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-6xl mx-auto" ref={ref}>
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-[#7B2FFF] text-sm font-semibold tracking-widest uppercase mb-3"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold mb-6"
          >
            Pick a plan.{" "}
            <span className="gradient-text">Start booking.</span>
          </motion.h2>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full p-1"
          >
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !annual ? "bg-white text-[#050508]" : "text-white/50 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                annual ? "bg-white text-[#050508]" : "text-white/50 hover:text-white"
              }`}
            >
              Annual
              <span className="text-xs bg-[#00D4FF] text-[#050508] font-bold px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.highlight ? "scale-[1.04]" : "mt-4"
              }`}
              style={{
                background: plan.highlight
                  ? `linear-gradient(160deg, ${plan.color}18 0%, rgba(5,5,8,0.8) 60%)`
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${plan.color}${plan.highlight ? "55" : "22"}`,
                boxShadow: plan.highlight
                  ? `0 0 50px ${plan.color}20, 0 0 100px ${plan.color}08`
                  : "none",
              }}
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: `linear-gradient(90deg, ${plan.color}, #7B2FFF)` }}
                >
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-semibold mb-1" style={{ color: plan.color }}>
                  {plan.contacts}
                </p>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-white/60 text-sm">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold">
                    ${annual ? plan.annual : plan.monthly}
                  </span>
                  <span className="text-white/40 text-sm mb-2">/month</span>
                </div>
                {annual && (
                  <p className="text-xs text-white/35 mt-1">
                    Billed annually (${(annual ? plan.annual : plan.monthly) * 12}/yr)
                  </p>
                )}
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-white/65">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="shrink-0 mt-0.5"
                      style={{ color: plan.color }}
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`w-full text-center font-bold py-3.5 rounded-xl text-sm transition-all duration-200 ${
                  plan.highlight
                    ? "text-white hover:opacity-90"
                    : "border hover:bg-white/5"
                }`}
                style={
                  plan.highlight
                    ? {
                        background: `linear-gradient(90deg, ${plan.color}, #7B2FFF)`,
                        boxShadow: `0 0 20px ${plan.color}40`,
                      }
                    : {
                        borderColor: plan.color + "44",
                        color: plan.color,
                      }
                }
              >
                {plan.name === "Scale" ? "Contact Sales" : "Start free trial"}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-white/30 text-sm mt-8"
        >
          No credit card required. Cancel anytime. All plans include a 14-day free trial.
        </motion.p>
      </div>
    </section>
  );
}
