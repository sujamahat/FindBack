import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteItemButton } from "@/components/DeleteItemButton";
import type { ItemStatus } from "@/lib/constants";

export function ItemCard({
  id,
  name,
  category,
  status,
  photoUrl,
  reportCount,
  description,
  publicToken,
  rewardAmount,
  onDeleted,
}: {
  id: string;
  name: string;
  category: string;
  status: ItemStatus;
  photoUrl: string | null;
  reportCount: number;
  description?: string | null;
  publicToken?: string;
  rewardAmount?: number | null;
  onDeleted?: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-line bg-surface p-3 shadow-sm transition hover:-translate-y-1 hover:border-brand-line">
      <div className="relative h-36 w-full overflow-hidden rounded-[18px] bg-brand-soft">
        <SafeImage
          src={photoUrl}
          alt={name}
          className="h-full w-full object-cover"
          fallback={<div className="flex h-full w-full items-center justify-center text-4xl">📦</div>}
        />
        <div className="absolute left-2.5 top-2.5">
          <StatusBadge status={status} />
        </div>
        <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
          <Link
            href={`/items/${id}/tag`}
            aria-label="QR 태그 보기"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-brand-deep shadow-sm transition hover:bg-brand-soft"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14v3M14 20h3M20 20v1" />
            </svg>
          </Link>
          {onDeleted && <DeleteItemButton itemId={id} onDeleted={onDeleted} variant="icon-only" />}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 px-1.5 pb-1 pt-3">
        <Link href={`/items/${id}`} className="break-words text-[15px] font-bold leading-snug text-ink hover:text-brand-deep">
          {name}
        </Link>
        <p className="line-clamp-2 min-h-[2rem] text-xs text-ink-soft">
          {description || `${category} · 발견 제보 ${reportCount}건`}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
          <span className="truncate font-mono text-[11px] text-ink-mute">
            {publicToken ? `#${publicToken.slice(0, 8)}` : ""}
          </span>
          {rewardAmount != null && (
            <span className="shrink-0 text-sm font-black text-brand-deep">
              ₩{rewardAmount.toLocaleString("ko-KR")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
