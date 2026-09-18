"use client";

import { useActionState, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ITEM_CATEGORIES } from "@/lib/constants";
import { createItemAction, type CreateItemState } from "./actions";

const initialState: CreateItemState = {};

export function NewItemForm({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(createItemAction, initialState);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `items/${userId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("findback-media")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;

      const { data } = supabase.storage.from("findback-media").getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
    } catch {
      setUploadError("사진을 업로드하지 못했어요. 사진 없이도 등록할 수 있어요.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-[26px] border border-line bg-surface p-6 shadow-sm">
      <input type="hidden" name="photoUrl" value={photoUrl} />

      <div>
        <label className="mb-2 block text-sm font-bold text-ink">사진 (선택)</label>
        <label className="flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-[24px] border border-dashed border-brand-line bg-brand-soft transition hover:border-brand">
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="미리보기" className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl">📷</span>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </label>
        {uploading && <p className="mt-1 text-xs text-ink-soft">업로드 중...</p>}
        {uploadError && <p className="mt-1 text-xs font-semibold text-rose-700">{uploadError}</p>}
      </div>

      <label className="flex flex-col gap-2 text-sm font-bold text-ink">
        물건 이름
        <input
          name="name"
          required
          maxLength={60}
          placeholder="예: 하늘색 우산"
          className="fb-input"
        />
        {state.fieldErrors?.name && (
          <span className="text-xs font-semibold text-rose-700">{state.fieldErrors.name}</span>
        )}
      </label>

      <label className="flex flex-col gap-2 text-sm font-bold text-ink">
        카테고리
        <select
          name="category"
          required
          defaultValue=""
          className="fb-input"
        >
          <option value="" disabled>
            선택해주세요
          </option>
          {ITEM_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {state.fieldErrors?.category && (
          <span className="text-xs font-semibold text-rose-700">{state.fieldErrors.category}</span>
        )}
      </label>

      <label className="flex flex-col gap-2 text-sm font-bold text-ink">
        식별용 설명 (선택)
        <textarea
          name="description"
          maxLength={300}
          rows={3}
          placeholder="예: 손잡이에 스티커가 붙어있어요"
          className="fb-input"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-bold text-ink">
        선호하는 반환 안내 (선택)
        <textarea
          name="returnInstructions"
          maxLength={200}
          rows={2}
          placeholder="예: 학생회관 1층 안내데스크에 맡겨주세요"
          className="fb-input"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-bold text-ink">
        보상금 (선택, 데모용)
        <input
          name="rewardAmount"
          type="number"
          min={0}
          max={10_000_000}
          step={1000}
          placeholder="예: 20000"
          className="fb-input"
        />
        <span className="text-xs font-normal text-ink-soft">
          습득자 페이지에 보여줄 보상금이에요. 실제 결제는 연동되어 있지 않은 데모 기능이에요.
        </span>
        {state.fieldErrors?.rewardAmount && (
          <span className="text-xs font-semibold text-rose-700">{state.fieldErrors.rewardAmount}</span>
        )}
      </label>

      {state.error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || uploading}
        className="rounded-2xl bg-brand px-6 py-4 text-base font-bold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-deep active:scale-[0.98] disabled:opacity-60"
      >
        {isPending ? "등록 중..." : "물건 등록하기"}
      </button>
    </form>
  );
}
