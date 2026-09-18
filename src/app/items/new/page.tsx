import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NewItemForm } from "./NewItemForm";

export default async function NewItemPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/items/new");
  }

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-md flex-1 px-6 py-8">
        <h1 className="mb-1 text-[22px] font-black tracking-tight text-ink">물건 등록하기</h1>
        <p className="mb-6 text-sm text-ink-soft">QR 태그에 연결될 물건 정보를 입력해주세요.</p>
        <NewItemForm userId={user.id} />
      </main>
    </>
  );
}
