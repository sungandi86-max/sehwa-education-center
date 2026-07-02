import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";
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

      <article className="qr-print-page mx-auto flex min-h-[277mm] max-w-[190mm] flex-col bg-white px-10 py-10 text-center shadow-soft print:min-h-0 print:max-w-none print:px-0 print:py-0 print:shadow-none">
        <header className="print-header">
          <p className="text-lg font-bold text-slate-500 print:text-[13pt]">{APP_CONFIG.appName}</p>
          <p className="mt-3 text-sm font-bold text-brand-600 print:mt-2 print:text-[10pt]">묶음 연수 QR</p>
          <h1 className="mt-3 text-[2.35rem] font-extrabold leading-tight text-brand-900 print:text-[27pt]">{groupTitle}</h1>
        </header>

        <section className="print-meta mx-auto mt-6 grid w-full max-w-[150mm] gap-3 text-left print:mt-4">
          <InfoRow label="일시" value={dateText} />
          <InfoRow label="장소" value={placeText || "장소 미정"} />
          <InfoRow label="담당부서" value={firstEvent.담당부서 || "담당부서"} />
        </section>

        <section className="mt-5 text-left print:mt-4">
          <p className="text-sm font-extrabold text-brand-700 print:text-[10pt]">이번 QR로 출석 처리되는 교육</p>
          <div className="mt-3 grid gap-1.5 print:mt-2">
            {events.map((event, index) => (
              <div key={event.eventId} className="grid grid-cols-[26px_1fr] items-start gap-2 rounded-xl border border-slate-200 px-3 py-2 print:rounded-none print:px-2 print:py-1.5">
                <span className="font-bold text-brand-600 print:text-[9pt]">{index + 1}</span>
                <p className="font-extrabold text-brand-900 print:text-[10.5pt]">{event.제목}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-1 flex-col items-center justify-center py-5 print:py-4">
          <div className="w-full max-w-[126mm] print:max-w-[126mm]">
            <QrDisplayCode value={attendanceUrl} large />
          </div>
          <p className="mt-4 break-all text-xs font-semibold text-slate-400 print:text-[8.5pt]">{attendanceUrl}</p>
        </section>

        <footer className="print-footer">
          <p className="text-[1.85rem] font-extrabold leading-snug text-brand-900 print:text-[22pt]">
            휴대폰 카메라로 QR을 스캔하여 출석하세요.
          </p>
          <p className="mt-3 text-base font-semibold text-slate-500 print:text-[11pt]">한 번의 전자서명으로 위 교육에 출석 처리됩니다.</p>
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
    <div className="grid grid-cols-[84px_1fr] items-start gap-4 border-b border-slate-200 pb-3 text-base last:border-b-0 print:grid-cols-[24mm_1fr] print:pb-2 print:text-[13pt]">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="font-extrabold text-brand-900">{value}</span>
    </div>
  );
}
