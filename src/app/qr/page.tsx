import Link from "next/link";
import { Printer, QrCode } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/ui";
import { appsScriptClient, formatDateTime } from "@/lib/api/appsScriptClient";

export default async function QrPortalPage() {
  const [events, groupEvents] = await Promise.all([
    appsScriptClient.getTrainings(),
    appsScriptClient.getGroupTrainings("GRP-2026-001")
  ]);
  const availableEvents = events.filter((event) => event.상태 === "active" || event.상태 === "scheduled");

  return (
    <div className="space-y-8">
      <PageHeader title="QR 출석" description="참여할 교육을 선택한 뒤 QR 출석 화면에서 본인 확인과 전자서명을 진행합니다." />

      <div className="rounded-[24px] border border-brand-100 bg-gradient-to-r from-brand-50 to-softpurple-50 px-6 py-5 text-sm leading-7 text-slate-700">
        오늘 또는 이번 주 참여 가능한 교육입니다. 여러 연수를 연속으로 진행할 때는 묶음 QR로 한 번만 서명받을 수 있습니다.
      </div>

      {groupEvents.length > 0 ? (
        <div className="soft-card bg-gradient-to-br from-white via-white to-[#EEF7FF] p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-600">묶음 QR</p>
              <h2 className="mt-2 text-2xl font-semibold text-brand-900">7월 교직원 필수연수 묶음</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {groupEvents.length}개 교육을 전자서명 한 번으로 출석 처리합니다.
              </p>
            </div>
            <div className="grid shrink-0 gap-2 sm:grid-cols-2 md:min-w-[280px]">
              <Link href="/qr/group/GRP-2026-001" className="btn-primary">
                <QrCode size={18} />
                묶음 출석
              </Link>
              <Link href="/print/qr/group/GRP-2026-001" className="btn-secondary">
                <Printer size={18} />
                묶음 QR 출력
              </Link>
            </div>
          </div>
        </div>
      ) : null}

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
