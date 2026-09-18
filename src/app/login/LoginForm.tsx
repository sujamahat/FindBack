"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

const MODE_COPY: Record<Mode, { tab: string; button: string; sendingButton: string; error: string }> = {
  signin: {
    tab: "로그인",
    button: "로그인 링크 받기",
    sendingButton: "전송 중...",
    error: "로그인 링크를 보내지 못했어요. 계정이 없다면 회원가입 탭을 이용해주세요.",
  },
  signup: {
    tab: "회원가입",
    button: "회원가입 링크 받기",
    sendingButton: "전송 중...",
    error: "회원가입 링크를 보내지 못했어요. 이메일 주소를 확인하고 다시 시도해주세요.",
  },
};

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>("signin");
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
      options: {
        emailRedirectTo: redirectTo,
        // 로그인 탭에서는 계정이 없으면 새로 만들지 않고, 회원가입 탭에서만 새 계정을 생성합니다.
        shouldCreateUser: mode === "signup",
      },
    });

    if (error) {
      setStatus("error");
      setError(MODE_COPY[mode].error);
      return;
    }

    setStatus("sent");
  }

  function switchMode(next: Mode) {
    setMode(next);
    setStatus("idle");
    setError(null);
  }

  if (status === "sent") {
    return (
      <div className="rounded-[26px] border border-brand-line bg-brand-soft p-6 text-center">
        <p className="font-black text-brand-deep">이메일을 확인해주세요</p>
        <p className="mt-2 text-sm text-ink-soft">
          {email}로 {mode === "signin" ? "로그인" : "회원가입"} 링크를 보냈어요. 메일함(스팸함
          포함)을 확인해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-[26px] border border-line bg-surface p-6 shadow-sm">
      <div className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-background p-1">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            aria-pressed={mode === m}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              mode === m ? "bg-brand text-white shadow-sm" : "text-ink-soft hover:text-brand-deep"
            }`}
          >
            {MODE_COPY[m].tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-bold text-ink">
          이메일 주소
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="fb-input"
          />
        </label>
        {error && <p className="text-sm font-semibold text-rose-700">{error}</p>}
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-2xl bg-brand px-6 py-4 text-base font-bold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-deep active:scale-[0.98] disabled:opacity-60"
        >
          {status === "sending" ? MODE_COPY[mode].sendingButton : MODE_COPY[mode].button}
        </button>
        <p className="text-center text-xs text-ink-mute">
          비밀번호가 필요 없어요. {mode === "signin" ? "로그인" : "회원가입"} 모두 이메일로 받는
          매직링크(Supabase Auth)로 진행돼요.
        </p>
      </form>
    </div>
  );
}
