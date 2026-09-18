import { z } from "zod";
import { ITEM_CATEGORIES, RETURN_METHODS } from "./constants";

export const itemFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "물건 이름을 입력해주세요.")
    .max(60, "물건 이름은 60자 이내로 입력해주세요."),
  category: z.enum(ITEM_CATEGORIES, {
    message: "카테고리를 선택해주세요.",
  }),
  description: z
    .string()
    .trim()
    .max(300, "설명은 300자 이내로 입력해주세요.")
    .optional()
    .or(z.literal("")),
  returnInstructions: z
    .string()
    .trim()
    .max(200, "반환 안내는 200자 이내로 입력해주세요.")
    .optional()
    .or(z.literal("")),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export type ItemFormInput = z.infer<typeof itemFormSchema>;

export const reportFormSchema = z.object({
  publicToken: z.string().min(10, "잘못된 요청입니다."),
  locationText: z
    .string()
    .trim()
    .min(1, "발견 장소를 입력해주세요.")
    .max(200, "발견 장소는 200자 이내로 입력해주세요."),
  returnMethod: z.enum(RETURN_METHODS, {
    message: "물건을 어떻게 했는지 선택해주세요.",
  }),
  customReturnPlace: z
    .string()
    .trim()
    .max(200, "장소는 200자 이내로 입력해주세요.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .max(500, "메시지는 500자 이내로 입력해주세요.")
    .optional()
    .or(z.literal("")),
  photoUrl: z.string().url().optional().or(z.literal("")),
  privacyAck: z.literal(true, {
    message: "개인정보 안내에 동의해주세요.",
  }),
  // Honeypot: real users never fill this in. Bots that auto-fill every field will.
  website: z.string().max(0, "잘못된 요청입니다.").optional().or(z.literal("")),
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

export const recoverCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, "코드를 정확히 입력해주세요.")
    .max(12, "코드를 정확히 입력해주세요."),
});
