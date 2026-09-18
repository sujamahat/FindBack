import { describe, expect, it } from "vitest";
import { itemFormSchema, recoverCodeSchema, reportFormRefined } from "@/lib/validation";

describe("itemFormSchema", () => {
  it("accepts a minimal valid item", () => {
    const result = itemFormSchema.safeParse({ name: "우산", category: "우산" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty name with a Korean error message", () => {
    const result = itemFormSchema.safeParse({ name: "", category: "우산" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("물건 이름");
    }
  });

  it("rejects a category outside the allowed list", () => {
    const result = itemFormSchema.safeParse({ name: "우산", category: "드론" });
    expect(result.success).toBe(false);
  });
});

describe("reportFormRefined", () => {
  const base = {
    publicToken: "a".repeat(32),
    locationText: "중앙도서관",
    returnMethod: "location_only" as const,
    privacyAck: true as const,
  };

  it("accepts a minimal valid report", () => {
    expect(reportFormRefined.safeParse(base).success).toBe(true);
  });

  it("requires privacy acknowledgement", () => {
    const result = reportFormRefined.safeParse({ ...base, privacyAck: false });
    expect(result.success).toBe(false);
  });

  it("requires a custom place when returnMethod is 'other'", () => {
    const result = reportFormRefined.safeParse({ ...base, returnMethod: "other" });
    expect(result.success).toBe(false);
  });

  it("passes when 'other' includes a custom place", () => {
    const result = reportFormRefined.safeParse({
      ...base,
      returnMethod: "other",
      customReturnPlace: "학생회관 안내데스크",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a filled honeypot field as invalid input", () => {
    const result = reportFormRefined.safeParse({ ...base, website: "http://spam.example" });
    expect(result.success).toBe(false);
  });
});

describe("recoverCodeSchema", () => {
  it("rejects codes that are too short", () => {
    expect(recoverCodeSchema.safeParse({ code: "AB" }).success).toBe(false);
  });

  it("accepts a plausible code", () => {
    expect(recoverCodeSchema.safeParse({ code: "7K2M9P" }).success).toBe(true);
  });
});
