"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

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

const IS_DEV = process.env.NODE_ENV !== "production";

/** Development-only email + password sign-in for the seeded test user (npm run seed:user). */
function DevPasswordLogin({ next }: { next: string }) {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) {
      setBusy(false);
      setError(`${error.message} — npm run seed:user 로 테스트 계정을 먼저 만들어주세요.`);
      return;
    }
    window.location.assign(next);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-[26px] border border-dashed border-line bg-surface p-6"
    >
      <p className="text-xs font-black uppercase tracking-wide text-ink-mute">개발용 테스트 로그인</p>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="fb-input" />
      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="fb-input" />
      {error && <p className="text-sm font-semibold text-rose-700">{error}</p>}
      <button
        type="submit"
        disabled={busy || !isSupabaseConfigured}
        className="rounded-2xl border border-brand px-6 py-3 text-sm font-bold text-brand-deep transition hover:bg-brand-soft disabled:opacity-60"
      >
        {busy ? "로그인 중..." : "비밀번호로 로그인"}
      </button>
    </form>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) return;
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

  async function handleGoogle() {
    if (!isSupabaseConfigured) return;
    setError(null);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setStatus("error");
      setError("Google 로그인을 시작하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
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
    <>
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

      {!isSupabaseConfigured && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          Supabase 환경 변수가 설정되지 않아 로그인할 수 없어요. .env.example을 참고해 .env.local을
          만든 뒤 개발 서버를 다시 시작해주세요.
        </p>
      )}

      <button
        type="button"
        onClick={handleGoogle}
        disabled={!isSupabaseConfigured}
        className="rounded-2xl border border-line bg-white px-6 py-3.5 text-sm font-bold text-ink transition hover:bg-background active:scale-[0.98] disabled:opacity-60"
      >
        Google로 계속하기
      </button>
      <div className="flex items-center gap-3 text-xs text-ink-mute">
        <span className="h-px flex-1 bg-line" />
        또는
        <span className="h-px flex-1 bg-line" />
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
          disabled={status === "sending" || !isSupabaseConfigured}
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
    {IS_DEV && <DevPasswordLogin next={next} />}
    </>
  );
}
