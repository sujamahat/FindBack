"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generatePublicToken, generateRecoveryCode } from "@/lib/codes";

const SAMPLE_ITEMS = [
  { name: "에어팟 프로 2", category: "전자기기", status: "safe" },
  { name: "자동차 키 (제네시스)", category: "열쇠", status: "lost" },
  { name: "하늘색 우산", category: "우산", status: "returned" },
] as const;

/** Development helper: inserts sample items for the signed-in user (RLS applies). */
export async function seedSampleItemsAction(): Promise<void> {
  if (process.env.NODE_ENV === "production") return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("items").insert(
    SAMPLE_ITEMS.map((item) => ({
      ...item,
      owner_id: user.id,
      public_token: generatePublicToken(),
      recovery_code: generateRecoveryCode(),
    }))
  );
  if (error) console.error("[findback] seed sample items failed:", error.message);

  revalidatePath("/dashboard");
}
