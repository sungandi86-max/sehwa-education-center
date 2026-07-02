import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PrintPageButton } from "@/components/print-page-button";
import { QrDisplayCode } from "@/components/qr-display-code";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

const PRODUCTION_ORIGIN = "https://sehwa-education-center.vercel.app";

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

export default async function GroupQrPrintPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const events = await appsScriptClient.getGroupTrainings(groupId).catch(() => null);

  if (!events) {
    return <PrintLoadError />;
  }

  if (events.length === 0) {
    notFound();
  }

  const attendanceUrl = `${PRODUCTION_ORIGIN}/qr/group/${groupId}`;
  const firstEvent = events[0];
  const lastEvent = events[events.length - 1];
  const groupTitle = events.length === 1 ? firstEvent.제목 : `${firstEvent.제목} 외 ${events.length - 1}개 연수`;
  const dateText = `${formatDateOnly(firstEvent.시작일시)} ${formatTimeOnly(firstEvent.시작일시)} - ${formatTimeOnly(lastEvent.종료일시)}`;
  const placeText = Array.from(new Set(events.map((event) => event.장소).filter(Boolean))).join(", ");

  return (
    <div className="mx-auto max-w-4xl print:max-w-none">
      <div className="print-actions mb-5 flex items-center justify-between gap-3 print:hidden">
        <Link href="/" className="btn-secondary">
          <ArrowLeft size={17} />
          홈으로
        </Link>
        <PrintPageButton />
      </div>

      <article className="qr-print-page mx-auto flex min-h-[277mm] max-w-[190mm] flex-col bg-white px-9 py-8 text-center shadow-soft print:min-h-0 print:max-w-none print:px-0 print:py-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-5 print:pb-3">
          <p className="text-xl font-extrabold text-brand-900 print:text-lg">세화 교직원 교육센터</p>
          <p className="mt-5 text-sm font-bold text-brand-600 print:mt-3 print:text-[10pt]">묶음 연수 QR</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-brand-900 print:text-[26pt]">{groupTitle}</h1>
        </header>

        <section className="grid gap-3 border-b border-slate-200 py-5 text-left print:py-3">
          <InfoRow label="교육일시" value={dateText} />
          <InfoRow label="장소" value={placeText || "장소 미정"} />
        </section>

        <section className="border-b border-slate-200 py-5 text-left print:py-3">
          <p className="text-sm font-extrabold text-brand-700 print:text-[10pt]">교육 목록</p>
          <div className="mt-3 grid gap-2 print:mt-2">
            {events.map((event, index) => (
              <div key={event.eventId} className="rounded-2xl border border-slate-200 px-4 py-3 print:rounded-none print:px-3 print:py-2">
                <p className="text-xs font-bold text-brand-600 print:text-[8pt]">{index + 1}번째 교육</p>
                <p className="mt-1 font-extrabold text-brand-900 print:text-[11pt]">{event.제목}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500 print:text-[9pt]">
                  {formatDateOnly(event.시작일시)} {formatTimeOnly(event.시작일시)} - {formatTimeOnly(event.종료일시)} · {event.장소}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-1 flex-col items-center justify-center py-5 print:py-4">
          <div className="w-full max-w-[118mm] print:max-w-[116mm]">
            <QrDisplayCode value={attendanceUrl} large />
          </div>
          <p className="mt-3 break-all text-xs font-semibold text-slate-500 print:text-[9pt]">{attendanceUrl}</p>
        </section>

        <footer className="border-t border-slate-200 pt-5 print:pt-3">
          <p className="text-2xl font-extrabold leading-snug text-brand-900 print:text-[19pt]">
            휴대폰 카메라로 QR을 스캔하여 출석해주세요.
          </p>
          <p className="mt-2 text-lg font-bold leading-snug text-slate-600 print:text-[13pt]">
            한 번의 전자서명으로 아래 교육에 출석 처리됩니다.
          </p>
        </footer>
      </article>
    </div>
  );
}

function PrintLoadError() {
  return (
    <div className="mx-auto max-w-2xl print:hidden">
      <section className="quiet-card p-6 text-center">
        <h1 className="text-2xl font-semibold text-brand-900">정보를 불러오지 못했습니다.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">잠시 후 다시 시도해주세요. 계속 문제가 있으면 교육 담당자에게 문의해주세요.</p>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[88px_1fr] items-start gap-4 text-base print:grid-cols-[24mm_1fr] print:text-[12pt]">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="font-extrabold text-brand-900">{value}</span>
    </div>
  );
}
