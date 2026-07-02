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
      { label: "이수", value: staff ? summary.completedCount : "조회" },
      { label: "미이수", value: staff ? summary.incompleteCount : "후" },
      { label: "제출", value: staff ? summary.pendingCount + summary.rejectedCount : "확인" }
    ],
    [staff, summary.completedCount, summary.incompleteCount, summary.pendingCount, summary.rejectedCount]
  );

  return (
    <section className="grid gap-3 md:grid-cols-[1.25fr_0.75fr] md:gap-5">
      <div className="rounded-[30px] border border-slateblue-100 bg-gradient-to-br from-white via-white to-brand-50/76 px-5 py-5 shadow-[0_18px_54px_rgba(23,59,115,0.06)] md:px-8 md:py-7">
        <p className="text-sm font-semibold text-brand-600">안녕하세요{staff ? `, ${staff.staffName} 선생님` : ","}</p>
        <h1 className="mt-2 text-[1.7rem] font-semibold leading-tight tracking-tight text-brand-900 md:text-4xl">
          오늘 필요한 연수 업무를
          <br />
          빠르게 처리하세요.
        </h1>
        <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-500 md:text-base">
          QR 출석, 이수증 제출, 내 이수현황을 한 곳에서 확인합니다.
        </p>
      </div>

      <div className="rounded-[30px] border border-slateblue-100 bg-white/88 p-4 shadow-[0_18px_54px_rgba(23,59,115,0.055)]">
        <div className="flex items-center gap-4">
          <div className="relative size-24 shrink-0">
            <svg viewBox="0 0 36 36" className="size-24 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#EEF3F8" strokeWidth="4" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="#173B73"
                strokeWidth="4"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray={strokeDasharray}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[11px] font-semibold text-slate-500">이수율</p>
              <p className="text-2xl font-semibold text-brand-900">{staff ? `${rate}%` : "--"}</p>
            </div>
          </div>

          <div className="grid flex-1 gap-2">
            {kpiItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slateblue-50 px-3 py-2">
                <p className="text-xs font-medium text-slate-500">{item.label}</p>
                <p className="text-base font-semibold text-brand-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
