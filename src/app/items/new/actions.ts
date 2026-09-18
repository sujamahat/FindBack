"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generatePublicToken, generateRecoveryCode } from "@/lib/codes";
import { itemFormSchema } from "@/lib/validation";

export type CreateItemState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const MAX_ATTEMPTS = 5;

export async function createItemAction(
  _prevState: CreateItemState,
  formData: FormData
): Promise<CreateItemState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const parsed = itemFormSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description"),
    returnInstructions: formData.get("returnInstructions"),
    photoUrl: formData.get("photoUrl"),
    rewardAmount: formData.get("rewardAmount"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] = issue.message;
    }
    return { error: "입력값을 확인해주세요.", fieldErrors };
  }

  const { name, category, description, returnInstructions, photoUrl, rewardAmount } = parsed.data;

  let itemId: string | null = null;
  let lastError: string | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const { data, error } = await supabase
      .from("items")
      .insert({
        owner_id: user.id,
        public_token: generatePublicToken(),
        recovery_code: generateRecoveryCode(),
        name,
        category,
        description: description || null,
        return_instructions: returnInstructions || null,
        photo_url: photoUrl || null,
        reward_amount: rewardAmount ?? null,
      })
      .select("id")
      .single();

    if (!error && data) {
      itemId = data.id;
      break;
    }

    // Unique violation on public_token/recovery_code: retry with new codes.
    if (error?.code === "23505") {
      lastError = error.message;
      continue;
    }

    return { error: "물건을 등록하지 못했어요. 잠시 후 다시 시도해주세요." };
  }

  if (!itemId) {
    console.error("[findback] item code generation exhausted retries", lastError);
    return { error: "코드 생성에 실패했어요. 다시 시도해주세요." };
  }

  redirect(`/items/${itemId}?created=1`);
}
