import { ITEM_STATUS_BADGE_STYLE, ITEM_STATUS_LABELS, type ItemStatus } from "@/lib/constants";

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${ITEM_STATUS_BADGE_STYLE[status]}`}
    >
      {ITEM_STATUS_LABELS[status]}
    </span>
  );
}
