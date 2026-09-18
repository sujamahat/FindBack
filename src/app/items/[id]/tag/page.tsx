import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppUrl } from "@/lib/supabase/env";
import { TagView } from "./TagView";

export default async function TagPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/items/${id}/tag`);
  }

  const { data: item } = await supabase
    .from("items")
    .select("name, public_token, recovery_code")
    .eq("id", id)
    .single();

  if (!item) {
    notFound();
  }

  const publicUrl = `${getAppUrl()}/f/${item.public_token}`;

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <Link href={`/items/${id}`} className="no-print mb-4 inline-block text-sm text-navy-soft underline">
          ← 물건으로 돌아가기
        </Link>
        <h1 className="no-print mb-6 text-xl font-bold text-navy">QR 태그</h1>
        <TagView itemName={item.name} publicUrl={publicUrl} recoveryCode={item.recovery_code} />
      </main>
    </>
  );
}
