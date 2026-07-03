import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-10">
          <Image src="/logo-icon.png" alt="PolloLabs" width={26} height={26} />
          <span className="text-lg font-bold tracking-tight gradient-text">PolloLabs</span>
        </Link>

        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <p className="text-white/35 text-sm mb-12">Last updated: {updated}</p>

        <div className="legal-prose">{children}</div>

        <div className="mt-16 pt-8 border-t border-white/10 flex gap-6 text-sm">
          <Link href="/terms" className="text-white/40 hover:text-white transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="text-white/40 hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="/acceptable-use" className="text-white/40 hover:text-white transition-colors">
            Acceptable Use
          </Link>
          <Link href="/" className="text-white/40 hover:text-white transition-colors">
            ← Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
