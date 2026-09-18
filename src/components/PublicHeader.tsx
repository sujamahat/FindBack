import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Header for pages that don't have a signed-in user (landing, login, recover, finder). */
export function PublicHeader() {
  return (
    <header className="no-print border-b border-line bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5 font-black tracking-tight text-ink">
          <span className="h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-brand/30" aria-hidden />
          FindBack
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
