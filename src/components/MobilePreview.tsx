"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

const noopSubscribe = () => () => {};
const isEmbedded = () => window.self !== window.top;

/**
 * Desktop-only button that opens the current page in a phone-sized frame.
 * The frame is a same-origin iframe, so the app's real responsive breakpoints
 * and the mobile bottom nav apply exactly as they would on a phone.
 */
export function MobilePreviewToggle() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Inside the preview frame itself, don't offer another preview.
  const embedded = useSyncExternalStore(noopSubscribe, isEmbedded, () => true);
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  if (embedded) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="모바일 미리보기"
        title="모바일 미리보기"
        className="no-print hidden h-[38px] shrink-0 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-xs font-bold text-ink-soft shadow-sm transition hover:border-brand-line hover:text-brand-deep md:flex"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <rect x="7" y="2" width="10" height="20" rx="2.5" />
          <path d="M11 18h2" />
        </svg>
        모바일
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              className="relative flex max-h-full flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex w-full items-center justify-between text-xs font-bold text-white">
                <span>모바일 미리보기 · 390 × 844</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-white/15 px-3 py-1.5 transition hover:bg-white/25"
                >
                  닫기 ✕
                </button>
              </div>
              <iframe
                title="모바일 미리보기"
                src={pathname}
                className="h-[min(844px,calc(100vh-6rem))] w-[390px] max-w-full rounded-[40px] border-[6px] border-ink bg-background shadow-2xl"
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
