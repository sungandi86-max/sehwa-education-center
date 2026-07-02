import Link from "next/link";
import { ArrowRight, Camera, Printer, QrCode } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/ui";
import { appsScriptClient, formatDateTime } from "@/lib/api/appsScriptClient";

export default async function QrPortalPage() {
  const [events, groupEvents] = await Promise.all([
    appsScriptClient.getTrainings(),
    appsScriptClient.getGroupTrainings("GRP-2026-001")
  ]);
  const availableEvents = events.filter((event) => event.상태 === "active" || event.상태 === "scheduled");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="QR 출석" description="연수장에서 QR 코드를 스캔하세요." />

      <section className="app-card overflow-hidden bg-gradient-to-br from-white via-white to-[#EEF5FF] p-6 text-center md:p-8">
        <div className="mx-auto flex size-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#5E6CFF] to-[#3650D8] text-white shadow-[0_20px_44px_rgba(54,80,216,0.22)]">
          <QrCode size={40} strokeWidth={1.75} />
        </div>
        <h1 className="mt-6 text-[1.8rem] font-semibold tracking-tight text-brand-900">QR 코드를 스캔해주세요</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-7 text-slate-500">
          교육장에 비치된 QR을 휴대폰 카메라로 스캔하면 출석 확인 화면으로 이동합니다.
        </p>
        <div className="mx-auto mt-7 flex aspect-square max-w-[260px] items-center justify-center rounded-[30px] border border-slateblue-100 bg-white shadow-[0_20px_54px_rgba(23,59,115,0.08)]">
          <div className="grid size-40 place-items-center rounded-[26px] bg-slateblue-50 text-brand-900">
            <QrCode size={86} strokeWidth={1.5} />
          </div>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button type="button" className="btn-primary">
            <Camera size={18} />
            카메라 열기
          </button>
          <Link href="/my" className="btn-secondary">
            내 이수 확인으로 이동
          </Link>
        </div>
      </section>

      {groupEvents.length > 0 ? (
        <div className="app-card bg-gradient-to-br from-white via-white to-[#EEF7FF] p-6">
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
          <div key={event.eventId} className="app-card p-6">
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

      <Link href="/" className="mx-auto flex w-fit items-center gap-2 text-sm font-semibold text-brand-700">
        홈으로 돌아가기
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
