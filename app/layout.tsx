import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ),
  title: "PolloLabs — AI Outreach That Closes Deals",
  description: "Hyper-personalized outreach at scale. Let AI write, send, and optimize every message while you focus on closing.",
  openGraph: {
    title: "PolloLabs — AI Outreach That Closes Deals",
    description: "AI outreach that researches, writes, and sends — in your voice.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "PolloLabs" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PolloLabs — AI Outreach That Closes Deals",
    description: "AI outreach that researches, writes, and sends — in your voice.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
