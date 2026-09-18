"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setStatus("error");
      setError("로그인 링크를 보내지 못했어요. 이메일 주소를 확인하고 다시 시도해주세요.");
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-sky bg-white p-6 text-center">
        <p className="font-bold text-navy">이메일을 확인해주세요</p>
        <p className="mt-2 text-sm text-navy-soft">
          {email}로 로그인 링크를 보냈어요. 메일함(스팸함 포함)을 확인해주세요.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
        이메일 주소
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-xl border border-sky bg-white px-4 py-3 text-base text-navy outline-none focus:border-navy"
        />
      </label>
      {error && <p className="text-sm font-semibold text-coral">{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-2xl bg-coral px-6 py-4 text-base font-bold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60"
      >
        {status === "sending" ? "전송 중..." : "이메일로 로그인 링크 받기"}
      </button>
      <p className="text-center text-xs text-navy-soft">
        비밀번호가 필요 없어요. 이메일로 받은 링크를 눌러 로그인하세요.
      </p>
    </form>
  );
}
