"use client";

import { useState } from "react";
import { RETURN_METHODS, RETURN_METHOD_LABELS, type ReturnMethod } from "@/lib/constants";

export function FinderForm({ publicToken }: { publicToken: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [returnMethod, setReturnMethod] = useState<ReturnMethod>("location_only");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    setFieldErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("publicToken", publicToken);
    formData.set("privacyAck", formData.get("privacyAck") === "on" ? "true" : "false");

    try {
      const res = await fetch("/api/reports", { method: "POST", body: formData });
      const body = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(body.error ?? "제보를 보내지 못했어요.");
        setFieldErrors(body.fieldErrors ?? {});
        return;
      }

      setStatus("done");
    } catch {
      setStatus("error");
      setError("네트워크 오류가 발생했어요. 다시 시도해주세요.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-sky bg-white p-6 text-center">
        <p className="text-3xl">🙏</p>
        <p className="mt-2 font-bold text-navy">
          제보가 전달되었습니다. 물건을 안전하게 보관 장소에 맡겨주셔서 감사합니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Honeypot — hidden from real users via CSS, bots tend to fill every field. */}
      <div className="hidden" aria-hidden="true">
        <label>
          웹사이트
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
        발견 장소 또는 건물
        <input
          name="locationText"
          required
          maxLength={200}
          placeholder="예: 중앙도서관 2층 열람실"
          className="rounded-xl border border-sky bg-white px-4 py-3 text-base text-navy outline-none focus:border-navy"
        />
        {fieldErrors.locationText && (
          <span className="text-xs font-semibold text-coral">{fieldErrors.locationText}</span>
        )}
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-navy">물건을 어떻게 하셨나요?</legend>
        {RETURN_METHODS.map((method) => (
          <label
            key={method}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
              returnMethod === method ? "border-navy bg-sky/40" : "border-sky bg-white"
            }`}
          >
            <input
              type="radio"
              name="returnMethod"
              value={method}
              checked={returnMethod === method}
              onChange={() => setReturnMethod(method)}
              className="h-4 w-4"
            />
            {RETURN_METHOD_LABELS[method]}
          </label>
        ))}
        {fieldErrors.returnMethod && (
          <span className="text-xs font-semibold text-coral">{fieldErrors.returnMethod}</span>
        )}
      </fieldset>

      {returnMethod === "other" && (
        <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
          맡긴 장소
          <input
            name="customReturnPlace"
            maxLength={200}
            placeholder="예: 학생회관 1층 분실물함"
            className="rounded-xl border border-sky bg-white px-4 py-3 text-base text-navy outline-none focus:border-navy"
          />
          {fieldErrors.customReturnPlace && (
            <span className="text-xs font-semibold text-coral">
              {fieldErrors.customReturnPlace}
            </span>
          )}
        </label>
      )}

      <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
        전하고 싶은 말 (선택)
        <textarea
          name="message"
          maxLength={500}
          rows={3}
          placeholder="주인에게 남기고 싶은 메시지"
          className="rounded-xl border border-sky bg-white px-4 py-3 text-base text-navy outline-none focus:border-navy"
        />
      </label>

      <div>
        <label className="mb-2 block text-sm font-semibold text-navy">사진 (선택)</label>
        <label className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-sky bg-white">
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="미리보기" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl">📷</span>
          )}
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPhotoPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
        </label>
      </div>

      <label className="flex items-start gap-3 rounded-xl bg-sky/40 p-4 text-sm text-navy">
        <input type="checkbox" name="privacyAck" required className="mt-1 h-4 w-4" />
        <span>
          이 페이지는 연락처, 카메라 또는 위치 정보에 자동으로 접근하지 않습니다. 작성한 정보만
          물건의 주인에게 전달됩니다. 이에 동의합니다.
        </span>
      </label>
      {fieldErrors.privacyAck && (
        <span className="-mt-3 text-xs font-semibold text-coral">{fieldErrors.privacyAck}</span>
      )}

      {error && (
        <p className="rounded-xl bg-coral-soft px-4 py-3 text-sm font-semibold text-coral">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-2xl bg-coral px-6 py-4 text-base font-bold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60"
      >
        {status === "sending" ? "보내는 중..." : "제보 보내기"}
      </button>
    </form>
  );
}
