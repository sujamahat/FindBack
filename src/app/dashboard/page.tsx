import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ProfileBanner } from "@/components/ProfileBanner";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ItemStatus } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ItemGrid, type DashboardItem } from "./ItemGrid";

const DEMO_ITEMS: DashboardItem[] = [
  { id: "demo-1", name: "에어팟 프로 2", category: "전자기기", status: "safe", photoUrl: null, reportCount: 0 },
  { id: "demo-2", name: "자동차 키 (제네시스)", category: "열쇠", status: "lost", photoUrl: null, reportCount: 2 },
  { id: "demo-3", name: "하늘색 우산", category: "우산", status: "returned", photoUrl: null, reportCount: 1 },
];

/** Shown when Supabase env vars are missing, so the UI is still browsable locally. */
function DemoDashboard() {
  return (
    <>
      <AppHeader email={null} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6 py-8 pb-28">
        <p className="mb-4 rounded-2xl border border-brand-line bg-brand-soft px-4 py-3 text-sm font-semibold text-brand-deep">
          데모 모드 — Supabase 환경 변수가 설정되지 않아 예시 데이터를 보여주고 있어요. .env.example을
          참고해 .env.local을 만들면 실제 데이터로 전환돼요.
        </p>
        <ProfileBanner
          email="demo@findback.app"
          total={DEMO_ITEMS.length}
          lostCount={DEMO_ITEMS.filter((i) => i.status === "lost").length}
          returnedCount={DEMO_ITEMS.filter((i) => i.status === "returned").length}
        />
        <ItemGrid initialItems={DEMO_ITEMS} readOnly />
      </main>
    </>
  );
}

export default async function DashboardPage() {
  if (!isSupabaseConfigured) return <DemoDashboard />;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  // No .limit(): every item owned by this user comes back. RLS on `items`
  // (owner_id = auth.uid()) is what actually scopes this to the signed-in
  // owner — the query itself doesn't filter by owner_id explicitly.
  const { data: items } = await supabase
    .from("items")
    .select("id, name, category, status, photo_url, found_reports(count)")
    .order("created_at", { ascending: false });

  const total = items?.length ?? 0;
  const lostCount = items?.filter((item) => item.status === "lost").length ?? 0;
  const returnedCount = items?.filter((item) => item.status === "returned").length ?? 0;

  const dashboardItems: DashboardItem[] = (items ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    status: item.status as ItemStatus,
    photoUrl: item.photo_url,
    reportCount: item.found_reports?.[0]?.count ?? 0,
  }));

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6 py-8 pb-28">
        <ProfileBanner
          email={user.email ?? ""}
          total={total}
          lostCount={lostCount}
          returnedCount={returnedCount}
        />

        <ItemGrid initialItems={dashboardItems} />
      </main>

      <div className="no-print sticky bottom-4 z-10 mx-auto hidden md:flex w-full max-w-4xl justify-center px-4 sm:px-6">
        <Link
          href="/items/new"
          className="w-full rounded-2xl bg-brand px-4 sm:px-6 py-4 text-center text-base font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-deep active:scale-[0.98] sm:w-auto sm:px-10"
        >
          + 새 물건 등록하기
        </Link>
      </div>
    </>
  );
}
