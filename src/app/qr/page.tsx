import Link from "next/link";
import { ArrowLeft, Camera, ChevronRight, ClipboardList, Printer, QrCode } from "lucide-react";
import { StatusBadge } from "@/components/ui";
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

export default async function QrPortalPage() {
  const [events, groupEvents] = await Promise.all([
    appsScriptClient.getTrainings(),
    appsScriptClient.getGroupTrainings("GRP-2026-001")
  ]);
  const availableEvents = events.filter((event) => event.상태 === "active" || event.상태 === "scheduled");
  const visibleEvents = availableEvents.slice(0, 3);

  return (
    <div className="mx-auto max-w-md space-y-4 md:max-w-3xl">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex size-11 items-center justify-center rounded-2xl bg-white text-brand-900 shadow-[0_10px_24px_rgba(23,59,115,0.06)] ring-1 ring-slateblue-100">
          <ArrowLeft size={21} />
          <span className="sr-only">홈으로</span>
        </Link>
        <h1 className="text-lg font-semibold text-brand-900">QR 출석</h1>
        <div className="size-11" aria-hidden />
      </div>

      <section className="app-card overflow-hidden bg-gradient-to-br from-white via-white to-[#EEF5FF] p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#5E6CFF] to-[#3650D8] text-white shadow-[0_16px_34px_rgba(54,80,216,0.2)]">
            <Camera size={27} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[1.45rem] font-semibold tracking-tight text-brand-900">QR 스캔을 시작하세요</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              연수장에 비치된 QR 코드를 휴대폰 카메라로 스캔하여 출석을 진행하세요.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2.5">
          <button type="button" className="btn-primary">
            <span aria-hidden>📷</span>
            QR 스캔 시작
          </button>
          <Link href="/my" className="btn-secondary">
            내 이수현황으로 이동
          </Link>
        </div>
      </section>

      <section className="app-card p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-900">
              <ClipboardList size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-brand-900">오늘 진행 교육</h2>
              <p className="text-xs font-medium text-slate-500">출석 가능한 교육을 선택할 수 있습니다.</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-brand-600">{visibleEvents.length}건</span>
        </div>

        <div className="space-y-2.5">
          {visibleEvents.length > 0 ? (
            visibleEvents.map((event) => (
              <Link
                key={event.eventId}
                href={`/qr/${event.eventId}`}
                className="group flex items-center gap-3 rounded-[22px] border border-slateblue-100 bg-white px-4 py-3 shadow-[0_8px_20px_rgba(23,59,115,0.035)] transition hover:-translate-y-0.5 hover:border-brand-900"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <StatusBadge value={event.상태} />
                    <span className="truncate text-xs font-semibold text-brand-600">{event.담당부서}</span>
                  </div>
                  <p className="truncate font-semibold text-brand-900">{event.제목}</p>
                  <div className="mt-2 grid gap-1 text-xs font-medium text-slate-500">
                    <p>{formatDateOnly(event.시작일시)}</p>
                    <p>
                      {formatTimeOnly(event.시작일시)}~{formatTimeOnly(event.종료일시)}
                    </p>
                    <p className="truncate">
                      {event.장소} · {event.담당부서}
                    </p>
                  </div>
                </div>
                <ChevronRight className="shrink-0 text-brand-500 transition group-hover:translate-x-1" size={20} />
              </Link>
            ))
          ) : (
            <div className="rounded-[22px] bg-slateblue-50 px-4 py-5 text-center text-sm font-medium text-slate-500">
              현재 출석 가능한 교육이 없습니다.
            </div>
          )}
        </div>
      </section>

      {groupEvents.length > 0 ? (
        <div className="app-card bg-gradient-to-br from-white via-white to-[#EEF7FF] p-4 md:p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-600">묶음 QR</p>
              <h2 className="mt-1 text-xl font-semibold text-brand-900">7월 교직원 필수연수 묶음</h2>
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
    </div>
  );
}
