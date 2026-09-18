import Link from "next/link";
import { MobilePreviewToggle } from "@/components/MobilePreview";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOutAction } from "@/app/auth/actions";

const NAV_LINKS = [
  { href: "/dashboard", label: "홈" },
  { href: "/store", label: "스토어" },
  { href: "/chat", label: "채팅" },
  { href: "/mypage", label: "마이페이지" },
];

export function AppHeader({ email }: { email?: string | null }) {
  return (
    <header className="no-print border-b border-line bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-black tracking-tight text-ink">
            <span className="h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-brand/30" aria-hidden />
            FindBack
          </Link>
          <nav aria-label="주요 메뉴" className="hidden items-center gap-4 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-ink-soft transition hover:text-brand-deep"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <MobilePreviewToggle />
          <ThemeToggle />
          {email && <span className="hidden text-xs text-ink-mute sm:inline">{email}</span>}
          <form action={signOutAction}>
            <button type="submit" className="text-sm font-semibold text-brand-deep underline">
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
