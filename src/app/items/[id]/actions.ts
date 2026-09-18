"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isValidStatusTransition } from "@/lib/statusTransitions";

export async function markItemStatus(itemId: string, status: "lost" | "returned" | "safe") {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { data: current } = await supabase
    .from("items")
    .select("status")
    .eq("id", itemId)
    .eq("owner_id", user.id)
    .single();

  if (!current || !isValidStatusTransition(current.status, status)) {
    return { error: "현재 상태에서는 이 작업을 할 수 없어요." };
  }

  const { error } = await supabase
    .from("items")
    .update({ status })
    .eq("id", itemId)
    .eq("owner_id", user.id);

  if (error) {
    return { error: "상태를 변경하지 못했어요." };
  }

  if (status === "lost" || status === "returned") {
    await supabase.from("item_status_events").insert({ item_id: itemId, event_type: status });
  }

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/dashboard");
  return { error: null };
}
