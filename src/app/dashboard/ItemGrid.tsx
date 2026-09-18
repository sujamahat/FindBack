"use client";

import { useState } from "react";
import Link from "next/link";
import { ItemCard } from "@/components/ItemCard";
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
  const [filter, setFilter] = useState<"all" | "lost">("all");

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const shown = filter === "lost" ? items.filter((item) => item.status === "lost") : items;

  return (
    <section>
      <div className="mb-3.5 mt-7 flex items-center justify-between gap-3 px-0.5">
        <h1 className="text-[17px] font-black tracking-tight text-ink">내 물건</h1>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full border px-3.5 py-2 text-[11.5px] font-bold transition ${
              filter === "all"
                ? "border-brand bg-brand text-white shadow-sm"
                : "border-line bg-surface text-ink-soft hover:border-brand-line hover:text-brand-deep"
            }`}
          >
            전체
          </button>
          <button
            type="button"
            onClick={() => setFilter("lost")}
            className={`rounded-full border px-3.5 py-2 text-[11.5px] font-bold transition ${
              filter === "lost"
                ? "border-brand bg-brand text-white shadow-sm"
                : "border-line bg-surface text-ink-soft hover:border-rose-200 hover:text-rose-700"
            }`}
          >
            분실중
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((item) => (
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
        <Link
          href="/items/new"
          className="flex min-h-[200px] flex-col items-center justify-center gap-2.5 rounded-[24px] border border-dashed border-brand-line bg-brand-soft transition hover:border-brand"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-line bg-surface text-2xl font-bold text-brand ring-4 ring-brand/30">
            +
          </span>
          <span className="text-xs font-bold text-brand-deep">
            {items.length === 0 ? "첫 물건 등록하기" : "새 물건 등록"}
          </span>
        </Link>
      </div>
    </section>
  );
}
