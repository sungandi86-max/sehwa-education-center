"use client";

import { CheckCircle2, Clock3, FileText, LoaderCircle, Search, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MyTrainingLookupModal } from "@/components/my-training-lookup-modal";
import { StaffSessionBanner, useStaffSession } from "@/components/staff-session-provider";
import type { MyTrainingItemStatus, MyTrainingLookupResult } from "@/lib/my-training-lookup";

const statusClassMap: Record<MyTrainingItemStatus, string> = {
  이수완료: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  미이수: "bg-rose-50 text-rose-700 ring-rose-100",
  승인대기: "bg-amber-50 text-amber-700 ring-amber-100",
  반려: "bg-rose-50 text-rose-700 ring-rose-100"
};

export function MyTrainingPageClient() {
  const { staff } = useStaffSession();
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [result, setResult] = useState<MyTrainingLookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!staff) {
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
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
        const payload = (await response.json()) as MyTrainingLookupResult & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "이수현황 조회 중 오류가 발생했습니다.");
        }

        setResult({
          ...payload,
          staff: payload.staff ?? staff
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "이수현황 조회 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [staff]);

  const visibleResult = staff && result?.staff?.staffId === staff.staffId ? result : null;
  const visibleError = staff ? error : "";

  const summary = useMemo(
    () =>
      visibleResult?.summary ?? {
        completedCount: 0,
        incompleteCount: 0,
        pendingCount: 0,
        rejectedCount: 0
      },
    [visibleResult]
  );

  return (
    <div className="space-y-8">
      <StaffSessionBanner />

      {!staff ? (
        <section className="quiet-card bg-gradient-to-br from-white via-white to-brand-50/70 p-7 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-[24px] bg-brand-50 text-brand-900">
            <Search size={30} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-brand-900">성명으로 본인 확인 후 조회합니다.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">로그인 없이 교직원명과 소속부서로 내 연수 이수현황을 확인할 수 있습니다.</p>
          <button type="button" onClick={() => setIsLookupOpen(true)} className="btn-primary mt-6 w-full sm:w-auto">
            성명으로 조회
          </button>
        </section>
      ) : null}

      {staff ? (
        <section className="grid gap-4 md:grid-cols-4">
          <SummaryCard icon={<CheckCircle2 size={21} />} label="이수 완료" value={summary.completedCount} tone="text-emerald-700" />
          <SummaryCard icon={<Clock3 size={21} />} label="미이수" value={summary.incompleteCount} tone="text-rose-700" />
          <SummaryCard icon={<FileText size={21} />} label="승인대기" value={summary.pendingCount} tone="text-amber-700" />
          <SummaryCard icon={<XCircle size={21} />} label="반려" value={summary.rejectedCount} tone="text-rose-700" />
        </section>
      ) : null}

      {isLoading ? (
        <section className="quiet-card p-8 text-center">
          <LoaderCircle className="mx-auto animate-spin text-brand-900" size={34} />
          <p className="mt-4 text-sm font-medium text-slate-500">이수현황을 불러오고 있습니다.</p>
        </section>
      ) : null}

      {visibleError ? <p className="rounded-[22px] bg-rose-50 p-4 text-sm font-semibold text-rose-700">{visibleError}</p> : null}

      {staff && visibleResult && !isLoading ? (
        <section className="quiet-card overflow-hidden">
          <div className="border-b border-slateblue-100 px-6 py-5">
            <h2 className="text-xl font-semibold text-brand-900">{staff.staffName} 선생님의 2026 교육현황</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">교육 하나마다 이수 상태와 이수증 제출 상태를 함께 표시합니다.</p>
          </div>
          <div className="grid gap-4 p-6">
            {visibleResult.items.map((item) => (
              <TrainingStatusCard key={item.eventId} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {isLookupOpen ? <MyTrainingLookupModal onClose={() => setIsLookupOpen(false)} /> : null}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="soft-card p-5">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-brand-900 ring-1 ring-slateblue-100">{icon}</div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${tone}`}>{value}건</p>
    </div>
  );
}

function TrainingStatusCard({ item }: { item: MyTrainingLookupResult["items"][number] }) {
  return (
    <div className="rounded-[24px] border border-slateblue-100 bg-gradient-to-br from-white via-white to-slateblue-50 p-5 shadow-[0_14px_40px_rgba(23,59,115,0.045)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-lg font-semibold text-brand-900">{item.title}</p>
          <p className="mt-1 text-sm text-slate-500">{item.department}</p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClassMap[item.status]}`}>
          {item.status}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Detail label="이수 정보" value={item.completedAt ? `${item.completionSource ?? "이수"} · ${item.completedAt}` : "이수 기록 없음"} />
        <Detail label="이수증 제출" value={item.uploadStatus ? `${item.uploadStatus}${item.uploadFileName ? ` · ${item.uploadFileName}` : ""}` : "제출 기록 없음"} />
      </div>

      {item.rejectReason ? <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">반려 사유: {item.rejectReason}</p> : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slateblue-100">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-brand-900">{value}</p>
    </div>
  );
}
