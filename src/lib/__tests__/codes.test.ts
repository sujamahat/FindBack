import { describe, expect, it } from "vitest";
import { generatePublicToken, generateRecoveryCode, normalizeRecoveryCode } from "@/lib/codes";

describe("generatePublicToken", () => {
  it("produces a long, URL-safe, unpredictable token", () => {
    const token = generatePublicToken();
    expect(token.length).toBeGreaterThanOrEqual(30);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("never repeats across many calls", () => {
    const tokens = new Set(Array.from({ length: 1000 }, () => generatePublicToken()));
    expect(tokens.size).toBe(1000);
  });
});

describe("generateRecoveryCode", () => {
  it("is short and human-friendly", () => {
    const code = generateRecoveryCode();
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Z0-9]+$/);
  });

  it("excludes visually ambiguous characters", () => {
    for (let i = 0; i < 500; i++) {
      const code = generateRecoveryCode();
      expect(code).not.toMatch(/[0O1IL]/);
    }
  });

  it("has very low collision odds across many calls", () => {
    const codes = new Set(Array.from({ length: 2000 }, () => generateRecoveryCode()));
    expect(codes.size).toBe(2000);
  });
});

describe("normalizeRecoveryCode", () => {
  it("uppercases, trims, and strips separators a user might type", () => {
    expect(normalizeRecoveryCode(" 7k-2m 9p ")).toBe("7K2M9P");
  });

  it("strips characters outside the recovery alphabet", () => {
    expect(normalizeRecoveryCode("7K2M9P!!")).toBe("7K2M9P");
  });
});
