import { PageHeader, Panel, StatusBadge } from "@/components/ui";
import { APP_CONFIG } from "@/lib/config";
import { formatDateTime, getTrainingTitle, mockAppsScriptAdapter } from "@/lib/api/mockAppsScriptAdapter";

export default async function MyTrainingPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "T-1004" } = await searchParams;
  const result = await mockAppsScriptAdapter.getMyTrainingHistory(q, APP_CONFIG.currentYear);

  return (
    <div className="space-y-5">
      <PageHeader title="내 이수 확인" description="이름 또는 교직원ID로 2026년 교육·연수 이수 상태를 확인합니다." />
      <Panel>
        <form className="flex flex-col gap-3 md:flex-row">
          <input name="q" defaultValue={q} className="focus-ring min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2" placeholder="이름 또는 교직원ID" />
          <button className="focus-ring rounded-md bg-slateblue-900 px-5 py-2 text-sm font-semibold text-white">조회</button>
        </form>
      </Panel>

      {result.staff ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
          <Panel title={`${result.staff.성명} 선생님 이수 목록`}>
            <div className="space-y-3">
              {result.completions.map((row) => (
                <div key={`${row.eventId}-${row.교직원ID}`} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <p className="font-bold text-slateblue-900">{getTrainingTitle(row.eventId)}</p>
                    <StatusBadge value={row.이수완료 ? "승인" : "미이수"} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {row.이수완료 ? `${row.이수경로} · ${formatDateTime(row.이수일시)}` : "이수 기록 없음"}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="제출 상태">
            <div className="space-y-3">
              {result.uploads.map((upload) => (
                <div key={upload.uploadId} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-bold text-slateblue-900">{upload.파일명}</p>
                    <StatusBadge value={upload.상태} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{getTrainingTitle(upload.eventId)} · {formatDateTime(upload.업로드일시)}</p>
                  {upload.반려사유 ? <p className="mt-2 rounded-md bg-rose-50 p-2 text-sm text-rose-700">반려 사유: {upload.반려사유}</p> : null}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      ) : (
        <Panel>
          <p className="text-sm text-slate-500">조회된 교직원이 없습니다.</p>
        </Panel>
      )}
    </div>
  );
}
