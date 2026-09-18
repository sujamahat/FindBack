import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendOwnerReportNotification } from "@/lib/notifications/email";
import { getAppUrl } from "@/lib/supabase/env";
import { getClientKey, isRateLimited } from "@/lib/rateLimit";
import { reportFormRefined } from "@/lib/validation";

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  if (isRateLimited(`report:${clientKey}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json(
      { error: "잠시 후 다시 시도해주세요. 너무 많은 요청이 감지되었어요." },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const photoFile = formData.get("photo");
  let uploadedPhotoUrl = "";

  if (photoFile instanceof File && photoFile.size > 0) {
    if (photoFile.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { error: "사진 용량은 5MB 이하여야 해요.", fieldErrors: { photo: "사진 용량은 5MB 이하여야 해요." } },
        { status: 400 }
      );
    }
    if (!photoFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "이미지 파일만 업로드할 수 있어요.", fieldErrors: { photo: "이미지 파일만 업로드할 수 있어요." } },
        { status: 400 }
      );
    }

    const ext = photoFile.name.split(".").pop() || "jpg";
    const path = `reports/${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await photoFile.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from("findback-media")
      .upload(path, buffer, { contentType: photoFile.type });

    if (uploadError) {
      console.error("[findback] report photo upload failed", uploadError);
    } else {
      uploadedPhotoUrl = admin.storage.from("findback-media").getPublicUrl(path).data.publicUrl;
    }
  }

  const parsed = reportFormRefined.safeParse({
    publicToken: formData.get("publicToken"),
    locationText: formData.get("locationText"),
    returnMethod: formData.get("returnMethod"),
    customReturnPlace: formData.get("customReturnPlace"),
    message: formData.get("message"),
    photoUrl: uploadedPhotoUrl || undefined,
    privacyAck: formData.get("privacyAck") === "true",
    website: formData.get("website"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0] ?? "form")] = issue.message;
    }
    return NextResponse.json({ error: "입력값을 확인해주세요.", fieldErrors }, { status: 400 });
  }

  const data = parsed.data;

  // Honeypot: bots fill every field, real users never see or fill `website`.
  if (data.website) {
    return NextResponse.json({ ok: true });
  }

  const { data: item, error: itemError } = await admin
    .from("items")
    .select("id, owner_id, name, status")
    .eq("public_token", data.publicToken)
    .single();

  if (itemError || !item) {
    return NextResponse.json({ error: "물건을 찾을 수 없습니다." }, { status: 404 });
  }

  const { error: insertError } = await admin.from("found_reports").insert({
    item_id: item.id,
    location_text: data.locationText,
    return_method: data.returnMethod,
    custom_return_place: data.customReturnPlace || null,
    message: data.message || null,
    photo_url: data.photoUrl || null,
  });

  if (insertError) {
    console.error("[findback] failed to insert found_report", insertError);
    return NextResponse.json(
      { error: "제보를 저장하지 못했어요. 다시 시도해주세요." },
      { status: 500 }
    );
  }

  if (item.status === "safe" || item.status === "lost") {
    await admin.from("items").update({ status: "found" }).eq("id", item.id);
  }

  // Best-effort notification; never fail the finder's request because of it.
  try {
    const { data: ownerUser } = await admin.auth.admin.getUserById(item.owner_id);
    if (ownerUser.user?.email) {
      await sendOwnerReportNotification({
        ownerEmail: ownerUser.user.email,
        itemName: item.name,
        itemUrl: `${getAppUrl()}/items/${item.id}`,
      });
    }
  } catch (error) {
    console.error("[findback] notification lookup failed", error);
  }

  return NextResponse.json({ ok: true });
}
