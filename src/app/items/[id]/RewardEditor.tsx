"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setRewardAmount } from "./actions";

export function RewardEditor({
  itemId,
  initialAmount,
}: {
  itemId: string;
  initialAmount: number | null;
}) {
  const [amount, setAmount] = useState(initialAmount != null ? String(initialAmount) : "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await setRewardAmount(itemId, amount);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="rounded-[24px] border border-brand-line bg-brand-soft p-4">
      <p className="mb-2 text-sm font-bold text-brand-deep">보상금 설정 (선택, 데모용)</p>
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          max={10_000_000}
          step={1000}
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setSaved(false);
          }}
          placeholder="예: 20000"
          className="flex-1 rounded-xl border border-line bg-surface px-3 py-2 font-mono text-sm text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/20"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-deep disabled:opacity-60"
        >
          {isPending ? "저장 중..." : "저장"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-rose-700">{error}</p>}
      {saved && !error && (
        <p className="mt-2 text-xs font-semibold text-brand-deep">저장했어요. 습득자 페이지에 표시돼요.</p>
      )}
      <p className="mt-2 text-xs text-ink-soft">
        습득자 페이지에 보상금이 표시돼요. 실제 결제는 연동되지 않은 데모 기능이에요.
      </p>
    </div>
  );
}
