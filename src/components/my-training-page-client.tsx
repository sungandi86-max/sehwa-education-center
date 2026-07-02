"use client";

import { AlertTriangle, CheckCircle2, Clock3, LoaderCircle, Search, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MyTrainingLookupModal } from "@/components/my-training-lookup-modal";
import { useStaffSession, type StaffSession } from "@/components/staff-session-provider";
import type { MyTrainingLookupItem, MyTrainingLookupResult } from "@/lib/my-training-lookup";

type DisplayStatus = "이수완료" | "미이수" | "승인대기" | "반려" | "제출완료" | "해당없음";

const emptySummary = {
  completedCount: 0,
  incompleteCount: 0,
  pendingCount: 0,
  rejectedCount: 0
};

const statusClassMap: Record<DisplayStatus, string> = {
  이수완료: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  미이수: "bg-rose-50 text-rose-700 ring-rose-100",
  승인대기: "bg-amber-50 text-amber-700 ring-amber-100",
  반려: "bg-red-50 text-red-700 ring-red-100",
  제출완료: "bg-sky-50 text-sky-700 ring-sky-100",
  해당없음: "bg-slate-100 text-slate-600 ring-slate-200"
};

const statusOrder: Record<DisplayStatus, number> = {
  미이수: 0,
  승인대기: 1,
  반려: 2,
  제출완료: 3,
  해당없음: 4,
  이수완료: 5
};

export function MyTrainingPageClient() {
  const { staff: currentStaff, clearStaff } = useStaffSession();
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [result, setResult] = useState<MyTrainingLookupResult | null>(null);
  const [resultStaffKey, setResultStaffKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentStaff) {
      return;
    }

    const controller = new AbortController();
    const staffKey = getStaffKey(currentStaff);

    const load = async () => {
      setResult(null);
      setResultStaffKey(staffKey);
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/my-training", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            staffId: currentStaff.staffId,
            staffName: currentStaff.staffName,
            department: currentStaff.department,
            year: 2026
          }),
          signal: controller.signal
        });
        const payload = (await response.json()) as MyTrainingLookupResult & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "이수현황을 불러오지 못했습니다.");
        }

        setResult({
          ...payload,
          staff: {
            staffId: currentStaff.staffId,
            staffName: currentStaff.staffName,
            department: currentStaff.department
          }
        });
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") {
          return;
        }

        setResult(null);
        setError(loadError instanceof Error ? loadError.message : "이수현황을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [currentStaff]);

  const visibleResult = currentStaff && resultStaffKey === getStaffKey(currentStaff) ? result : null;
  const summary = visibleResult?.summary ?? emptySummary;
  const orderedItems = useMemo(
    () =>
      [...(visibleResult?.items ?? [])].sort((a, b) => {
        const aStatus = getPrimaryStatus(a);
        const bStatus = getPrimaryStatus(b);

        return statusOrder[aStatus] - statusOrder[bStatus] || a.title.localeCompare(b.title, "ko");
      }),
    [visibleResult]
  );
  const actionItems = orderedItems.filter((item) => getPrimaryStatus(item) !== "이수완료");
  const completedItems = orderedItems.filter((item) => getPrimaryStatus(item) === "이수완료");

  const startLookupAgain = () => {
    clearStaff();
    setResult(null);
    setResultStaffKey("");
    setError("");
    setIsLookupOpen(true);
  };

  return (
    <div className="space-y-6">
      {!currentStaff ? (
        <section className="quiet-card bg-gradient-to-br from-white via-white to-brand-50/70 p-7 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-[24px] bg-brand-50 text-brand-900">
            <Search size={30} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-brand-900">본인 확인 후 내 이수현황을 조회합니다</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            조회된 교직원 정보 하나가 상단 정보, 요약, 교육별 이수 상태에 동일하게 적용됩니다.
          </p>
          <button type="button" onClick={() => setIsLookupOpen(true)} className="btn-primary mt-6 w-full sm:w-auto">
            교직원 조회
          </button>
        </section>
      ) : (
        <>
          <section className="quiet-card p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold text-brand-700">조회 대상</p>
                <h2 className="mt-1 text-2xl font-extrabold text-brand-900">{currentStaff.staffName} 선생님</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  {currentStaff.department}
                  {currentStaff.position ? ` · ${currentStaff.position}` : ""}
                  {currentStaff.staffId ? ` · ${currentStaff.staffId}` : ""}
                </p>
              </div>
              <button type="button" onClick={startLookupAgain} className="btn-secondary w-full md:w-auto">
                다른 사용자 조회
              </button>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            <SummaryCard icon={<AlertTriangle size={21} />} label="미이수" value={summary.incompleteCount} tone="text-rose-700" />
            <SummaryCard icon={<Clock3 size={21} />} label="승인대기" value={summary.pendingCount} tone="text-amber-700" />
            <SummaryCard icon={<XCircle size={21} />} label="반려" value={summary.rejectedCount} tone="text-red-700" />
            <SummaryCard icon={<CheckCircle2 size={21} />} label="이수완료" value={summary.completedCount} tone="text-emerald-700" />
          </section>
        </>
      )}

      {isLoading ? (
        <section className="quiet-card p-8 text-center">
          <LoaderCircle className="mx-auto animate-spin text-brand-900" size={34} />
          <p className="mt-4 text-sm font-medium text-slate-500">이수현황을 불러오고 있습니다.</p>
        </section>
      ) : null}

      {currentStaff && error ? <p className="rounded-[22px] bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p> : null}

      {currentStaff && visibleResult && !isLoading ? (
        <section className="quiet-card overflow-hidden">
          <div className="border-b border-slateblue-100 px-6 py-5">
            <h2 className="text-xl font-semibold text-brand-900">{currentStaff.staffName} 선생님의 2026 교육 이수현황</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              아직 처리할 교육을 먼저 보여주고, 이수완료 교육은 아래에 모아 표시합니다.
            </p>
          </div>

          <div className="space-y-7 p-6">
            <TrainingSection title="확인이 필요한 교육" emptyText="현재 미이수, 승인대기, 반려 상태의 교육이 없습니다." items={actionItems} />
            <TrainingSection title="이수완료 교육" emptyText="아직 이수완료된 교육이 없습니다." items={completedItems} />
          </div>
        </section>
      ) : null}

      {isLookupOpen ? <MyTrainingLookupModal onClose={() => setIsLookupOpen(false)} /> : null}
    </div>
  );
}

function TrainingSection({ title, emptyText, items }: { title: string; emptyText: string; items: MyTrainingLookupItem[] }) {
  return (
    <section>
      <h3 className="text-sm font-extrabold text-brand-700">{title}</h3>
      {items.length > 0 ? (
        <div className="mt-3 grid gap-4">
          {items.map((item) => (
            <TrainingStatusCard key={item.eventId} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-[22px] bg-slateblue-50 px-4 py-5 text-sm font-semibold text-slate-500">{emptyText}</p>
      )}
    </section>
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

function TrainingStatusCard({ item }: { item: MyTrainingLookupItem }) {
  const primaryStatus = getPrimaryStatus(item);
  const uploadStatus = getUploadStatus(item);

  return (
    <div className="rounded-[24px] border border-slateblue-100 bg-gradient-to-br from-white via-white to-slateblue-50 p-5 shadow-[0_14px_40px_rgba(23,59,115,0.045)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-lg font-semibold text-brand-900">{item.title}</p>
          <p className="mt-1 text-sm text-slate-500">{item.department}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={primaryStatus} />
          {uploadStatus !== primaryStatus ? <StatusBadge status={uploadStatus} /> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Detail label={getPrimaryDetailLabel(primaryStatus)} value={getPrimaryDetail(item, primaryStatus)} />
        <Detail label="이수증 제출 상태" value={getUploadDetail(item, uploadStatus)} />
      </div>

      {item.rejectReason ? <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">사유: {item.rejectReason}</p> : null}
    </div>
  );
}

function StatusBadge({ status }: { status: DisplayStatus }) {
  return <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClassMap[status]}`}>{status}</span>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slateblue-100">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-brand-900">{value}</p>
    </div>
  );
}

function getStaffKey(staff: StaffSession) {
  return `${staff.staffId}::${staff.staffName}::${staff.department}`;
}

function getPrimaryStatus(item: MyTrainingLookupItem): DisplayStatus {
  const statusText = normalizeText(item.status);

  if (statusText.includes("반려")) {
    return "반려";
  }

  if (statusText.includes("제출완료")) {
    return "제출완료";
  }

  if (statusText.includes("승인대기") || statusText.includes("확인중")) {
    return "승인대기";
  }

  if (statusText.includes("이수완료") || statusText.includes("승인")) {
    return "이수완료";
  }

  return "미이수";
}

function getUploadStatus(item: MyTrainingLookupItem): DisplayStatus {
  const statusText = normalizeText(item.uploadStatus);

  if (!statusText) {
    return "해당없음";
  }

  if (statusText.includes("반려")) {
    return "반려";
  }

  if (statusText.includes("승인대기") || statusText.includes("확인중")) {
    return "승인대기";
  }

  if (statusText.includes("승인")) {
    return "이수완료";
  }

  return "제출완료";
}

function getPrimaryDetailLabel(status: DisplayStatus) {
  if (status === "미이수") {
    return "사유";
  }

  if (status === "이수완료") {
    return "참석일";
  }

  return "처리 상태";
}

function getPrimaryDetail(item: MyTrainingLookupItem, status: DisplayStatus) {
  if (status === "미이수") {
    return "이수 기록 없음";
  }

  if (status === "이수완료") {
    return item.completedAt ? `${item.completedAt}${item.completionSource ? ` · ${item.completionSource}` : ""}` : "이수 기록 확인됨";
  }

  if (status === "반려") {
    return item.rejectReason || "이수증 제출이 반려되었습니다.";
  }

  return "이수증 확인을 기다리고 있습니다.";
}

function getUploadDetail(item: MyTrainingLookupItem, status: DisplayStatus) {
  if (status === "해당없음") {
    return "제출 기록 없음";
  }

  const parts = [item.uploadStatus, item.uploadFileName ? `파일명: ${item.uploadFileName}` : undefined].filter(Boolean);

  return parts.join(" · ");
}

function normalizeText(value: unknown) {
  return value == null ? "" : String(value).replace(/\s/g, "");
}
