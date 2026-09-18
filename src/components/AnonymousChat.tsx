"use client";

import { useState } from "react";

type ChatMessage = {
  id: string;
  from: "owner" | "finder";
  text: string;
  at: Date;
};

function formatTime(date: Date) {
  return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function seedMessages(): ChatMessage[] {
  const now = Date.now();
  return [
    {
      id: "seed-1",
      from: "finder",
      text: "안녕하세요! 1층 경비실에 맡겨두었습니다.",
      at: new Date(now - 12 * 60 * 1000),
    },
    {
      id: "seed-2",
      from: "owner",
      text: "감사합니다! 바로 가겠습니다.",
      at: new Date(now - 9 * 60 * 1000),
    },
  ];
}

/**
 * Demo-only chat: state lives entirely in this component (no Supabase
 * table, no realtime channel). It's a judging-presentation prop for how a
 * future messaging feature could look, not a real communication channel —
 * nothing typed here reaches the other party or survives a refresh.
 */
export function AnonymousChat({ viewerRole }: { viewerRole: "owner" | "finder" }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [draft, setDraft] = useState("");

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, from: viewerRole, text, at: new Date() },
    ]);
    setDraft("");
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-line bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-bold text-ink"><span className="h-2 w-2 rounded-full bg-brand ring-4 ring-brand/30" aria-hidden />익명 채팅 (Anonymous Chat)</span>
        <span className="text-sm text-ink-soft">{open ? "접기 ▲" : "펼치기 ▼"}</span>
      </button>

      {open && (
        <div className="border-t border-line p-4">
          <p className="mb-3 text-xs text-ink-soft">
            🧪 프로토타입 채팅이에요 — 이 화면에서만 보이고, 새로고침하면 초기화돼요.
          </p>
          <div className="mb-3 flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.from === viewerRole ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-[18px] px-4 py-2 text-sm ${
                    m.from === viewerRole ? "bg-brand text-white" : "bg-slate-100 text-ink"
                  }`}
                >
                  <p>{m.text}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      m.from === viewerRole ? "text-white/70" : "text-ink-soft"
                    }`}
                  >
                    {formatTime(m.at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="메시지를 입력하세요"
              maxLength={300}
              className="flex-1 rounded-xl border border-line px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/20"
            />
            <button
              type="submit"
              className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-deep"
            >
              전송
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
