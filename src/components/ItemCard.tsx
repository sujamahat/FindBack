import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import type { ItemStatus } from "@/lib/constants";

export function ItemCard({
  id,
  name,
  category,
  status,
  photoUrl,
  reportCount,
}: {
  id: string;
  name: string;
  category: string;
  status: ItemStatus;
  photoUrl: string | null;
  reportCount: number;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-sky bg-white p-4 shadow-sm">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sky">
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
            <p className="font-bold text-navy">{name}</p>
            <p className="text-xs text-navy-soft">{category}</p>
          </div>
          <StatusBadge status={status} />
        </div>
        <p className="text-xs text-navy-soft">
          발견 제보 {reportCount}건
        </p>
        <div className="mt-auto flex gap-2 pt-2">
          <Link
            href={`/items/${id}`}
            className="rounded-xl bg-navy px-3 py-2 text-xs font-bold text-cream"
          >
            관리하기
          </Link>
          <Link
            href={`/items/${id}/tag`}
            className="rounded-xl border border-navy px-3 py-2 text-xs font-bold text-navy"
          >
            태그 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
