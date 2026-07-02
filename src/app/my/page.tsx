import { CheckCircle2, Clock3, FileText, Search } from "lucide-react";
import { PageHeader, Panel, StatusBadge } from "@/components/ui";
import { StaffSessionBanner } from "@/components/staff-session-provider";
import { APP_CONFIG } from "@/lib/config";
import { appsScriptClient, formatDateTime, getTrainingTitle } from "@/lib/api/appsScriptClient";

export default async function MyTrainingPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "T-1004" } = await searchParams;
  const [events, result] = await Promise.all([
    appsScriptClient.getTrainings(),
    appsScriptClient.getMyTrainingHistory(q, APP_CONFIG.currentYear)
  ]);

  const completedCount = result.completions.filter((row) => row.이수완료).length;
  const incompleteCount = result.completions.length - completedCount;

  return (
    <div className="space-y-8">
      <PageHeader title="내 이수 확인" description="성명 또는 교직원ID로 2026년 교육·연수 이수 상태를 확인합니다." />
      <StaffSessionBanner />

      <Panel>
        <form className="flex flex-col gap-3 md:flex-row">
          <input name="q" defaultValue={q} className="input-soft min-w-0 flex-1" placeholder="이름 또는 교직원ID" />
          <button className="btn-primary">
            <Search size={17} />
            조회
          </button>
        </form>
      </Panel>

      {result.staff ? (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <SummaryCard icon={<CheckCircle2 size={21} />} label="이수 완료" value={completedCount} />
            <SummaryCard icon={<Clock3 size={21} />} label="미이수" value={incompleteCount} />
            <SummaryCard icon={<FileText size={21} />} label="제출 내역" value={result.uploads.length} />
          </section>

          <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
            <Panel title={`${result.staff.성명} 선생님 이수 목록`}>
              <div className="space-y-3">
                {result.completions.map((row) => (
                  <div key={`${row.eventId}-${row.교직원ID}`} className="rounded-[20px] border border-slateblue-100 bg-slateblue-50/70 p-4 transition hover:bg-white">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <p className="font-extrabold text-brand-900">{getTrainingTitle(row.eventId, events)}</p>
                      <StatusBadge value={row.이수완료 ? "승인" : "미이수"} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {row.이수완료 ? `${row.이수경로} · ${formatDateTime(row.이수일시 ?? "")}` : "이수 기록 없음"}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="제출 상태">
              <div className="space-y-3">
                {result.uploads.map((upload) => (
                  <div key={upload.uploadId} className="rounded-[20px] border border-slateblue-100 bg-slateblue-50/70 p-4 transition hover:bg-white">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-extrabold text-brand-900">{upload.파일명}</p>
                      <StatusBadge value={upload.상태} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {getTrainingTitle(upload.eventId, events)} · {formatDateTime(upload.업로드일시)}
                    </p>
                    {upload.반려사유 ? <p className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">반려 사유: {upload.반려사유}</p> : null}
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      ) : (
        <Panel>
          <p className="text-sm text-slate-500">조회된 교직원이 없습니다.</p>
        </Panel>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="soft-card p-6">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-900">{icon}</div>
      <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-brand-900">{value}건</p>
    </div>
  );
}
