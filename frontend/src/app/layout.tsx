import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Agentic Travel Intelligence Platform",
  description: "Real-time travel pricing and AI-powered destination intelligence dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="text-sm font-semibold tracking-[0.14em] text-white">
              Travel Intelligence
            </div>

            <div className="flex gap-6 text-sm text-slate-300">
              <a href="/" className="transition hover:text-white">
                Dashboard
              </a>

              <a href="/monitor" className="transition hover:text-white">
                Monitor
              </a>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
