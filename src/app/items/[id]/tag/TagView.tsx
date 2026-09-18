"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Mascot } from "@/components/Mascot";

export function TagView({
  itemName,
  publicUrl,
  recoveryCode,
}: {
  itemName: string;
  publicUrl: string;
  recoveryCode: string;
}) {
  const qrRef = useRef<HTMLDivElement>(null);

  function handleDownload() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `findback-qr-${recoveryCode}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="no-print flex gap-3">
        <button
          onClick={() => window.print()}
          className="rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-deep"
        >
          인쇄하기
        </button>
        <button
          onClick={handleDownload}
          className="rounded-xl border border-brand-line px-5 py-3 text-sm font-bold text-brand-deep transition hover:bg-brand-soft"
        >
          태그 다운로드
        </button>
      </div>

      <div id="tag-print-area" className="flex flex-col gap-6 sm:flex-row">
        {/* FRONT */}
        <div className="flex h-[65mm] w-[45mm] flex-col items-center justify-between rounded-2xl border-2 border-[#1c2b4a] bg-cream p-3 text-center shadow-sm print:shadow-none">
          {/* keychain hole safe area */}
          <div className="h-3 w-3 rounded-full border-2 border-[#1c2b4a]" />
          <Mascot size={56} />
          <p className="text-[10px] font-extrabold leading-tight text-[#1c2b4a]">FindBack</p>
          <p className="text-[9px] font-bold leading-tight text-[#1c2b4a]">길을 잃었어요</p>
          <p className="text-[9px] font-bold leading-tight text-[#ff6f5e]">주인에게 알려주세요!</p>
          <div className="h-1" />
        </div>

        {/* BACK */}
        <div className="flex h-[65mm] w-[45mm] flex-col items-center justify-between rounded-2xl border-2 border-[#1c2b4a] bg-white p-2 text-center shadow-sm print:shadow-none">
          <div className="h-3 w-3 rounded-full border-2 border-[#1c2b4a]" />
          <p className="text-[8px] font-bold leading-tight text-[#1c2b4a]">분실물을 발견하셨나요?</p>
          <div ref={qrRef} className="rounded-lg bg-white p-1">
            <QRCodeCanvas value={publicUrl} size={110} level="M" includeMargin />
          </div>
          <p className="text-[7px] leading-tight text-[#33456b]">
            개인정보 없이 주인에게 알릴 수 있어요
          </p>
          <p className="text-[6px] leading-tight text-[#33456b]">findback.app</p>
          <p className="text-xs font-extrabold tracking-widest text-[#1c2b4a]">{recoveryCode}</p>
          <p className="text-[6px] leading-tight text-[#33456b]">
            로그인 필요 없음 · 위치 자동수집 없음
          </p>
        </div>
      </div>

      <p className="no-print max-w-xs text-center text-xs text-ink-soft">
        “{itemName}” 태그예요. 인쇄한 뒤 점선을 따라 잘라 키링에 끼워주세요.
      </p>

      <style>{`
        @media print {
          @page { size: auto; margin: 8mm; }
          body * { visibility: hidden; }
          #tag-print-area, #tag-print-area * { visibility: visible; }
          #tag-print-area { position: absolute; left: 0; top: 0; }
        }
      `}</style>
    </div>
  );
}
