export function ProfileBanner({
  email,
  total,
  lostCount,
  returnedCount,
}: {
  email: string;
  total: number;
  lostCount: number;
  returnedCount: number;
}) {
  // No separate profile/display-name feature exists (email magic-link only),
  // so the display name is derived from the account's own email — never a
  // fabricated name.
  const displayName = email.split("@")[0] || "사용자";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-4 rounded-[26px] border border-line bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xl font-black text-brand-deep">
          {initial}
          <span className="absolute -bottom-0.5 -right-0.5 h-[18px] w-[18px] rounded-full border-[3px] border-white bg-brand ring-[3px] ring-brand/30" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[19px] font-black tracking-tight text-ink">{displayName}</p>
          <p className="mt-1 truncate font-mono text-xs text-ink-mute">{email}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-left sm:w-80">
        <div className="rounded-2xl border border-line bg-slate-50 px-3.5 py-3">
          <p className="font-mono text-xl font-bold text-ink">{total}</p>
          <p className="mt-1.5 text-[10.5px] text-ink-soft">등록</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3">
          <p className="font-mono text-xl font-bold text-rose-700">{lostCount}</p>
          <p className="mt-1.5 text-[10.5px] text-rose-700">분실중</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-3.5 py-3">
          <p className="font-mono text-xl font-bold text-sky-700">{returnedCount}</p>
          <p className="mt-1.5 text-[10.5px] text-sky-700">반환완료</p>
        </div>
      </div>
    </div>
  );
}
