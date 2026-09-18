import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ItemStatus } from "@/lib/constants";

/** Chats live on each item (anonymous finder ↔ owner), so this lists items with finder reports. */
export default async function ChatPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/chat");

  const { data: items } = await supabase
    .from("items")
    .select("id, name, status, found_reports(count)")
    .order("updated_at", { ascending: false });

  const withReports = (items ?? []).filter((item) => (item.found_reports?.[0]?.count ?? 0) > 0);

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="mb-4 text-[17px] font-black tracking-tight text-ink">채팅</h1>
        {withReports.length === 0 ? (
          <p className="rounded-2xl border border-line bg-surface px-4 py-8 text-center text-sm text-ink-soft">
            아직 발견 제보가 도착한 물건이 없어요.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {withReports.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/items/${item.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 transition hover:border-brand-line"
                >
                  <span className="min-w-0 truncate text-sm font-bold text-ink">{item.name}</span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-ink-soft">
                    제보 {item.found_reports?.[0]?.count}건
                    <StatusBadge status={item.status as ItemStatus} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
