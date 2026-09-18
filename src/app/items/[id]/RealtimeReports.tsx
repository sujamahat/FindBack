"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RETURN_METHOD_LABELS, type ReturnMethod } from "@/lib/constants";

export type ReportRow = {
  id: string;
  location_text: string | null;
  return_method: ReturnMethod;
  custom_return_place: string | null;
  message: string | null;
  photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

// Best-effort deep links for a quick preview — not a maps SDK integration,
// just plain anchors to each service's own coordinate-search URL.
function googleMapsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}
function kakaoMapUrl(lat: number, lng: number) {
  return `https://map.kakao.com/link/map/제보위치,${lat},${lng}`;
}
function naverMapUrl(lat: number, lng: number) {
  return `https://map.naver.com/p/search/${lat},${lng}`;
}

export function RealtimeReports({
  itemId,
  initialReports,
}: {
  itemId: string;
  initialReports: ReportRow[];
}) {
  const [reports, setReports] = useState(initialReports);
  const [lastSeenInitial, setLastSeenInitial] = useState(initialReports);
  const router = useRouter();

  if (initialReports !== lastSeenInitial) {
    setLastSeenInitial(initialReports);
    setReports(initialReports);
  }

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`item-${itemId}-reports`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "found_reports",
          filter: `item_id=eq.${itemId}`,
        },
        (payload) => {
          setReports((prev) => [payload.new as ReportRow, ...prev]);
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, router]);

  if (reports.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-sky bg-surface p-6 text-center text-sm text-navy-soft">
        아직 발견 제보가 없어요. QR 태그를 물건에 붙여두면 여기에 도착해요.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {reports.map((report) => (
        <li key={report.id} className="rounded-2xl border border-sky bg-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-navy-soft">
              {new Date(report.created_at).toLocaleString("ko-KR")}
            </span>
            <span className="rounded-full bg-sky px-2 py-1 text-xs font-bold text-navy">
              {RETURN_METHOD_LABELS[report.return_method]}
            </span>
          </div>
          {report.custom_return_place && (
            <p className="mt-2 text-sm text-navy">
              <span className="font-semibold">맡긴 장소:</span> {report.custom_return_place}
            </p>
          )}
          {report.message && <p className="mt-1 text-sm text-navy-soft">“{report.message}”</p>}

          {(report.location_text || (report.latitude != null && report.longitude != null)) && (
            <div className="mt-2 rounded-xl border border-sky bg-sky/20 p-3">
              <p className="text-xs font-bold text-navy">📍 위치 정보</p>
              {report.location_text && (
                <p className="mt-1 text-sm text-navy">{report.location_text}</p>
              )}
              {report.latitude != null && report.longitude != null && (
                <>
                  <p className="mt-1 text-xs text-navy-soft">
                    좌표: {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a
                      href={googleMapsUrl(report.latitude, report.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-navy px-3 py-1 text-xs font-semibold text-navy"
                    >
                      구글 지도 →
                    </a>
                    <a
                      href={kakaoMapUrl(report.latitude, report.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-navy px-3 py-1 text-xs font-semibold text-navy"
                    >
                      카카오맵 →
                    </a>
                    <a
                      href={naverMapUrl(report.latitude, report.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-navy px-3 py-1 text-xs font-semibold text-navy"
                    >
                      네이버 지도 →
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
          {report.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={report.photo_url}
              alt="제보 사진"
              className="mt-2 h-40 w-full rounded-xl object-cover"
            />
          )}
        </li>
      ))}
    </ul>
  );
}
