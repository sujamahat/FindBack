"use client";

import { useState } from "react";

type ClaimStatus = "idle" | "processing" | "done";

export function RewardBanner({ rewardAmount }: { rewardAmount: number }) {
  const [status, setStatus] = useState<ClaimStatus>("idle");
  const [visible, setVisible] = useState(false);
  const formatted = `₩${rewardAmount.toLocaleString("ko-KR")}`;

  function handleClaim() {
    setStatus("processing");
    setTimeout(() => {
      setStatus("done");
      requestAnimationFrame(() => setVisible(true));
    }, 900);
  }

  return (
    <div className="mt-4 rounded-2xl border-2 border-coral bg-gradient-to-r from-coral/10 to-sky/30 p-4">
      <p className="text-xs font-semibold text-coral">🎁 보상금 안내</p>
      <p className="mt-1 text-2xl font-extrabold text-navy">{formatted}</p>
      <p className="mt-1 text-xs text-navy-soft">
        물건을 찾아주셔서 감사해요! 아래 버튼으로 보상금 수령을 신청해보세요.
      </p>

      {status !== "done" ? (
        <button
          type="button"
          onClick={handleClaim}
          disabled={status === "processing"}
          className="mt-3 w-full rounded-xl bg-coral px-4 py-3 text-sm font-bold text-white disabled:opacity-70"
        >
          {status === "processing" ? "신청 처리 중..." : "보상금 수령 신청"}
        </button>
      ) : (
        <div
          className={`mt-3 rounded-xl bg-green-100 px-4 py-3 text-sm font-bold text-green-700 transition-all duration-300 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          보상금 {formatted} 입금 신청이 완료되었습니다!
          <p className="mt-1 text-xs font-normal text-green-700/80">
            데모 화면이에요. 실제 입금은 진행되지 않아요.
          </p>
        </div>
      )}
    </div>
  );
}
