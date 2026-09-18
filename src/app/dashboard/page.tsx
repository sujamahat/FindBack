import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ItemCard } from "@/components/ItemCard";
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

  const { data: items } = await supabase
    .from("items")
    .select("id, name, category, status, photo_url, found_reports(count)")
    .order("created_at", { ascending: false });

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-navy">내 물건</h1>
          <Link
            href="/items/new"
            className="rounded-xl bg-coral px-4 py-2 text-sm font-bold text-white"
          >
            + 물건 등록하기
          </Link>
        </div>

        {!items || items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sky bg-white p-10 text-center">
            <p className="text-navy-soft">아직 등록된 물건이 없어요.</p>
            <Link
              href="/items/new"
              className="mt-4 inline-block rounded-xl bg-navy px-4 py-2 text-sm font-bold text-cream"
            >
              첫 물건 등록하기
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
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
    </>
  );
}
