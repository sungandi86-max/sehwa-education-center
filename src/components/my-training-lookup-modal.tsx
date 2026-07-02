"use client";

import { useState } from "react";
import { StaffSessionBanner, useStaffSession, type StaffSession } from "@/components/staff-session-provider";
import type { MyTrainingItemStatus, MyTrainingLookupResult } from "@/lib/my-training-lookup";

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
  const { staff } = useStaffSession();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex min-h-56 w-full flex-col rounded-md border border-slate-200 bg-white p-5 text-left shadow-soft transition hover:border-brand-200 hover:bg-brand-50"
      >
        <p className="text-sm font-bold text-teal-700">내 이수 확인</p>
        <h3 className="mt-2 text-xl font-bold text-slateblue-900">내 이수 확인</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {staff ? `${staff.staffName} 선생님의 2026년 교육 이수 현황을 확인합니다.` : "성명으로 본인 확인 후 2026년 교육 이수 현황을 확인합니다."}
        </p>
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

export function MyTrainingLookupModal({ onClose }: { onClose: () => void }) {
  const { setStaff } = useStaffSession();
  const [staffName, setStaffName] = useState("");
  const [department, setDepartment] = useState("");
  const [matches, setMatches] = useState<StaffSession[]>([]);
  const [result, setResult] = useState<MyTrainingLookupResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadTrainingResult = async (staff: StaffSession) => {
    const response = await fetch("/api/my-training", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        staffName: staff.staffName,
        department: staff.department,
        year: 2026
      })
    });

    const payload = await response.json();

    if (response.ok) {
      setResult(payload as MyTrainingLookupResult);
    }
  };

  const applyStaffSession = async (staff: StaffSession) => {
    setStaff(staff);
    setStaffName(staff.staffName);
    setDepartment(staff.department);
    setMatches([]);
    setError("");
    await loadTrainingResult(staff);
  };

  const submitLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMatches([]);
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/staff/find", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: staffName,
          department: department || undefined
        })
      });

      const payload = (await response.json()) as {
        success?: boolean;
        data?: StaffSession[];
        error?: string;
      };

      if (!response.ok || !payload.success) {
        setError(payload.error ?? "조회 중 오류가 발생했습니다.");
        return;
      }

      const found = payload.data ?? [];

      if (found.length === 0) {
        setError("조회된 교직원이 없습니다. 성명과 소속/부서를 확인해주세요.");
        return;
      }

      if (found.length === 1) {
        await applyStaffSession(found[0]);
        return;
      }

      setMatches(found);
      setError("동명이인이 있습니다. 본인의 소속/부서를 선택해주세요.");
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
          <h2 className="mt-1 text-xl font-bold text-slateblue-900">성명으로 교직원 조회</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">로그인 없이 성명으로 조회합니다. 동명이인은 소속/부서로 구분합니다.</p>
        </div>

        <form onSubmit={submitLookup} className="space-y-4 px-5 py-5">
          <StaffSessionBanner compact />

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
                placeholder="예: 박숙현"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slateblue-900">소속/부서</span>
              <input
                value={department}
                onChange={(event) => {
                  setDepartment(event.target.value);
                  setError("");
                }}
                className="focus-ring mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="동명이인일 때 입력"
              />
            </label>
          </div>

          {error ? <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p> : null}

          {matches.length > 1 ? (
            <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
              {matches.map((member) => (
                <button
                  key={`${member.staffId}-${member.department}`}
                  type="button"
                  onClick={() => applyStaffSession(member)}
                  className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-left hover:border-brand-200 hover:bg-brand-50"
                >
                  <span>
                    <span className="font-bold text-slateblue-900">{member.staffName}</span>
                    <span className="ml-2 text-sm text-slate-500">
                      {member.department}
                      {member.position ? ` · ${member.position}` : ""}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-slateblue-900">선택</span>
                </button>
              ))}
            </div>
          ) : null}

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
                {visibleResult.staff?.staffName} 선생님 · {visibleResult.staff?.department}
              </p>
              <p className="mt-1 text-sm text-slate-500">교직원 조회 정보가 새로고침 전까지 유지됩니다.</p>
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
