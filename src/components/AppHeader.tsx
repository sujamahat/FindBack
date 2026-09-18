import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import { signOutAction } from "@/app/auth/actions";

export function AppHeader({ email }: { email?: string | null }) {
  return (
    <header className="no-print border-b border-sky bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-navy">
          <Mascot size={28} />
          FindBack
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/store" className="text-sm font-semibold text-navy-soft">
            QR 태그 구매
          </Link>
          {email && <span className="hidden text-xs text-navy-soft sm:inline">{email}</span>}
          <form action={signOutAction}>
            <button type="submit" className="text-sm font-semibold text-navy-soft underline">
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
