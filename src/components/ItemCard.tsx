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
  onDeleted,
}: {
  id: string;
  name: string;
  category: string;
  status: ItemStatus;
  photoUrl: string | null;
  reportCount: number;
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
      </div>
      <div className="flex flex-1 flex-col gap-1 px-1.5 pb-1 pt-3">
        <p className="break-words text-[15px] font-bold leading-snug text-ink">{name}</p>
        <p className="text-xs text-ink-soft">
          {category} · 발견 제보 {reportCount}건
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-3 mt-3">
          <Link
            href={`/items/${id}`}
            className="whitespace-nowrap rounded-xl bg-brand px-3.5 py-2 text-xs font-bold text-white transition hover:bg-brand-deep"
          >
            관리하기
          </Link>
          <Link
            href={`/items/${id}/tag`}
            className="whitespace-nowrap rounded-xl border border-brand-line px-3.5 py-2 text-xs font-bold text-brand-deep transition hover:bg-brand-soft"
          >
            태그 보기
          </Link>
          {onDeleted && <DeleteItemButton itemId={id} onDeleted={onDeleted} variant="icon" />}
        </div>
      </div>
    </div>
  );
}
