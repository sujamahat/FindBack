import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { AnonymousChat } from "@/components/AnonymousChat";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { toPublicItemView } from "@/lib/publicItem";
import type { ItemStatus } from "@/lib/constants";
import { FinderForm } from "./FinderForm";
import { RewardBanner } from "./RewardBanner";

export default async function FinderPage({
  params,
}: {
  params: Promise<{ publicToken: string }>;
}) {
  const { publicToken } = await params;
  const admin = createSupabaseAdminClient();

  const { data: item } = await admin
    .from("items")
    .select("*")
    .eq("public_token", publicToken)
    .single();

  if (!item) {
    notFound();
  }

  const publicItem = toPublicItemView(item);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-6 py-8">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-brand/30" aria-hidden />
          <span className="text-[17px] font-black tracking-tight text-ink">FindBack</span>
        </div>
        <p className="text-sm font-semibold text-ink-soft">분실물 제보</p>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="rounded-full border border-brand-line bg-brand-soft px-3 py-1 text-xs font-bold text-brand-deep">
            ✓ 인증된 FindBack 태그
          </span>
          <span className="rounded-full border border-brand-line bg-brand-soft px-3 py-1 text-xs font-bold text-brand-deep">
            🔒 안전한 익명 제보
          </span>
        </div>
      </div>

      <div className="rounded-[24px] border border-line bg-white p-5 shadow-sm">
        <div className="flex gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[18px] bg-brand-soft">
            {publicItem.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={publicItem.photoUrl}
                alt={publicItem.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">📦</div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold text-ink">{publicItem.name}</p>
            <p className="text-xs text-ink-soft">{publicItem.category}</p>
            <StatusBadge status={publicItem.status as ItemStatus} />
          </div>
        </div>
        {publicItem.description && (
          <p className="mt-3 text-sm text-ink">{publicItem.description}</p>
        )}
        {publicItem.returnInstructions && (
          <p className="mt-3 rounded-xl border border-brand-line bg-brand-soft p-3 text-sm text-ink">
            <span className="font-semibold">주인이 남긴 안내:</span> {publicItem.returnInstructions}
          </p>
        )}
      </div>

      {publicItem.rewardAmount != null && <RewardBanner rewardAmount={publicItem.rewardAmount} />}

      <div className="my-6 rounded-[24px] bg-brand-soft border border-brand-line p-4 text-sm text-ink">
        이 페이지는 연락처, 카메라 또는 위치 정보에 자동으로 접근하지 않습니다. 작성한 정보만
        물건의 주인에게 전달됩니다.
      </div>

      <FinderForm publicToken={publicToken} />

      <div className="mt-6">
        <AnonymousChat viewerRole="finder" />
      </div>
    </main>
  );
}
