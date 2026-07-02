"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HeaderStaffMenu, useStaffSession } from "@/components/staff-session-provider";
import { MyTrainingLookupModal } from "@/components/my-training-lookup-modal";
import type { MyTrainingLookupResult } from "@/lib/my-training-lookup";

export function HomeHeaderActions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <HeaderStaffMenu onLookup={() => setIsOpen(true)} />
      {isOpen ? <MyTrainingLookupModal onClose={() => setIsOpen(false)} /> : null}
    </>
  );
}

export function MyTrainingStatusCard() {
  const { staff } = useStaffSession();
  const [result, setResult] = useState<MyTrainingLookupResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!staff) {
      return;
    }

    fetch("/api/my-training", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        staffName: staff.staffName,
        department: staff.department,
        year: 2026
      })
    })
      .then((response) => response.json())
      .then((payload) => setResult(payload as MyTrainingLookupResult));
  }, [staff]);

  if (!staff) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold text-slateblue-900">내 교육현황</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          내 이수 확인 버튼을 눌러 성명으로 조회하면 교육현황을 확인할 수 있습니다.
        </p>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-5 rounded-md bg-slateblue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          내 이수 확인
        </button>
        {isOpen ? <MyTrainingLookupModal onClose={() => setIsOpen(false)} /> : null}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-lg font-bold text-slateblue-900">{staff.staffName} 선생님</p>
      <p className="mt-1 text-sm text-slate-500">2026 교육현황</p>

      {staff && !result ? (
        <div className="mt-5 space-y-3">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
        </div>
      ) : (
        <div className="mt-5 space-y-3 text-sm">
          <p className="font-bold text-slateblue-900">이수 완료 {result?.summary.completedCount ?? 0}건</p>
          <p className="font-bold text-slateblue-900">미이수 {result?.summary.incompleteCount ?? 0}건</p>
          <p className="font-bold text-slateblue-900">승인대기 {result?.summary.pendingCount ?? 0}건</p>
        </div>
      )}

      <Link
        href="/my"
        className="mt-5 inline-flex rounded-md border border-slateblue-900 bg-white px-4 py-2 text-sm font-semibold text-slateblue-900 hover:bg-brand-50"
      >
        상세보기
      </Link>
      {isOpen ? <MyTrainingLookupModal onClose={() => setIsOpen(false)} /> : null}
    </div>
  );
}

export function MyTrainingActionCard() {
  const { staff } = useStaffSession();
  const [result, setResult] = useState<MyTrainingLookupResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!staff) {
      return;
    }

    fetch("/api/my-training", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        staffName: staff.staffName,
        department: staff.department,
        year: 2026
      })
    })
      .then((response) => response.json())
      .then((payload) => setResult(payload as MyTrainingLookupResult));
  }, [staff]);

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
              {staff && result ? `이수 ${result.summary.completedCount}건 / 미이수 ${result.summary.incompleteCount}건` : "성명 조회 후 확인"}
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
