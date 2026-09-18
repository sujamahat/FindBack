import Link from "next/link";
import { Mascot } from "@/components/Mascot";

const STEPS = [
  { title: "물건 등록", desc: "우산, 물병, 가방 등 물건 정보를 간단히 등록해요." },
  { title: "QR 태그 부착", desc: "생성된 QR 태그를 인쇄해서 물건에 붙여요." },
  { title: "발견 제보 받기", desc: "습득자가 QR을 스캔해 위치를 알려주면 대시보드로 도착해요." },
];

const PRIVACY_POINTS = [
  "앱 설치 필요 없음",
  "습득자 로그인 필요 없음",
  "주인의 개인정보 공개 없음",
  "위치 자동수집 없음",
];

export default function LandingPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pt-16 pb-10 text-center">
        <Mascot size={112} />
        <h1 className="text-2xl font-bold leading-snug text-navy sm:text-3xl">
          QR 키링으로 분실물을
          <br />더 안전하고 빠르게 돌려받으세요.
        </h1>
        <p className="text-navy-soft">
          FindBack은 물리적인 QR 키링과 웹을 연결해, 개인정보 노출 없이 분실물을
          되찾을 수 있도록 도와주는 서비스예요.
        </p>
        <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/items/new"
            className="flex-1 rounded-2xl bg-coral px-6 py-4 text-center text-base font-bold text-white shadow-sm transition active:scale-[0.98]"
          >
            내 물건 등록하기
          </Link>
          <Link
            href="/recover"
            className="flex-1 rounded-2xl border-2 border-navy bg-white px-6 py-4 text-center text-base font-bold text-navy transition active:scale-[0.98]"
          >
            습득물 코드 입력하기
          </Link>
        </div>
        <Link href="/store" className="text-sm font-semibold text-navy-soft underline">
          QR 태그 구매 →
        </Link>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-10">
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="rounded-2xl border border-sky bg-white p-5 text-left shadow-sm"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-sky text-sm font-bold text-navy">
                {i + 1}
              </div>
              <p className="font-bold text-navy">{step.title}</p>
              <p className="mt-1 text-sm text-navy-soft">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="rounded-2xl bg-navy p-6 text-cream">
          <p className="mb-4 font-bold">FindBack이 지키는 원칙</p>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {PRIVACY_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span className="text-coral">●</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
