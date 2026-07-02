import { Brain, FileUp, Search, Sparkles } from "lucide-react";
import { PageHeader, Panel, StatusBadge } from "@/components/ui";
import { StaffSessionBanner, StaffSessionFields } from "@/components/staff-session-provider";
import { APP_CONFIG } from "@/lib/config";
import { appsScriptClient, formatDateTime, getTrainingTitle } from "@/lib/api/appsScriptClient";

export default async function UploadPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const events = await appsScriptClient.getTrainings();
  const result = q ? await appsScriptClient.getMyTrainingHistory(q, APP_CONFIG.currentYear) : { uploads: [] };
  const uploadableEvents = events.filter((event) => event.상태 === "active" || event.상태 === "scheduled");

  return (
    <div className="space-y-8">
      <PageHeader title="이수증 제출" description="외부 연수 또는 온라인 연수 이수증을 제출하고 처리 상태를 확인합니다." />
      <StaffSessionBanner />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="이수증 제출">
          <form className="grid gap-5">
            <StaffSessionFields />
            <label className="grid gap-2 text-sm font-bold text-brand-900">
              제출 대상 교육
              <select className="input-soft font-normal">
                {uploadableEvents.map((event) => (
                  <option key={event.eventId} value={event.eventId}>
                    {event.제목}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-brand-900">
              교직원ID
              <input className="input-soft font-normal" placeholder="본인 확인 후 자동 연결됩니다." />
            </label>
            <label className="grid gap-2 text-sm font-bold text-brand-900">
              성명
              <input className="input-soft font-normal" placeholder="본인 확인 후 자동 연결됩니다." />
            </label>
            <label className="grid gap-2 text-sm font-bold text-brand-900">
              이수증 파일
              <input type="file" className="input-soft font-normal file:mr-4 file:rounded-xl file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-bold file:text-brand-900" />
            </label>
            <button className="btn-primary">
              <FileUp size={17} />
              제출하기
            </button>
            <div className="rounded-[22px] border border-brand-100 bg-gradient-to-r from-brand-50 to-softpurple-50 p-4 text-sm leading-7 text-slate-700">
              <div className="mb-2 flex items-center gap-2 font-extrabold text-brand-900">
                <Sparkles size={18} />
                AI가 이수증 정보를 확인 중입니다
              </div>
              업로드된 이수증에서 번호, 연수명, 이수일자, 발급기관을 자동 추출하여 담당자 검토용으로 저장합니다.
            </div>
          </form>
        </Panel>

        <Panel title="내 제출 상태 확인">
          <form className="mb-5 flex flex-col gap-3 md:flex-row">
            <input name="q" defaultValue={q} className="input-soft min-w-0 flex-1" placeholder="이름 또는 교직원ID" />
            <button className="btn-primary">
              <Search size={17} />
              조회
            </button>
          </form>

          {"staff" in result && result.staff ? (
            <div className="space-y-4">
              {result.uploads.length > 0 ? (
                result.uploads.map((upload) => (
                  <div key={upload.uploadId} className="rounded-[22px] border border-slateblue-100 bg-slateblue-50/70 p-5 transition hover:bg-white">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-extrabold text-brand-900">{getTrainingTitle(upload.eventId, events)}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {upload.파일명} · {formatDateTime(upload.업로드일시)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge value={upload.상태} />
                        <StatusBadge value={upload.aiReviewStatus} />
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 border-t border-slateblue-100 pt-5 text-sm md:grid-cols-3">
                      <AiField label="이수증 번호" value={upload.certificateNumber ?? "확인 중"} />
                      <AiField label="연수명" value={upload.trainingTitle ?? "확인 중"} />
                      <AiField label="성명" value={upload.성명} />
                      <AiField label="이수일자" value={upload.completedAt ?? "확인 중"} />
                      <AiField label="이수시간" value={upload.trainingHours ?? "확인 중"} />
                      <AiField label="발급기관" value={upload.issuer ?? "확인 중"} />
                      <AiField label="신뢰도" value={`${Math.round((upload.confidence ?? 0) * 100)}%`} icon={<Brain size={16} />} />
                    </div>

                    {upload.반려사유 ? <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">반려 사유: {upload.반려사유}</p> : null}
                  </div>
                ))
              ) : (
                <p className="rounded-[20px] bg-slateblue-50 p-5 text-sm text-slate-500">제출한 이수증이 없습니다.</p>
              )}
            </div>
          ) : (
            <p className="rounded-[20px] bg-slateblue-50 p-5 text-sm text-slate-500">
              이름 또는 교직원ID로 제출 상태를 조회해주세요.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function AiField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
        {icon}
        {label}
      </span>
      <p className="mt-2 font-extrabold text-brand-900">{value}</p>
    </div>
  );
}
