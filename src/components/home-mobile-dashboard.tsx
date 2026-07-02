"use client";

import { useEffect, useMemo, useState } from "react";
import { useStaffSession } from "@/components/staff-session-provider";
import type { MyTrainingLookupResult } from "@/lib/my-training-lookup";

const emptySummary = {
  completedCount: 0,
  incompleteCount: 0,
  pendingCount: 0,
  rejectedCount: 0
};

export function HomeHeroKpi() {
  const { staff } = useStaffSession();
  const [result, setResult] = useState<MyTrainingLookupResult | null>(null);
  const [resultStaffId, setResultStaffId] = useState("");

  useEffect(() => {
    if (!staff) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setResultStaffId(staff.staffId);

      fetch("/api/my-training", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          staffId: staff.staffId,
          staffName: staff.staffName,
          department: staff.department,
          year: 2026
        }),
        signal: controller.signal
      })
        .then((response) => response.json())
        .then((payload) => setResult(payload as MyTrainingLookupResult))
        .catch(() => setResult(null));
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [staff]);

  const visibleResult = staff && resultStaffId === staff.staffId ? result : null;
  const summary = visibleResult?.summary ?? emptySummary;
  const total = summary.completedCount + summary.incompleteCount + summary.pendingCount + summary.rejectedCount;
  const rate = total > 0 ? Math.round((summary.completedCount / total) * 100) : 0;
  const strokeDasharray = `${rate} ${100 - rate}`;

  const kpiItems = useMemo(
    () => [
      { label: "이수", value: staff ? summary.completedCount : "-", tone: "text-[#3650D8]" },
      { label: "미이수", value: staff ? summary.incompleteCount : "-", tone: "text-[#FF5A2F]" },
      { label: "제출", value: staff ? summary.pendingCount + summary.rejectedCount : "-", tone: "text-[#18A866]" }
    ],
    [staff, summary.completedCount, summary.incompleteCount, summary.pendingCount, summary.rejectedCount]
  );

  return (
    <section className="grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-stretch md:gap-6">
      <div className="flex min-h-[270px] flex-col justify-center rounded-[30px] bg-transparent px-1 py-2 md:min-h-[300px] md:px-2">
        <p className="text-[2.35rem] font-semibold leading-tight tracking-[-0.01em] text-brand-900 md:text-[3.2rem]">
          안녕하세요,
          <br />
          {staff ? `${staff.staffName} 선생님` : "선생님"} 👋
        </p>
        <p className="mt-7 max-w-md text-[17px] font-medium leading-8 text-slate-600 md:text-lg">
          오늘 필요한 연수 업무를
          <br />
          빠르게 처리하세요.
        </p>
        <p className="mt-4 max-w-md text-[17px] font-medium leading-8 text-brand-900/86 md:text-lg">
          QR 출석, 이수증 제출, 내 이수현황을
          <br />
          한 곳에서 확인합니다.
        </p>
      </div>

      <div className="rounded-[28px] border border-slateblue-100 bg-white/92 p-6 shadow-[0_22px_64px_rgba(23,59,115,0.08),0_6px_18px_rgba(23,59,115,0.035)] md:rounded-[32px] md:p-8">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-lg font-semibold tracking-tight text-brand-900">내 교육 현황</p>
          <span className="rounded-full bg-softpurple-50 px-3 py-1.5 text-xs font-semibold text-[#5E4BE8]">
            상세 보기
          </span>
        </div>

        <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div className="relative mx-auto size-36 shrink-0 md:mx-0 md:size-40">
            <svg viewBox="0 0 36 36" className="size-36 -rotate-90 md:size-40">
              <defs>
                <linearGradient id="homeKpiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6C55F6" />
                  <stop offset="50%" stopColor="#4A8FE7" />
                  <stop offset="100%" stopColor="#4FCB97" />
                </linearGradient>
              </defs>
              <circle cx="18" cy="18" r="14.8" fill="none" stroke="#EEF3F8" strokeWidth="4.2" />
              <circle
                cx="18"
                cy="18"
                r="14.8"
                fill="none"
                stroke="url(#homeKpiGradient)"
                strokeWidth="4.2"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray={strokeDasharray}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[13px] font-semibold text-slate-500">이수율</p>
              <p className="mt-1 text-[2.2rem] font-semibold leading-none text-[#6C55F6]">{staff ? `${rate}%` : "--"}</p>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-3 gap-4 md:max-w-md">
            {kpiItems.map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-sm font-medium text-slate-600">{item.label}</p>
                <p className={`mt-2 text-[2rem] font-semibold leading-none md:text-[2.2rem] ${item.tone}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
