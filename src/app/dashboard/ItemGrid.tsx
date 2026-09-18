"use client";

import { useState } from "react";
import Link from "next/link";
import { ItemCard } from "@/components/ItemCard";
import { Mascot } from "@/components/Mascot";
import type { ItemStatus } from "@/lib/constants";

export type DashboardItem = {
  id: string;
  name: string;
  category: string;
  status: ItemStatus;
  photoUrl: string | null;
  reportCount: number;
};

export function ItemGrid({ initialItems }: { initialItems: DashboardItem[] }) {
  const [items, setItems] = useState(initialItems);

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-sky bg-white p-10 text-center">
        <Mascot size={96} />
        <p className="font-bold text-navy">아직 등록된 물건이 없어요</p>
        <p className="text-sm text-navy-soft">첫 물건을 등록하고 QR 태그를 만들어보세요!</p>
        <Link
          href="/items/new"
          className="mt-2 inline-block rounded-xl bg-coral px-5 py-3 text-sm font-bold text-white"
        >
          첫 물건 등록하기
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          id={item.id}
          name={item.name}
          category={item.category}
          status={item.status}
          photoUrl={item.photoUrl}
          reportCount={item.reportCount}
          onDeleted={() => handleDeleted(item.id)}
        />
      ))}
    </div>
  );
}
