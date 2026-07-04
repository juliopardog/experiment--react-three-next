import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export function AuthShell({
  children,
  footer,
  wide = false,
}: {
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className={`w-full ${wide ? "max-w-md" : "max-w-sm"}`}>
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <Image src="/logo-icon.png" alt="PolloLabs" width={34} height={34} />
          <span className="text-2xl font-bold tracking-tight gradient-text">PolloLabs</span>
        </Link>
        {children}
        {footer && <p className="text-center text-sm text-white/40 mt-6">{footer}</p>}
      </div>
    </div>
  );
}
