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

export default async function QrPrintPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const events = await appsScriptClient.getTrainings().catch(() => null);

  if (!events) {
    return <PrintLoadError />;
  }

  const event = events.find((item) => item.eventId === eventId);

  if (!event) {
    notFound();
  }

  const attendanceUrl = `${PRODUCTION_ORIGIN}/qr/${event.eventId}`;
  const dateText = `${formatDateOnly(event.시작일시)} ${formatTimeOnly(event.시작일시)} - ${formatTimeOnly(event.종료일시)}`;

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
          <h1 className="mt-4 text-[2.65rem] font-extrabold leading-tight text-brand-900 print:mt-3 print:text-[30pt]">
            {event.제목}
          </h1>
        </header>

        <section className="print-meta mx-auto mt-7 grid w-full max-w-[150mm] gap-3 text-left print:mt-5">
          <InfoRow label="일시" value={dateText} />
          <InfoRow label="장소" value={event.장소} />
          <InfoRow label="담당부서" value={event.담당부서} />
        </section>

        <section className="flex flex-1 flex-col items-center justify-center py-8 print:py-6">
          <div className="w-full max-w-[142mm] print:max-w-[142mm]">
            <QrDisplayCode value={attendanceUrl} large />
          </div>
          <p className="mt-5 break-all text-xs font-semibold text-slate-400 print:mt-4 print:text-[8.5pt]">{attendanceUrl}</p>
        </section>

        <footer className="print-footer">
          <p className="text-[2rem] font-extrabold leading-snug text-brand-900 print:text-[24pt]">
            휴대폰 카메라로 QR을 스캔하여 출석해주세요.
          </p>
          <p className="mt-3 text-base font-semibold text-slate-500 print:text-[11pt]">문의: 담당부서</p>
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
