"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteItemAction } from "@/lib/actions/deleteItem";

export function DeleteItemButton({
  itemId,
  onDeleted,
  redirectTo,
  variant = "icon",
}: {
  itemId: string;
  /** Called after a successful delete — use to remove the item from local state. */
  onDeleted?: () => void;
  /** If set, navigates here after a successful delete (e.g. away from the now-gone detail page). */
  redirectTo?: string;
  variant?: "icon" | "icon-only" | "button";
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteItemAction(itemId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      onDeleted?.();
      if (redirectTo) router.push(redirectTo);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="물건 삭제"
        className={
          variant === "icon-only"
            ? "flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-sm shadow-sm transition hover:bg-rose-50"
            : variant === "icon"
            ? "whitespace-nowrap rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50"
            : "rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
        }
      >
        {variant === "icon-only" ? "🗑" : variant === "icon" ? "🗑 삭제" : "🗑 삭제하기"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6 backdrop-blur-sm"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[26px] border border-line bg-surface p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-3xl">🗑️</p>
            <p className="mt-3 font-black tracking-tight text-ink">정말 이 물건을 삭제하시겠습니까?</p>
            <p className="mt-2 text-sm text-ink-soft">
              등록된 QR 태그와 제보 내역이 모두 삭제됩니다.
            </p>
            {error && <p className="mt-2 text-xs font-semibold text-rose-700">{error}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-line px-4 py-3 text-sm font-bold text-ink-soft disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {isPending ? "삭제 중..." : "삭제하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
