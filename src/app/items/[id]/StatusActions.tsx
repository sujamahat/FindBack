"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ItemStatus } from "@/lib/constants";
import { getAllowedNextStatuses } from "@/lib/statusTransitions";
import { markItemStatus } from "./actions";

const BUTTON_LABEL: Record<ItemStatus, string> = {
  safe: "안전함으로 되돌리기",
  lost: "분실로 표시",
  found: "발견 제보 도착",
  returned: "반환 완료로 표시",
};

const BUTTON_STYLE: Record<ItemStatus, string> = {
  safe: "border border-sky text-navy",
  lost: "border-2 border-coral text-coral",
  found: "border-2 border-coral text-coral",
  returned: "bg-navy text-cream",
};

export function StatusActions({ itemId, status }: { itemId: string; status: ItemStatus }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const nextOptions = getAllowedNextStatuses(status).filter((s) => s !== "found");

  function handleClick(next: ItemStatus) {
    startTransition(async () => {
      await markItemStatus(itemId, next as "lost" | "returned" | "safe");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {nextOptions.map((next) => (
        <button
          key={next}
          onClick={() => handleClick(next)}
          disabled={isPending}
          className={`rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-60 ${BUTTON_STYLE[next]}`}
        >
          {BUTTON_LABEL[next]}
        </button>
      ))}
    </div>
  );
}
