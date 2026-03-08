"use client";
import Link from "next/link";
import { useState } from "react";
import { SITE_NAME } from "@/lib/constants";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navLinks = [
  { href: "/quiz", label: "模擬問題" },
  { href: "/vocabulary", label: "単語帳" },
  { href: "/listening", label: "リスニング" },
  { href: "/diagnosis", label: "診断" },
  { href: "/progress", label: "学習記録" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-50 border-b border-border/40">
      <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="text-sm font-bold gradient-text tracking-tight">{SITE_NAME}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-2.5 py-1 rounded-md text-[12px] font-medium text-muted hover:text-foreground hover:bg-surface-dim transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            className="md:hidden p-1 rounded-md hover:bg-surface-dim transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-border/40 bg-surface/95 backdrop-blur-sm px-4 py-2 space-y-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-md text-[12px] font-medium text-muted hover:text-foreground hover:bg-surface-dim transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
