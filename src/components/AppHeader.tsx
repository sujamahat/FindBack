import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOutAction } from "@/app/auth/actions";

export function AppHeader({ email }: { email?: string | null }) {
  return (
    <header className="no-print border-b border-line bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-black tracking-tight text-ink">
          <span className="h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-brand/30" aria-hidden />
          FindBack
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/store" className="text-sm font-semibold text-ink-soft transition hover:text-brand-deep">
            QR 태그 구매
          </Link>
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
