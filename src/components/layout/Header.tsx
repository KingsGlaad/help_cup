"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Resumo" },
    { href: "/games", label: "Jogos" },
    { href: "/groups", label: "Grupos" },
    { href: "/teams", label: "Seleções" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 text-primary"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 12l3-3m-3 3l-3-3m3 3v4.5m-4.5-1.5l2-2.5m5 2.5l-2-2.5m-3-6h6" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-foreground hidden sm:inline-block">
            Copa <span className="text-primary">2026</span>
          </span>
        </Link>
        
        <nav className="flex items-center gap-1 sm:gap-4 md:gap-6 mx-auto absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors px-3 py-2 rounded-md ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
