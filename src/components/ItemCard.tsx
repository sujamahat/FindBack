import Link from "next/link";
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
    <div className="flex gap-4 rounded-[24px] border border-line bg-surface p-3 shadow-sm transition hover:-translate-y-1 hover:border-brand-line">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[18px] bg-brand-soft">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">📦</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-ink">{name}</p>
            <p className="text-xs text-ink-soft">{category}</p>
          </div>
          <StatusBadge status={status} />
        </div>
        <p className="text-xs text-ink-mute">
          발견 제보 {reportCount}건
        </p>
        <div className="mt-auto flex gap-2 pt-2">
          <Link
            href={`/items/${id}`}
            className="rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-deep"
          >
            관리하기
          </Link>
          <Link
            href={`/items/${id}/tag`}
            className="rounded-xl border border-brand-line px-3 py-2 text-xs font-bold text-brand-deep transition hover:bg-brand-soft"
          >
            태그 보기
          </Link>
          {onDeleted && <DeleteItemButton itemId={id} onDeleted={onDeleted} variant="icon" />}
        </div>
      </div>
    </div>
  );
}
