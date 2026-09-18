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
    <div className="rounded-2xl bg-navy p-5 text-cream">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-coral text-xl font-bold text-white">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold">{displayName}</p>
          <p className="truncate text-xs text-cream/70">{email}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white/10 py-3">
          <p className="text-lg font-bold">{total}</p>
          <p className="text-[11px] text-cream/70">전체 물건</p>
        </div>
        <div className="rounded-xl bg-white/10 py-3">
          <p className="text-lg font-bold text-orange-300">{lostCount}</p>
          <p className="text-[11px] text-cream/70">분실중</p>
        </div>
        <div className="rounded-xl bg-white/10 py-3">
          <p className="text-lg font-bold text-sky-300">{returnedCount}</p>
          <p className="text-[11px] text-cream/70">반환완료</p>
        </div>
      </div>
    </div>
  );
}
