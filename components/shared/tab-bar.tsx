"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/client/utils";
import {
  HomeIcon,
  UsersIcon,
  CheckCircleIcon,
  UserIcon,
} from "@/components/shared/icons";

const tabs = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/friends", label: "Friends", icon: UsersIcon },
  { href: "/settle", label: "Settle", icon: CheckCircleIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-[18px] left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex gap-1 p-1.5 rounded-[32px]"
        style={{
          background: "rgba(20, 20, 25, 0.6)",
          backdropFilter: "blur(50px) saturate(220%)",
          WebkitBackdropFilter: "blur(50px) saturate(220%)",
          border: "0.5px solid rgba(255,255,255,0.1)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "w-[52px] h-11 rounded-[24px] flex items-center justify-center pool-press",
                "transition-colors duration-200",
                isActive
                  ? "text-white bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                  : "text-white/55 hover:text-white/80",
              )}
            >
              <Icon size={20} filled={isActive} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
