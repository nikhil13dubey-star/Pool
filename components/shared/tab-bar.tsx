"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Home",
    icon: (on: boolean) =>
      on ? (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3 4 9v11a1 1 0 0 0 1 1h4v-7h6v7h4a1 1 0 0 0 1-1V9z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      ),
  },
  {
    href: "/activity",
    label: "Activity",
    icon: () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    href: "/settle",
    label: "Settle",
    icon: () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 7h11l-3-3M17 17H6l3 3" />
      </svg>
    ),
  },
  {
    href: "/play",
    label: "Play",
    icon: () => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.5 5.5h-11A4.5 4.5 0 0 0 2 10v3.5A3.5 3.5 0 0 0 8.4 15.4l.3-.4h6.6l.3.4A3.5 3.5 0 0 0 22 13.5V10a4.5 4.5 0 0 0-4.5-4.5z" />
        <path d="M6.5 11h3M8 9.5v3" />
        <circle cx="15.5" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="18" cy="13" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="tabbar">
      {tabs.map((t) => {
        const on = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={`tab${on ? " on" : ""}`}>
            {t.icon(on)}
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
