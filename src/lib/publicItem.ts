import type { Database } from "@/lib/supabase/types";

export type PublicItemView = {
  name: string;
  category: string;
  description: string | null;
  returnInstructions: string | null;
  photoUrl: string | null;
  status: string;
  rewardAmount: number | null;
};

/**
 * Strips a full items row down to only what a finder is allowed to see.
 * Never pass id, owner_id, public_token, created_at, or updated_at through
 * this — those stay server-side. rewardAmount is a plain display number the
 * owner set (demo feature, no real payment); it's meant to be public, same
 * as name/description.
 */
export function toPublicItemView(
  item: Database["public"]["Tables"]["items"]["Row"]
): PublicItemView {
  return {
    name: item.name,
    category: item.category,
    description: item.description,
    returnInstructions: item.return_instructions,
    photoUrl: item.photo_url,
    status: item.status,
    rewardAmount: item.reward_amount,
  };
}
