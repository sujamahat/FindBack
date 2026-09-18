import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ProfileBanner } from "@/components/ProfileBanner";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function MyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/mypage");

  const { data: items } = await supabase.from("items").select("status");
  const total = items?.length ?? 0;

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="mb-4 text-[17px] font-black tracking-tight text-ink">마이페이지</h1>
        <ProfileBanner
          email={user.email ?? ""}
          uid={user.id}
          total={total}
          lostCount={items?.filter((i) => i.status === "lost").length ?? 0}
          returnedCount={items?.filter((i) => i.status === "returned").length ?? 0}
        />
      </main>
    </>
  );
}
