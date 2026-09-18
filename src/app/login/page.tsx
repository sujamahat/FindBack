import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <Mascot size={64} />
        <h1 className="text-xl font-bold text-navy">FindBack 로그인</h1>
        <p className="text-sm text-navy-soft">내 물건을 등록하고 관리하려면 로그인해주세요.</p>
      </div>
      <LoginForm next={next ?? "/dashboard"} />
      <Link href="/" className="text-center text-sm text-navy-soft underline">
        홈으로 돌아가기
      </Link>
    </main>
  );
}
