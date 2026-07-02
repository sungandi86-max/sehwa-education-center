import { PageHeader, Panel, StatusBadge } from "@/components/ui";
import { StaffSessionBanner, StaffSessionFields } from "@/components/staff-session-provider";
import { APP_CONFIG } from "@/lib/config";
import { appsScriptClient, formatDateTime, getTrainingTitle } from "@/lib/api/appsScriptClient";

export default async function UploadPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "T-1004" } = await searchParams;
  const events = await appsScriptClient.getTrainings();
  const result = await appsScriptClient.getMyTrainingHistory(q, APP_CONFIG.currentYear);
  const uploadableEvents = events.filter((event) => event.상태 === "active" || event.상태 === "scheduled");

  return (
    <div className="space-y-5">
      <PageHeader title="이수증 업로드" description="외부 연수 또는 온라인 연수 이수증을 제출하고 처리 상태를 확인합니다." />
      <StaffSessionBanner />

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Panel title="이수증 제출">
          <form className="grid gap-4">
            <StaffSessionFields />
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              제출 대상 교육
              <select className="focus-ring rounded-md border border-slate-300 px-3 py-2 font-normal">
                {uploadableEvents.map((event) => (
                  <option key={event.eventId} value={event.eventId}>
                    {event.제목}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              교직원ID
              <input className="focus-ring rounded-md border border-slate-300 px-3 py-2 font-normal" placeholder="예: T-1004" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              성명
              <input className="focus-ring rounded-md border border-slate-300 px-3 py-2 font-normal" placeholder="이름" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              이수증 파일
              <input type="file" className="focus-ring rounded-md border border-slate-300 px-3 py-2 font-normal" />
            </label>
            <button className="focus-ring rounded-md bg-slateblue-900 px-4 py-2 text-sm font-semibold text-white">제출하기</button>
            <div className="rounded-md border border-teal-100 bg-teal-50 p-3 text-sm leading-6 text-slate-700">
              업로드 후 AI가 이수증 정보를 확인 중입니다. 제출 기록과 검토 상태는 담당자 확인 후 반영됩니다.
            </div>
          </form>
        </Panel>

        <Panel title="내 제출 상태 확인">
          <form className="mb-4 flex flex-col gap-3 md:flex-row">
            <input name="q" defaultValue={q} className="focus-ring min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2" placeholder="이름 또는 교직원ID" />
            <button className="focus-ring rounded-md bg-slateblue-900 px-4 py-2 text-sm font-semibold text-white">조회</button>
          </form>

          {result.staff ? (
            <div className="space-y-3">
              {result.uploads.length > 0 ? (
                result.uploads.map((upload) => (
                  <div key={upload.uploadId} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-bold text-slateblue-900">{getTrainingTitle(upload.eventId, events)}</p>
                        <p className="mt-1 text-sm text-slate-500">{upload.파일명} · {formatDateTime(upload.업로드일시)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge value={upload.상태} />
                        <StatusBadge value={upload.aiReviewStatus} />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 text-sm md:grid-cols-3">
                      <div>
                        <span className="text-slate-500">이수증 번호</span>
                        <p className="font-bold text-slateblue-900">{upload.certificateNumber ?? "확인 중"}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">연수명</span>
                        <p className="font-bold text-slateblue-900">{upload.trainingTitle ?? "확인 중"}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">성명</span>
                        <p>{upload.성명}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">이수일자</span>
                        <p>{upload.completedAt ?? "확인 중"}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">이수시간</span>
                        <p>{upload.trainingHours ?? "확인 중"}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">발급기관</span>
                        <p>{upload.issuer ?? "확인 중"}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">신뢰도</span>
                        <p>{Math.round((upload.confidence ?? 0) * 100)}%</p>
                      </div>
                    </div>

                    {upload.반려사유 ? (
                      <p className="mt-3 rounded-md bg-rose-50 p-3 text-sm text-rose-700">반려 사유: {upload.반려사유}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">제출한 이수증이 없습니다.</p>
              )}
            </div>
          ) : (
            <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">조회된 교직원이 없습니다.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
