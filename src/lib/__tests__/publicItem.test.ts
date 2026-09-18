import { describe, expect, it } from "vitest";
import { toPublicItemView } from "@/lib/publicItem";
import type { Database } from "@/lib/supabase/types";

const fullRow: Database["public"]["Tables"]["items"]["Row"] = {
  id: "11111111-1111-1111-1111-111111111111",
  owner_id: "22222222-2222-2222-2222-222222222222",
  public_token: "super-secret-token",
  recovery_code: "7K2M9P",
  name: "하늘색 우산",
  category: "우산",
  description: "손잡이에 스티커가 있어요",
  return_instructions: "학생회관 안내데스크에 맡겨주세요",
  photo_url: "https://example.com/photo.jpg",
  status: "safe",
  reward_amount: 20000,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("toPublicItemView", () => {
  it("only exposes name, category, description, return instructions, photo, status, and reward amount", () => {
    const view = toPublicItemView(fullRow);
    expect(view).toEqual({
      name: "하늘색 우산",
      category: "우산",
      description: "손잡이에 스티커가 있어요",
      returnInstructions: "학생회관 안내데스크에 맡겨주세요",
      photoUrl: "https://example.com/photo.jpg",
      status: "safe",
      rewardAmount: 20000,
    });
  });

  it("never leaks owner_id, id, public_token, or timestamps", () => {
    const view = toPublicItemView(fullRow) as Record<string, unknown>;
    expect(view.id).toBeUndefined();
    expect(view.owner_id).toBeUndefined();
    expect(view.public_token).toBeUndefined();
    expect(view.recovery_code).toBeUndefined();
    expect(view.created_at).toBeUndefined();
    expect(view.updated_at).toBeUndefined();
  });
});
