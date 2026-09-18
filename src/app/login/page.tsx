import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <>
    <PublicHeader />
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft ring-4 ring-brand/30" aria-hidden>
          <span className="h-3.5 w-3.5 rounded-full bg-brand" />
        </span>
        <h1 className="text-[22px] font-black tracking-tight text-ink">FindBack 로그인 · 회원가입</h1>
        <p className="text-sm text-ink-soft">
          내 물건을 등록하고 관리하려면 로그인하거나 새 계정을 만들어주세요. 비밀번호 없이
          이메일 매직링크로 진행돼요.
        </p>
      </div>
      <LoginForm next={next ?? "/dashboard"} />
      <Link href="/" className="text-center text-sm font-semibold text-brand-deep underline">
        홈으로 돌아가기
      </Link>
    </main>
    </>
  );
}
