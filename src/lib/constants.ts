export const ITEM_CATEGORIES = [
  "우산",
  "물병/텀블러",
  "가방",
  "지갑",
  "열쇠",
  "전자기기",
  "필통",
  "기타",
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const ITEM_STATUSES = ["safe", "lost", "found", "returned"] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  safe: "보관중",
  lost: "분실중",
  found: "발견 제보 도착",
  returned: "반환완료",
};

// Karrot(당근마켓)-style status coloring: green/orange/blue for the three
// core states, plus a distinct accent for "found" (needs owner attention).
export const ITEM_STATUS_BADGE_STYLE: Record<ItemStatus, string> = {
  safe: "border border-brand-line bg-brand-soft text-brand-deep",
  lost: "border border-rose-200 bg-rose-50 text-rose-700",
  found: "border border-brand bg-brand text-white",
  returned: "border border-sky-200 bg-sky-50 text-sky-700",
};

export const RETURN_METHODS = [
  "location_only",
  "security_office",
  "information_desk",
  "lost_and_found",
  "other",
] as const;

export type ReturnMethod = (typeof RETURN_METHODS)[number];

export const RETURN_METHOD_LABELS: Record<ReturnMethod, string> = {
  location_only: "발견 장소만 알려주기",
  security_office: "경비실에 맡겼어요",
  information_desk: "안내 데스크에 맡겼어요",
  lost_and_found: "분실물 보관소에 맡겼어요",
  other: "기타 장소에 맡겼어요",
};
