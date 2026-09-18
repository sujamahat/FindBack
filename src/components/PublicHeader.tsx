import Link from "next/link";
import { MobilePreviewToggle } from "@/components/MobilePreview";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Header for pages that don't have a signed-in user (landing, login, recover, finder). */
export function PublicHeader() {
  return (
    <header className="no-print border-b border-line bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-black tracking-tight text-ink">
          <span className="h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-brand/30" aria-hidden />
          FindBack
        </Link>
        <div className="flex items-center gap-2">
          <MobilePreviewToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
