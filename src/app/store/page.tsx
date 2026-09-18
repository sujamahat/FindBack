import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import { StoreGrid } from "./StoreGrid";

export default function StorePage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Mascot size={64} />
        <h1 className="text-xl font-bold text-navy">QR 태그 구매</h1>
        <p className="text-sm text-navy-soft">
          더 튼튼하고 예쁜 FindBack 태그를 만나보세요. 결제는 데모 화면으로 시뮬레이션돼요.
        </p>
      </div>

      <StoreGrid />

      <div className="mt-10 text-center">
        <Link href="/dashboard" className="text-sm text-navy-soft underline">
          대시보드로 돌아가기
        </Link>
      </div>
    </main>
  );
}
