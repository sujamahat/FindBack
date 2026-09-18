import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ItemCard } from "@/components/ItemCard";
import { ProfileBanner } from "@/components/ProfileBanner";
import { Mascot } from "@/components/Mascot";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ItemStatus } from "@/lib/constants";

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

        <h1 className="mb-4 mt-8 text-xl font-bold text-navy">내 물건</h1>

        {!items || items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-sky bg-white p-10 text-center">
            <Mascot size={96} />
            <p className="font-bold text-navy">아직 등록된 물건이 없어요</p>
            <p className="text-sm text-navy-soft">
              첫 물건을 등록하고 QR 태그를 만들어보세요!
            </p>
            <Link
              href="/items/new"
              className="mt-2 inline-block rounded-xl bg-coral px-5 py-3 text-sm font-bold text-white"
            >
              첫 물건 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                id={item.id}
                name={item.name}
                category={item.category}
                status={item.status as ItemStatus}
                photoUrl={item.photo_url}
                reportCount={item.found_reports?.[0]?.count ?? 0}
              />
            ))}
          </div>
        )}
      </main>

      <div className="no-print sticky bottom-4 z-10 mx-auto flex w-full max-w-4xl justify-center px-6">
        <Link
          href="/items/new"
          className="w-full rounded-2xl bg-coral px-6 py-4 text-center text-base font-bold text-white shadow-lg transition active:scale-[0.98] sm:w-auto sm:px-10"
        >
          + 새 물건 등록하기
        </Link>
      </div>
    </>
  );
}
