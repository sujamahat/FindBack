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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
        복구 코드
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
          maxLength={12}
          placeholder="예: 7K2M9P"
          className="rounded-xl border border-sky bg-white px-4 py-4 text-center text-2xl font-bold tracking-widest text-navy outline-none focus:border-navy"
        />
      </label>
      {error && (
        <p className="rounded-xl bg-coral-soft px-4 py-3 text-sm font-semibold text-coral">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "checking"}
        className="rounded-2xl bg-coral px-6 py-4 text-base font-bold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60"
      >
        {status === "checking" ? "확인 중..." : "물건 페이지로 이동"}
      </button>
    </form>
  );
}
