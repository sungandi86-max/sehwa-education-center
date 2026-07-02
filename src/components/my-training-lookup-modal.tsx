"use client";

import { useState } from "react";
import type { MyTrainingLookupResult, MyTrainingItemStatus } from "@/lib/my-training-lookup";

const statusClassMap: Record<MyTrainingItemStatus, string> = {
  이수완료: "bg-emerald-100 text-emerald-800",
  미이수: "bg-rose-100 text-rose-800",
  승인대기: "bg-amber-100 text-amber-800",
  반려: "bg-rose-100 text-rose-800"
};

export function MyTrainingLookupCard({
  completedCount,
  incompleteCount
}: {
  completedCount: number;
  incompleteCount: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex min-h-56 w-full flex-col rounded-md border border-slate-200 bg-white p-5 text-left shadow-soft transition hover:border-brand-200 hover:bg-brand-50"
      >
        <p className="text-sm font-bold text-teal-700">내 이수 확인</p>
        <h3 className="mt-2 text-xl font-bold text-slateblue-900">내 이수 확인</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">2026년 교직원 교육 이수 현황을 확인합니다.</p>
        <div className="mt-auto w-full border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-slateblue-900">
              이수 {completedCount}건 / 미이수 {incompleteCount}건
            </p>
            <span className="rounded-md bg-slateblue-900 px-4 py-2 text-sm font-semibold text-white group-hover:bg-brand-700">
              확인하기
            </span>
          </div>
        </div>
      </button>
      {isOpen ? <MyTrainingLookupModal onClose={() => setIsOpen(false)} /> : null}
    </>
  );
}

function MyTrainingLookupModal({ onClose }: { onClose: () => void }) {
  const [staffName, setStaffName] = useState("");
  const [department, setDepartment] = useState("");
  const [result, setResult] = useState<MyTrainingLookupResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submitLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/my-training", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          staffName,
          department: department || undefined,
          year: 2026
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "조회 중 오류가 발생했습니다.");
        return;
      }

      setResult(payload as MyTrainingLookupResult);

      if ((payload as MyTrainingLookupResult).needsDepartment) {
        setError("동명이인이 있습니다. 소속/부서를 선택한 뒤 다시 조회해주세요.");
      }
    } catch {
      setError("조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const visibleResult = result?.staff ? result : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slateblue-950/45 px-4 py-6">
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-md border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-sm font-bold text-teal-700">내 이수 확인</p>
          <h2 className="mt-1 text-xl font-bold text-slateblue-900">성명으로 이수 현황 조회</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">로그인 없이 성명으로 조회합니다. 동명이인인 경우에만 소속/부서를 선택합니다.</p>
        </div>

        <form onSubmit={submitLookup} className="space-y-4 px-5 py-5">
          <div className="grid gap-3 md:grid-cols-[1fr_0.9fr]">
            <label className="block">
              <span className="text-sm font-semibold text-slateblue-900">성명 *</span>
              <input
                value={staffName}
                onChange={(event) => {
                  setStaffName(event.target.value);
                  setError("");
                }}
                required
                className="focus-ring mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="예: 최민서"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slateblue-900">소속/부서</span>
              {result?.needsDepartment && result.departments?.length ? (
                <select
                  value={department}
                  onChange={(event) => {
                    setDepartment(event.target.value);
                    setError("");
                  }}
                  className="focus-ring mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">선택해주세요</option>
                  {result.departments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className="focus-ring mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="선택 입력"
                />
              )}
            </label>
          </div>

          {error ? <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-md border border-slateblue-900 bg-white px-4 py-2 text-sm font-semibold text-slateblue-900 hover:bg-brand-50"
            >
              닫기
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="focus-ring rounded-md bg-slateblue-900 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? "조회 중" : "조회하기"}
            </button>
          </div>
        </form>

        {visibleResult ? (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-5">
            <div className="mb-4">
              <p className="font-bold text-slateblue-900">
                {visibleResult.staff?.staffName} · {visibleResult.staff?.department}
              </p>
              <p className="mt-1 text-sm text-slate-500">교육이력과 이수증 제출 상태를 함께 반영한 결과입니다.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <SummaryBox label="이수 완료" value={visibleResult.summary.completedCount} />
              <SummaryBox label="미이수" value={visibleResult.summary.incompleteCount} />
              <SummaryBox label="승인대기" value={visibleResult.summary.pendingCount} />
              <SummaryBox label="반려" value={visibleResult.summary.rejectedCount} />
            </div>

            <div className="mt-4 space-y-3">
              {visibleResult.items.map((item) => (
                <div key={item.eventId} className="rounded-md border border-slate-200 bg-white px-4 py-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-bold text-slateblue-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.department}
                        {item.completedAt ? ` · ${item.completedAt}` : ""}
                      </p>
                    </div>
                    <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassMap[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                  {item.rejectReason ? <p className="mt-2 rounded-md bg-rose-50 p-2 text-sm text-rose-700">반려 사유: {item.rejectReason}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slateblue-900">{value}</p>
    </div>
  );
}
