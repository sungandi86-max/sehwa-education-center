"use client";

import Link from "next/link";
import { ArrowRight, Bell, ClipboardCheck, FileClock, GraduationCap, Search, UserRound } from "lucide-react";
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

export function PortalHero({ todayCount }: { todayCount: number }) {
  const { staff } = useStaffSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-slateblue-100 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-50 px-5 py-3.5 text-white shadow-soft md:px-6 md:py-4">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.72)_82%)]" />
      <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-extrabold leading-tight tracking-tight text-white md:text-xl">
            안녕하세요{staff ? `, ${staff.staffName} 선생님` : ""}.
          </h1>
          <p className="mt-1 text-sm font-bold text-white/90">오늘 진행 교육 {todayCount}건이 있습니다.</p>
          <p className="mt-0.5 text-xs font-semibold leading-5 text-white/75 md:text-sm">QR 출석, 내 이수 확인, 이수증 제출을 이용하세요.</p>
        </div>

        <div className="grid shrink-0 gap-2 sm:grid-cols-2 md:w-[300px]">
          <Link href="/my" className="btn-primary bg-white !text-brand-900 shadow-[0_12px_26px_rgba(255,255,255,0.16)] hover:bg-brand-50">
            <GraduationCap size={18} />
            내 교육현황
          </Link>
          <button type="button" onClick={() => setIsOpen(true)} className="btn-secondary bg-white/92">
            <Search size={18} />
            성명으로 조회
          </button>
        </div>
      </div>
      {isOpen ? <MyTrainingLookupModal onClose={() => setIsOpen(false)} /> : null}
    </section>
  );
}

export function TodayTasks({ todayCount, noticeCount }: { todayCount: number; noticeCount: number }) {
  const { staff } = useStaffSession();
  const [result, setResult] = useState<MyTrainingLookupResult | null>(null);

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

  const pendingUploads = result?.summary.pendingCount;

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <TaskItem icon={<ClipboardCheck size={25} />} label="오늘 진행 교육" value={`${todayCount}건`} href="/qr" />
      <TaskItem
        icon={<FileClock size={25} />}
        label="제출 대기 이수증"
        value={pendingUploads == null ? "조회 후 확인" : `${pendingUploads}건`}
        href="/upload"
      />
      <TaskItem icon={<Bell size={25} />} label="신규 공지" value={`${noticeCount}건`} href="#notices" />
    </section>
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
      <div className="quiet-card p-6">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-900">
          <UserRound size={26} />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-brand-900">내 교육현황</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          내 이수 확인 버튼을 눌러 성명으로 조회하면 교육현황을 확인할 수 있습니다.
        </p>
        <button type="button" onClick={() => setIsOpen(true)} className="btn-primary mt-6 w-full sm:w-auto">
          내 이수 확인
          <ArrowRight size={17} />
        </button>
        {isOpen ? <MyTrainingLookupModal onClose={() => setIsOpen(false)} /> : null}
      </div>
    );
  }

  return (
    <div className="quiet-card p-6">
      <p className="text-lg font-extrabold text-brand-900">{staff.staffName} 선생님</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">2026 교육현황</p>

      {!result ? (
        <div className="mt-6 grid gap-3">
          <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric label="이수 완료" value={result.summary.completedCount} />
          <Metric label="미이수" value={result.summary.incompleteCount} />
          <Metric label="승인대기" value={result.summary.pendingCount} />
        </div>
      )}

      <Link href="/my" className="btn-secondary mt-6 w-full sm:w-auto">
        상세보기
        <ArrowRight size={17} />
      </Link>
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
      <button type="button" onClick={() => setIsOpen(true)} className="soft-card group flex min-h-64 w-full flex-col p-6 text-left">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-softpurple-50 text-brand-900 ring-1 ring-softpurple-100">
          <GraduationCap size={27} />
        </div>
        <h3 className="mt-5 text-2xl font-extrabold text-brand-900">내 이수 확인</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">2026년 교직원 교육 이수 현황을 확인합니다.</p>
        <div className="mt-auto flex items-center justify-between gap-4 border-t border-slateblue-100 pt-5">
          <p className="text-sm font-bold text-slate-500">
            {staff && result ? `이수 ${result.summary.completedCount}건 / 미이수 ${result.summary.incompleteCount}건` : "성명 조회 후 확인"}
          </p>
          <ArrowRight size={20} className="text-brand-900 transition group-hover:translate-x-1" />
        </div>
      </button>
      {isOpen ? <MyTrainingLookupModal onClose={() => setIsOpen(false)} /> : null}
    </>
  );
}

function TaskItem({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <Link href={href} className="soft-card flex items-center gap-4 p-5">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-900 ring-1 ring-brand-100">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-500">{label}</p>
        <p className="mt-1 text-xl font-extrabold text-brand-900">{value}</p>
      </div>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slateblue-50 p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-brand-900">{value}건</p>
    </div>
  );
}
