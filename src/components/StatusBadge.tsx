import { ITEM_STATUS_BADGE_STYLE, ITEM_STATUS_LABELS, type ItemStatus } from "@/lib/constants";

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm ${ITEM_STATUS_BADGE_STYLE[status]}`}
    >
      {ITEM_STATUS_LABELS[status]}
    </span>
  );
}
