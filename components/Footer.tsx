"use client";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="text-xl font-bold gradient-text mb-2">NEXUS</p>
            <p className="text-white/35 text-sm max-w-xs">
              AI-powered outreach automation for modern sales teams.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-sm text-white/40">
            {["Privacy", "Terms", "Security", "Blog", "Docs"].map((link) => (
              <a key={link} href="#" className="hover:text-white transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} NEXUS Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            {["Twitter", "LinkedIn", "GitHub"].map((s) => (
              <a key={s} href="#" className="text-xs text-white/25 hover:text-white/60 transition-colors">
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
