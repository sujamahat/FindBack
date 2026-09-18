"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/dashboard",
    label: "홈",
    match: (p: string) => p === "/dashboard",
    icon: <path d="M3 10.5 12 3l9 7.5M5 9.8V21h14V9.8" />,
  },
  {
    href: "/items/new",
    label: "등록",
    match: (p: string) => p === "/items/new",
    icon: <path d="M12 5v14M5 12h14" />,
  },
  {
    href: "/store",
    label: "스토어",
    match: (p: string) => p === "/store",
    icon: <path d="M3 8h18l-1.5 12h-15zM8.5 8V6a3.5 3.5 0 0 1 7 0v2" />,
  },
];

const SHOW_ON = ["/dashboard", "/store", "/items"];

/** Phone-only bottom tab bar for the signed-in area. */
export function MobileNav() {
  const pathname = usePathname();
  if (!SHOW_ON.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return null;
  }

  return (
    <>
      {/* keeps page content clear of the fixed bar */}
      <div className="no-print h-20 shrink-0 md:hidden" aria-hidden />
      <nav
        aria-label="주요 메뉴"
        className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-3">
          {TABS.map((tab) => {
            const active = tab.match(pathname);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-bold transition ${
                    active ? "text-brand" : "text-ink-mute hover:text-brand-deep"
                  }`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {tab.icon}
                  </svg>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
