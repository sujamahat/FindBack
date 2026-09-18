"use client";

import { useState } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  emoji: string;
};

const PRODUCTS: Product[] = [
  {
    id: "metal-keychain",
    name: "프리미엄 메탈 키링",
    price: 9900,
    description: "튼튼한 메탈 소재의 QR 키링. 프린트 태그보다 오래 사용할 수 있어요.",
    emoji: "🔑",
  },
  {
    id: "epoxy-sticker-3pack",
    name: "방수 에폭시 스티커 3팩",
    price: 5900,
    description: "물병, 우산 등에 바로 붙이는 방수 스티커 3장 세트.",
    emoji: "💧",
  },
  {
    id: "leather-luggage-tag",
    name: "가죽 러기지 태그",
    price: 14900,
    description: "가방과 캐리어에 어울리는 가죽 소재 태그.",
    emoji: "🧳",
  },
];

type CheckoutStep = "processing" | "success";

function generateOrderId(): string {
  return `FB-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Demo storefront: no cart, no real inventory, no payment gateway. Clicking
 * "구매하기" simulates a Toss/KakaoPay-style result screen entirely on the
 * client for the judging demo — nothing here charges a card or persists an
 * order anywhere.
 */
export function StoreGrid() {
  const [selected, setSelected] = useState<Product | null>(null);
  const [step, setStep] = useState<CheckoutStep>("processing");
  const [orderId, setOrderId] = useState("");

  function openCheckout(product: Product) {
    setSelected(product);
    setOrderId(generateOrderId());
    setStep("processing");
    setTimeout(() => setStep("success"), 900);
  }

  function closeModal() {
    setSelected(null);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="flex flex-col gap-3 rounded-2xl border border-sky bg-white p-5 shadow-sm"
          >
            <div className="flex h-28 items-center justify-center rounded-xl bg-sky/40 text-5xl">
              {product.emoji}
            </div>
            <p className="font-bold text-navy">{product.name}</p>
            <p className="text-xs text-navy-soft">{product.description}</p>
            <p className="text-lg font-extrabold text-navy">
              ₩{product.price.toLocaleString("ko-KR")}
            </p>
            <button
              type="button"
              onClick={() => openCheckout(product)}
              className="mt-auto rounded-xl bg-coral px-4 py-3 text-sm font-bold text-white"
            >
              구매하기
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 px-6"
          onClick={() => step === "success" && closeModal()}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {step === "processing" ? (
              <>
                <p className="text-3xl">⏳</p>
                <p className="mt-3 font-bold text-navy">결제 처리 중...</p>
                <p className="mt-1 text-xs text-navy-soft">잠시만 기다려주세요.</p>
              </>
            ) : (
              <>
                <p className="text-3xl">✅</p>
                <p className="mt-3 font-bold text-navy">결제가 완료되었습니다</p>
                <div className="mt-4 rounded-xl bg-sky/30 p-4 text-left text-sm text-navy">
                  <p className="flex justify-between">
                    <span>주문번호</span>
                    <span className="font-semibold">{orderId}</span>
                  </p>
                  <p className="mt-1 flex justify-between">
                    <span>상품</span>
                    <span className="font-semibold">{selected.name}</span>
                  </p>
                  <p className="mt-1 flex justify-between">
                    <span>결제 금액</span>
                    <span className="font-semibold">
                      ₩{selected.price.toLocaleString("ko-KR")}
                    </span>
                  </p>
                  <p className="mt-1 flex justify-between">
                    <span>결제 수단</span>
                    <span className="font-semibold">토스페이 · 카카오페이 스타일 (데모)</span>
                  </p>
                </div>
                <p className="mt-3 text-xs text-navy-soft">
                  데모 결제 화면이에요. 토스/카카오페이 등 실제 결제사와 연동되어 있지 않으며,
                  실제 결제는 이루어지지 않았습니다.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-4 w-full rounded-xl bg-navy px-4 py-3 text-sm font-bold text-cream"
                >
                  확인
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
