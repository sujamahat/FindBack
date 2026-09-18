import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ProfileBanner } from "@/components/ProfileBanner";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ItemStatus } from "@/lib/constants";
import { ItemGrid, type DashboardItem } from "./ItemGrid";

export default async function DashboardPage() {
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
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 pb-28">
        <ProfileBanner
          email={user.email ?? ""}
          total={total}
          lostCount={lostCount}
          returnedCount={returnedCount}
        />

        <ItemGrid initialItems={dashboardItems} />
      </main>

      <div className="no-print sticky bottom-4 z-10 mx-auto flex w-full max-w-4xl justify-center px-6">
        <Link
          href="/items/new"
          className="w-full rounded-2xl bg-brand px-6 py-4 text-center text-base font-bold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-deep active:scale-[0.98] sm:w-auto sm:px-10"
        >
          + 새 물건 등록하기
        </Link>
      </div>
    </>
  );
}
