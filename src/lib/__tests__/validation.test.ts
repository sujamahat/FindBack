import { describe, expect, it } from "vitest";
import {
  itemFormSchema,
  recoverCodeSchema,
  reportFormRefined,
  rewardAmountSchema,
} from "@/lib/validation";

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

  it("accepts null for optional fields (FormData.get() returns null, not undefined, for an unmounted input)", () => {
    const result = reportFormRefined.safeParse({
      ...base,
      customReturnPlace: null,
      message: null,
      photoUrl: null,
      website: null,
    });
    expect(result.success).toBe(true);
  });

  it("still requires a custom place when returnMethod is 'other', even if the field reads back null", () => {
    const result = reportFormRefined.safeParse({
      ...base,
      returnMethod: "other",
      customReturnPlace: null,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a report with no locationText at all (optional, per zero-friction requirement)", () => {
    const { locationText: _locationText, ...withoutLocation } = base;
    void _locationText;
    expect(reportFormRefined.safeParse(withoutLocation).success).toBe(true);
  });

  it("accepts valid opt-in GPS coordinates", () => {
    const result = reportFormRefined.safeParse({ ...base, latitude: "37.5665", longitude: "126.9780" });
    expect(result.success).toBe(true);
  });

  it("treats empty-string coordinates as absent rather than 0,0", () => {
    const result = reportFormRefined.safeParse({ ...base, latitude: "", longitude: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.latitude).toBeUndefined();
      expect(result.data.longitude).toBeUndefined();
    }
  });

  it("treats null coordinates (FormData.get() default) as absent", () => {
    const result = reportFormRefined.safeParse({ ...base, latitude: null, longitude: null });
    expect(result.success).toBe(true);
  });

  it("rejects out-of-range coordinates", () => {
    expect(reportFormRefined.safeParse({ ...base, latitude: "999", longitude: "0" }).success).toBe(
      false
    );
  });
});

describe("rewardAmountSchema", () => {
  it("treats an empty string as no reward set", () => {
    const result = rewardAmountSchema.safeParse({ rewardAmount: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.rewardAmount).toBeUndefined();
  });

  it("treats null (FormData.get() default) as no reward set", () => {
    expect(rewardAmountSchema.safeParse({ rewardAmount: null }).success).toBe(true);
  });

  it("accepts a plausible reward amount", () => {
    const result = rewardAmountSchema.safeParse({ rewardAmount: "20000" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.rewardAmount).toBe(20000);
  });

  it("rejects a negative amount", () => {
    expect(rewardAmountSchema.safeParse({ rewardAmount: "-1" }).success).toBe(false);
  });

  it("rejects an amount above the cap", () => {
    expect(rewardAmountSchema.safeParse({ rewardAmount: "20000000" }).success).toBe(false);
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
