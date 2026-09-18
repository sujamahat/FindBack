import { describe, expect, it } from "vitest";
import { getAllowedNextStatuses, isValidStatusTransition } from "@/lib/statusTransitions";

describe("isValidStatusTransition", () => {
  it("allows marking a safe item lost", () => {
    expect(isValidStatusTransition("safe", "lost")).toBe(true);
  });

  it("allows returning a found item", () => {
    expect(isValidStatusTransition("found", "returned")).toBe(true);
  });

  it("allows reactivating a returned item", () => {
    expect(isValidStatusTransition("returned", "safe")).toBe(true);
  });

  it("rejects a no-op transition", () => {
    expect(isValidStatusTransition("safe", "safe")).toBe(false);
  });

  it("rejects owners setting 'found' directly (system-only)", () => {
    expect(isValidStatusTransition("safe", "found")).toBe(false);
    expect(isValidStatusTransition("lost", "found")).toBe(false);
  });

  it("rejects returning an already-safe item", () => {
    expect(isValidStatusTransition("safe", "returned")).toBe(false);
  });
});

describe("getAllowedNextStatuses", () => {
  it("never includes the current status itself", () => {
    (["safe", "lost", "found", "returned"] as const).forEach((status) => {
      expect(getAllowedNextStatuses(status)).not.toContain(status);
    });
  });
});
