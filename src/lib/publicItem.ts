import type { Database } from "@/lib/supabase/types";

export type PublicItemView = {
  name: string;
  category: string;
  description: string | null;
  returnInstructions: string | null;
  photoUrl: string | null;
  status: string;
};

/**
 * Strips a full items row down to only what a finder is allowed to see.
 * Never pass id, owner_id, public_token, created_at, or updated_at through
 * this — those stay server-side.
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
  };
}
