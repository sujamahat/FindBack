"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Deletes an item the caller owns. found_reports and item_status_events both
 * reference items with `on delete cascade` (see the initial schema
 * migration), so this also removes every finder report and status event for
 * the item — the QR tag stops resolving to anything the moment the row is
 * gone, since /f/[publicToken] and /recover look items up by that row.
 */
export async function deleteItemAction(itemId: string): Promise<{ error: string | null }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { error, count } = await supabase
    .from("items")
    .delete({ count: "exact" })
    .eq("id", itemId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("[findback] failed to delete item", error);
    return { error: "물건을 삭제하지 못했어요. 다시 시도해주세요." };
  }

  if (!count) {
    return { error: "삭제할 물건을 찾을 수 없어요." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/items/${itemId}`);
  return { error: null };
}
