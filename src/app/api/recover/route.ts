import { NextResponse } from "next/server";
import { createSupabaseAdminClient, isAdminConfigured } from "@/lib/supabase/admin";
import { normalizeRecoveryCode } from "@/lib/codes";
import { getClientKey, isRateLimited } from "@/lib/rateLimit";
import { recoverCodeSchema } from "@/lib/validation";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  if (isRateLimited(`recover:${clientKey}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json({ error: "잠시 후 다시 시도해주세요." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const parsed = recoverCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "코드를 정확히 입력해주세요." },
      { status: 400 }
    );
  }

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "서버 설정이 아직 완료되지 않았어요. 잠시 후 다시 시도해주세요." },
      { status: 503 }
    );
  }

  const code = normalizeRecoveryCode(parsed.data.code);
  const admin = createSupabaseAdminClient();

  const { data: item } = await admin
    .from("items")
    .select("public_token")
    .eq("recovery_code", code)
    .single();

  // Generic message either way: never reveal whether a similar code exists.
  if (!item) {
    return NextResponse.json(
      { error: "유효하지 않은 코드예요. 태그에 적힌 코드를 다시 확인해주세요." },
      { status: 404 }
    );
  }

  return NextResponse.json({ publicToken: item.public_token });
}
