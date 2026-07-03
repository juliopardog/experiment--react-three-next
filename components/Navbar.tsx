"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Features", "How It Works", "Pricing", "Testimonials"];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        scrolled ? "bg-[#050508]/90 backdrop-blur-md border-b border-white/5" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="PolloLabs" width={30} height={30} priority />
          <span className="text-xl font-bold tracking-tight gradient-text">PolloLabs</span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm text-white/60 hover:text-white transition-colors duration-200"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="#"
            className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2"
          >
            Log in
          </a>
          <a
            href="#pricing"
            className="text-sm font-semibold bg-[#00D4FF] text-[#050508] px-5 py-2.5 rounded-full hover:bg-[#00D4FF]/90 transition-all duration-200 glow-cyan"
          >
            Start Free Trial
          </a>
        </div>

        <button
          className="md:hidden text-white/70 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M3 12h18M3 6h18M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-4 py-4 border-t border-white/5 flex flex-col gap-4"
        >
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-white/70 hover:text-white px-2"
              onClick={() => setMobileOpen(false)}
            >
              {link}
            </a>
          ))}
          <a
            href="#pricing"
            className="text-sm font-semibold bg-[#00D4FF] text-[#050508] px-5 py-2.5 rounded-full text-center mt-2"
            onClick={() => setMobileOpen(false)}
          >
            Start Free Trial
          </a>
        </motion.div>
      )}
    </motion.nav>
  );
}
