import Link from "next/link";
import { PageHeader, StatusBadge } from "@/components/ui";
import { appsScriptClient, formatDateTime } from "@/lib/api/appsScriptClient";

export default async function QrPortalPage() {
  const events = await appsScriptClient.getTrainings();
  const availableEvents = events.filter((event) => event.상태 === "active" || event.상태 === "scheduled");

  return (
    <div className="space-y-5">
      <PageHeader title="QR 출석" description="참여할 교육을 선택한 뒤 QR 출석 화면에서 이름 또는 교직원ID를 입력합니다." />

      <div className="rounded-md border border-teal-100 bg-teal-50 px-5 py-3 text-sm leading-6 text-slate-700">
        오늘 또는 이번 주 참여 가능한 교육입니다. 교육을 선택한 뒤 교직원ID로 출석을 확인합니다.
      </div>

      <div className="grid gap-4">
        {availableEvents.map((event) => (
          <div key={event.eventId} className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge value={event.상태} />
                  <span className="text-sm font-semibold text-teal-700">{event.담당부서}</span>
                </div>
                <p className="text-lg font-bold text-slateblue-900">{event.제목}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {formatDateTime(event.시작일시)} · {event.장소}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link href={`/qr/${event.eventId}`} className="rounded-md bg-slateblue-900 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                  QR 출석
                </Link>
                <Link href={`/print/qr/${event.eventId}`} className="rounded-md border border-slateblue-900 bg-white px-5 py-2 text-sm font-semibold text-slateblue-900 hover:bg-brand-50">
                  QR 출력
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
