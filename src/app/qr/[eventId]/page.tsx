import { notFound } from "next/navigation";
import { QrAttendanceConfirm } from "@/components/qr-attendance-confirm";
import { PageHeader, Panel } from "@/components/ui";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

const formatDateOnly = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul"
  }).format(new Date(value));

const formatTimeOnly = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul"
  }).format(new Date(value));

export default async function QrAttendancePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const events = await appsScriptClient.getTrainings();
  const event = events.find((item) => item.eventId === eventId);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <PageHeader title="QR 출석" description="교육 정보를 확인한 뒤 출석을 진행합니다." />

      <Panel>
        <div className="mx-auto max-w-xl">
          <p className="text-sm font-bold text-teal-700">교육 조회</p>
          <h2 className="mt-2 text-2xl font-bold text-slateblue-900">{event.제목}</h2>
          <div className="mt-5 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-slateblue-900">일자</span>
              <span className="ml-3">{formatDateOnly(event.시작일시)}</span>
            </p>
            <p>
              <span className="font-semibold text-slateblue-900">시간</span>
              <span className="ml-3">
                {formatTimeOnly(event.시작일시)} - {formatTimeOnly(event.종료일시)}
              </span>
            </p>
            <p>
              <span className="font-semibold text-slateblue-900">장소</span>
              <span className="ml-3">{event.장소}</span>
            </p>
            <p>
              <span className="font-semibold text-slateblue-900">담당부서</span>
              <span className="ml-3">{event.담당부서}</span>
            </p>
          </div>

          <div className="mt-5">
            <QrAttendanceConfirm eventId={event.eventId} />
          </div>
        </div>
      </Panel>
    </div>
  );
}
