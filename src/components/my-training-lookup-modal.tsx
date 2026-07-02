"use client";

import { useState } from "react";
import { StaffSessionBanner, useStaffSession, type StaffSession } from "@/components/staff-session-provider";

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
        className="group flex min-h-56 w-full flex-col rounded-[28px] border border-slateblue-100 bg-white p-5 text-left shadow-soft transition hover:border-brand-200 hover:bg-brand-50"
      >
        <p className="text-sm font-bold text-brand-700">내 이수 확인</p>
        <h3 className="mt-2 text-xl font-bold text-brand-900">내 이수현황</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {staff
            ? `${staff.staffName} 선생님의 2026년 교육 이수 현황을 확인합니다.`
            : "성명으로 본인 확인 후 2026년 교육 이수 현황을 확인합니다."}
        </p>
        <div className="mt-auto w-full border-t border-slateblue-100 pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-brand-900">
              이수 {completedCount}건 / 미이수 {incompleteCount}건
            </p>
            <span className="rounded-2xl bg-brand-900 px-4 py-2 text-sm font-semibold text-white group-hover:bg-brand-700">
              확인
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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const applyStaffSession = (selectedStaff: StaffSession) => {
    setStaff(selectedStaff);
    setStaffName("");
    setDepartment("");
    setMatches([]);
    setError("");
    onClose();
  };

  const submitLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMatches([]);
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
        setError("조회된 교직원이 없습니다. 성명과 소속부서를 확인해주세요.");
        return;
      }

      if (found.length === 1) {
        applyStaffSession(found[0]);
        return;
      }

      setMatches(found);
      setError("동명이인이 있습니다. 본인의 소속부서를 선택해주세요.");
    } catch {
      setError("조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slateblue-950/45 px-4 py-6">
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-slateblue-100 bg-white shadow-xl">
        <div className="border-b border-slateblue-100 px-5 py-4">
          <p className="text-sm font-bold text-brand-700">내 이수 확인</p>
          <h2 className="mt-1 text-xl font-bold text-brand-900">성명으로 교직원 조회</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            조회된 교직원 정보가 QR 출석, 이수증 제출, 내 이수현황에 동일하게 사용됩니다.
          </p>
        </div>

        <form onSubmit={submitLookup} className="space-y-4 px-5 py-5">
          <StaffSessionBanner compact />

          <div className="grid gap-3 md:grid-cols-[1fr_0.9fr]">
            <label className="block">
              <span className="text-sm font-semibold text-brand-900">성명 *</span>
              <input
                value={staffName}
                onChange={(event) => {
                  setStaffName(event.target.value);
                  setError("");
                }}
                required
                className="input-soft mt-2 w-full"
                placeholder="예: 박숙현"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-brand-900">소속부서</span>
              <input
                value={department}
                onChange={(event) => {
                  setDepartment(event.target.value);
                  setError("");
                }}
                className="input-soft mt-2 w-full"
                placeholder="동명이인일 때 입력"
              />
            </label>
          </div>

          {error ? <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p> : null}

          {matches.length > 1 ? (
            <div className="space-y-2 rounded-[22px] border border-slateblue-100 bg-slateblue-50/70 p-3">
              {matches.map((member) => (
                <button
                  key={`${member.staffId}-${member.department}`}
                  type="button"
                  onClick={() => applyStaffSession(member)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slateblue-100 bg-white px-4 py-3 text-left hover:border-brand-200 hover:bg-brand-50"
                >
                  <span>
                    <span className="font-bold text-brand-900">{member.staffName}</span>
                    <span className="ml-2 text-sm text-slate-500">
                      {member.department}
                      {member.position ? ` · ${member.position}` : ""}
                      {member.staffId ? ` · ${member.staffId}` : ""}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-brand-900">선택</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              닫기
            </button>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? "조회 중" : "조회하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
