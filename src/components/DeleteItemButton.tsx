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
  variant?: "icon" | "button";
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
          variant === "icon"
            ? "rounded-xl border border-coral px-3 py-2 text-xs font-bold text-coral"
            : "rounded-xl border-2 border-coral px-4 py-2 text-sm font-bold text-coral"
        }
      >
        {variant === "icon" ? "🗑 삭제" : "🗑 삭제하기"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 px-6"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-3xl">🗑️</p>
            <p className="mt-3 font-bold text-navy">정말 이 물건을 삭제하시겠습니까?</p>
            <p className="mt-2 text-sm text-navy-soft">
              등록된 QR 태그와 제보 내역이 모두 삭제됩니다.
            </p>
            {error && <p className="mt-2 text-xs font-semibold text-coral">{error}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-sky px-4 py-3 text-sm font-bold text-navy disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 rounded-xl bg-coral px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
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
