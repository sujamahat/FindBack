import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";
import { RecoverForm } from "./RecoverForm";

export default function RecoverPage() {
  return (
    <>
    <PublicHeader />
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft ring-4 ring-brand/30" aria-hidden>
          <span className="h-3.5 w-3.5 rounded-full bg-brand" />
        </span>
        <h1 className="text-[22px] font-black tracking-tight text-ink">습득물 코드 입력하기</h1>
        <p className="text-sm text-ink-soft">
          태그에 QR이 스캔되지 않는다면, 아래에 적힌 짧은 코드를 입력해주세요.
        </p>
      </div>
      <RecoverForm />
      <Link href="/" className="text-center text-sm font-semibold text-brand-deep underline">
        홈으로 돌아가기
      </Link>
    </main>
    </>
  );
}
