import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import { RecoverForm } from "./RecoverForm";

export default function RecoverPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <Mascot size={64} />
        <h1 className="text-xl font-bold text-navy">습득물 코드 입력하기</h1>
        <p className="text-sm text-navy-soft">
          태그에 QR이 스캔되지 않는다면, 아래에 적힌 짧은 코드를 입력해주세요.
        </p>
      </div>
      <RecoverForm />
      <Link href="/" className="text-center text-sm text-navy-soft underline">
        홈으로 돌아가기
      </Link>
    </main>
  );
}
