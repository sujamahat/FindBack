import { z } from "zod";
import { ITEM_CATEGORIES, RETURN_METHODS } from "./constants";

// FormData.get() returns `null` (not `undefined`) for a field that isn't
// present at all — e.g. an input that's conditionally unmounted in the DOM.
// Zod's `.optional()` only accepts `undefined`, so every optional text field
// sourced from FormData must also allow `null`, or a perfectly valid
// submission fails validation just because an unrelated field was hidden.
function optionalText(max: number, message: string) {
  return z.string().trim().max(max, message).optional().nullable().or(z.literal(""));
}

// Same null-from-FormData issue as optionalText, plus: an empty string must
// never coerce to the number 0 (a real, very wrong coordinate) — so blank
// values are normalized to `undefined` before the numeric check runs.
function optionalCoordinate(min: number, max: number, message: string) {
  return z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().min(min, message).max(max, message).optional()
  );
}

// Same empty-string/null normalization, for the demo-only reward amount
// (a plain display number — see the reward_amount migration comment).
export function optionalAmount(max: number, message: string) {
  return z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int(message).min(0, message).max(max, message).optional()
  );
}

export const itemFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "물건 이름을 입력해주세요.")
    .max(60, "물건 이름은 60자 이내로 입력해주세요."),
  category: z.enum(ITEM_CATEGORIES, {
    message: "카테고리를 선택해주세요.",
  }),
  description: optionalText(300, "설명은 300자 이내로 입력해주세요."),
  returnInstructions: optionalText(200, "반환 안내는 200자 이내로 입력해주세요."),
  photoUrl: z.string().url().optional().nullable().or(z.literal("")),
  // Demo-only display amount — see reward_amount migration comment.
  rewardAmount: optionalAmount(10_000_000, "보상금은 0원 이상 1천만원 이하로 입력해주세요."),
});

export type ItemFormInput = z.infer<typeof itemFormSchema>;

export const reportFormSchema = z.object({
  publicToken: z.string().min(10, "잘못된 요청입니다."),
  // Optional by request: a finder can rely on returnMethod + shared GPS
  // instead of typing a location, to minimize submission friction.
  locationText: optionalText(200, "발견 장소는 200자 이내로 입력해주세요."),
  returnMethod: z.enum(RETURN_METHODS, {
    message: "물건을 어떻게 했는지 선택해주세요.",
  }),
  customReturnPlace: optionalText(200, "장소는 200자 이내로 입력해주세요."),
  message: optionalText(500, "메시지는 500자 이내로 입력해주세요."),
  photoUrl: z.string().url().optional().nullable().or(z.literal("")),
  // Only ever populated when the finder taps "내 위치 공유하기" — never sent
  // automatically, so both are absent on most submissions.
  latitude: optionalCoordinate(-90, 90, "위치 정보가 올바르지 않습니다."),
  longitude: optionalCoordinate(-180, 180, "위치 정보가 올바르지 않습니다."),
  privacyAck: z.literal(true, {
    message: "개인정보 안내에 동의해주세요.",
  }),
  // Honeypot: real users never fill this in. Bots that auto-fill every field will.
  website: z.string().max(0, "잘못된 요청입니다.").optional().nullable().or(z.literal("")),
});

export type ReportFormInput = z.infer<typeof reportFormSchema>;

export const reportFormRefined = reportFormSchema.superRefine((data, ctx) => {
  if (data.returnMethod === "other" && !data.customReturnPlace) {
    ctx.addIssue({
      code: "custom",
      message: "맡긴 장소를 입력해주세요.",
      path: ["customReturnPlace"],
    });
  }
});

export const rewardAmountSchema = z.object({
  rewardAmount: optionalAmount(10_000_000, "보상금은 0원 이상 1천만원 이하로 입력해주세요."),
});

export const recoverCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, "코드를 정확히 입력해주세요.")
    .max(12, "코드를 정확히 입력해주세요."),
});
