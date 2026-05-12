"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const tabs = [
  {
    href: "/today",
    label: "Today",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15.5 14" />
      </svg>
    ),
  },
  {
    href: "/plan",
    label: "Plan",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2.5" />
        <line x1="15.5" y1="2.5" x2="15.5" y2="5.5" />
        <line x1="8.5" y1="2.5" x2="8.5" y2="5.5" />
        <line x1="4" y1="9" x2="20" y2="9" />
        <line x1="8.5" y1="13" x2="8.5" y2="13" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="12" y1="13" x2="12" y2="13" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="8.5" y1="16.5" x2="8.5" y2="16.5" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="12" y1="16.5" x2="12" y2="16.5" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/metrics",
    label: "Metrics",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 19 9 5 6 12 2 12" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7.5" r="3.5" />
        <path d="M4 19.5c0-3.5 3.6-6 8-6s8 2.5 8 6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [bouncing, setBouncing] = useState<string | null>(null);

  const handleClick = (href: string) => {
    if (href === pathname) return;
    setBouncing(href);
    setTimeout(() => setBouncing(null), 350);
  };

  return (
    <nav
      style={{
        background: "var(--card)",
        borderTop: "1px solid var(--border)",
      }}
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 pb-safe"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        const isBouncing = bouncing === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            onClick={() => handleClick(tab.href)}
            className="nav-link flex flex-col items-center gap-1 py-3 px-5"
            style={{ color: active ? "var(--green)" : "var(--muted)" }}
          >
            <span className={isBouncing ? "nav-bounce" : ""} style={{ display: "flex" }}>
              {tab.icon(active)}
            </span>
            <span className="text-[11px] font-medium tracking-wide">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
