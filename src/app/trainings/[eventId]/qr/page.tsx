import { notFound } from "next/navigation";
import { EmptyState, PageHeader, Panel } from "@/components/ui";
import { APP_CONFIG } from "@/lib/config";
import { mockAppsScriptAdapter } from "@/lib/api/mockAppsScriptAdapter";

export default async function QrAttendancePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const detail = await mockAppsScriptAdapter.getTrainingDetail(eventId);

  if (!detail) {
    notFound();
  }

  const attendanceUrl = `https://training.sehwa.local/attend/${detail.event.eventId}`;

  return (
    <div>
      <PageHeader title="QR 출석" description={detail.event.제목} />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="QR 생성 영역">
          <div className="mx-auto flex aspect-square max-w-72 items-center justify-center rounded-lg border border-slate-200 bg-white p-6">
            <div className="grid h-full w-full grid-cols-5 gap-2">
              {Array.from({ length: 25 }).map((_, index) => (
                <div key={index} className={`rounded-sm ${index % 3 === 0 || index % 7 === 0 ? "bg-slateblue-900" : "bg-slate-100"}`} />
              ))}
            </div>
          </div>
          <div className="mt-4 rounded-md bg-slate-50 p-3 font-mono text-xs text-slate-600">{attendanceUrl}</div>
          <button className="focus-ring mt-4 w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">QR 링크 복사</button>
        </Panel>

        <Panel title="모바일 출석 화면 placeholder">
          <div className="mx-auto max-w-sm rounded-[28px] border border-slate-300 bg-slate-900 p-3">
            <div className="rounded-[22px] bg-white p-5">
              <p className="text-center text-sm font-semibold text-brand-700">{APP_CONFIG.appName}</p>
              <h3 className="mt-3 text-center text-lg font-bold text-slateblue-900">{detail.event.제목}</h3>
              <div className="mt-5 grid gap-3">
                <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="교직원ID 또는 이름" />
                <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">출석 확인</button>
              </div>
              <EmptyState title="출석 기록 저장 예정" description="교직원ID 확인 후 선택한 교육의 QR 출석 기록으로 저장됩니다." />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
