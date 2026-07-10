import type { Metadata } from "next";
import { Roboto, Outfit } from "next/font/google";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import LogoImage from "../../public/logo.png";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-outfit",
});

// 시작 연도(2025)부터 빌드 시점 연도까지. 정적 export라 빌드 때 고정된다.
function copyrightYears(): string {
  const year = new Date().getFullYear();
  return year > 2025 ? `2025-${year}` : '2025';
}

export const metadata: Metadata = {
  title: "OSSCA Chromium",
  description: "2026 OSSCA 참여형 Chromium 프로젝트",
};

const NAV_LINKS = [
  { href: "/docs", label: "Guide" },
  { href: "/patches", label: "Contributions" },
  { href: "/contributors", label: "Contributors" },
  { href: "/stats", label: "Stats" },
  { href: "/schedule", label: "Schedule" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${roboto.className} ${outfit.variable} bg-background text-on-surface min-h-screen flex flex-col`}
      >
        <header className="bg-background/80 backdrop-blur-md border-b border-outline/60 py-3 sticky top-0 z-20">
          <div className="container mx-auto px-4 lg:px-6">
            <nav className="flex flex-col sm:flex-row justify-between items-center">
              <Link
                href="/"
                className="font-display text-xl font-semibold tracking-tight mb-3 sm:mb-0 flex items-center"
              >
                <Image src={LogoImage} alt="OSSCA Chromium 로고" width={32} height={32} className="mr-2" />
                OSSCA Chromium
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full px-4 py-2 font-medium text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-on-surface"
                  >
                    {link.label}
                  </Link>
                ))}
                <ThemeToggle />
                <a
                  href="https://github.com/OSSCA-chromium/contributions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 font-medium text-on-primary transition-opacity hover:opacity-90"
                  aria-label="GitHub 저장소"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              </div>
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 flex-grow">{children}</main>
        <footer className="border-t border-outline/60 mt-12">
          <div className="chromium-strip" aria-hidden="true" />
          <div className="container mx-auto px-4 pt-8 pb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-on-surface-variant">
              <div className="flex flex-wrap items-center justify-center gap-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <p>© {copyrightYears()} OSSCA Chromium. All rights reserved.</p>
                <a
                  href="https://github.com/OSSCA-chromium/contributions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-on-surface-variant hover:text-primary transition-colors"
                  aria-label="GitHub 저장소"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
