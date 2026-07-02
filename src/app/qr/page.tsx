import Link from "next/link";
import { Printer, QrCode } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/ui";
import { appsScriptClient, formatDateTime } from "@/lib/api/appsScriptClient";

export default async function QrPortalPage() {
  const events = await appsScriptClient.getTrainings();
  const availableEvents = events.filter((event) => event.상태 === "active" || event.상태 === "scheduled");

  return (
    <div className="space-y-8">
      <PageHeader title="QR 출석" description="참여할 교육을 선택한 뒤 QR 출석 화면에서 본인 확인과 전자서명을 진행합니다." />

      <div className="rounded-[24px] border border-brand-100 bg-gradient-to-r from-brand-50 to-softpurple-50 px-6 py-5 text-sm leading-7 text-slate-700">
        오늘 또는 이번 주 참여 가능한 교육입니다. 교직원은 QR 출석으로 이동하고, 담당자는 QR 출력 버튼으로 A4 안내문을 인쇄할 수 있습니다.
      </div>

      <div className="grid gap-5">
        {availableEvents.map((event) => (
          <div key={event.eventId} className="soft-card p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <StatusBadge value={event.상태} />
                  <span className="text-sm font-bold text-brand-600">{event.담당부서}</span>
                </div>
                <p className="text-2xl font-extrabold text-brand-900">{event.제목}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {formatDateTime(event.시작일시)} · {event.장소}
                </p>
              </div>
              <div className="grid shrink-0 gap-2 sm:grid-cols-2 md:min-w-[260px]">
                <Link href={`/qr/${event.eventId}`} className="btn-primary">
                  <QrCode size={18} />
                  QR 출석
                </Link>
                <Link href={`/print/qr/${event.eventId}`} className="btn-secondary">
                  <Printer size={18} />
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
