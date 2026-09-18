import type { ItemStatus } from "@/lib/constants";

/**
 * Valid owner-initiated status transitions. `found` is never a target here —
 * the system sets it automatically when a finder submits a report
 * (see /api/reports), owners don't set it by hand.
 */
const ALLOWED_TRANSITIONS: Record<ItemStatus, ItemStatus[]> = {
  safe: ["lost"],
  lost: ["safe", "returned"],
  found: ["returned", "safe"],
  returned: ["safe"],
};

export function isValidStatusTransition(current: ItemStatus, next: ItemStatus): boolean {
  if (current === next) return false;
  return ALLOWED_TRANSITIONS[current].includes(next);
}

export function getAllowedNextStatuses(current: ItemStatus): ItemStatus[] {
  return ALLOWED_TRANSITIONS[current];
}
