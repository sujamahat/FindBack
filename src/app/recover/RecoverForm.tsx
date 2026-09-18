"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RecoverForm() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("checking");
    setError(null);

    try {
      const res = await fetch("/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(body.error ?? "유효하지 않은 코드예요.");
        return;
      }

      router.push(`/f/${body.publicToken}`);
    } catch {
      setStatus("error");
      setError("네트워크 오류가 발생했어요. 다시 시도해주세요.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-[26px] border border-line bg-surface p-6 shadow-sm">
      <label className="flex flex-col gap-2 text-sm font-bold text-ink">
        복구 코드
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
          maxLength={12}
          placeholder="예: 7K2M9P"
          className="fb-input py-4 text-center font-mono text-2xl font-bold tracking-widest"
        />
      </label>
      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "checking"}
        className="rounded-2xl bg-brand px-6 py-4 text-base font-bold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-deep active:scale-[0.98] disabled:opacity-60"
      >
        {status === "checking" ? "확인 중..." : "물건 페이지로 이동"}
      </button>
    </form>
  );
}
