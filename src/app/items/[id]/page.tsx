import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SafeImage } from "@/components/SafeImage";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { AnonymousChat } from "@/components/AnonymousChat";
import { DeleteItemButton } from "@/components/DeleteItemButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ItemStatus } from "@/lib/constants";
import { StatusActions } from "./StatusActions";
import { RealtimeReports } from "./RealtimeReports";
import { RewardEditor } from "./RewardEditor";

type TimelineEntry = { label: string; at: string; emoji: string };

export default async function ItemDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/items/${id}`);
  }

  const { data: item } = await supabase.from("items").select("*").eq("id", id).single();

  if (!item) {
    notFound();
  }

  const [{ data: reports }, { data: events }] = await Promise.all([
    supabase
      .from("found_reports")
      .select("*")
      .eq("item_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("item_status_events")
      .select("*")
      .eq("item_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const timeline: TimelineEntry[] = [
    { label: "물건 등록됨", at: item.created_at, emoji: "🧾" },
    ...(events ?? []).map((e) => ({
      label: e.event_type === "lost" ? "분실 처리됨" : "반환 완료",
      at: e.created_at,
      emoji: e.event_type === "lost" ? "😢" : "🎉",
    })),
    ...(reports ?? []).map((r) => ({
      label: "발견 제보 받음",
      at: r.created_at,
      emoji: "📩",
    })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        {created && (
          <div className="mb-6 rounded-[24px] bg-brand-soft p-4 text-sm font-semibold text-ink">
            물건이 등록되었어요! QR 태그를 인쇄해서 물건에 붙여보세요.
          </div>
        )}

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-[24px] bg-brand-soft">
            <SafeImage
              src={item.photo_url}
              alt={item.name}
              className="h-full w-full object-cover"
              fallback={<div className="flex h-full w-full items-center justify-center text-4xl">📦</div>}
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-ink">{item.name}</h1>
              <StatusBadge status={item.status as ItemStatus} />
            </div>
            <p className="text-sm text-ink-soft">{item.category}</p>
            {item.description && <p className="text-sm text-ink">{item.description}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                href={`/items/${item.id}/tag`}
                className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-deep"
              >
                QR 태그 보기 / 인쇄
              </Link>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusActions itemId={item.id} status={item.status as ItemStatus} />
              <DeleteItemButton itemId={item.id} redirectTo="/dashboard" variant="icon" />
            </div>
          </div>
        </div>

        <section className="mt-6">
          <RewardEditor itemId={item.id} initialAmount={item.reward_amount} />
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold text-ink">타임라인</h2>
          <ol className="flex flex-col gap-3 border-l-2 border-brand-line pl-4">
            {timeline.map((entry, i) => (
              <li key={i} className="text-sm">
                <span className="mr-2">{entry.emoji}</span>
                <span className="font-semibold text-ink">{entry.label}</span>{" "}
                <span className="text-ink-soft">
                  {new Date(entry.at).toLocaleString("ko-KR")}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold text-ink">발견 제보</h2>
          <RealtimeReports itemId={item.id} initialReports={reports ?? []} />
        </section>

        <section className="mt-10">
          <AnonymousChat viewerRole="owner" />
        </section>
      </main>
    </>
  );
}
