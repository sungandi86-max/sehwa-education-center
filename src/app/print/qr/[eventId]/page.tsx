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

export default async function QrPrintPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const events = await appsScriptClient.getTrainings();
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

      <article className="qr-print-page mx-auto flex min-h-[277mm] max-w-[190mm] flex-col bg-white px-9 py-8 text-center shadow-soft print:min-h-0 print:max-w-none print:px-0 print:py-0 print:shadow-none">
        <header className="border-b border-slate-200 pb-6 print:pb-4">
          <p className="text-xl font-extrabold text-brand-900 print:text-lg">세화 교직원 교육센터</p>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight text-brand-900 print:mt-4 print:text-[28pt]">
            {event.제목}
          </h1>
        </header>

        <section className="grid gap-3 border-b border-slate-200 py-6 text-left print:py-4">
          <InfoRow label="교육일시" value={dateText} />
          <InfoRow label="장소" value={event.장소} />
          <InfoRow label="담당부서" value={event.담당부서} />
        </section>

        <section className="flex flex-1 flex-col items-center justify-center py-8 print:py-5">
          <div className="w-full max-w-[132mm] print:max-w-[128mm]">
            <QrDisplayCode value={attendanceUrl} large />
          </div>
          <p className="mt-4 break-all text-xs font-semibold text-slate-500 print:mt-3 print:text-[9pt]">{attendanceUrl}</p>
        </section>

        <footer className="border-t border-slate-200 pt-6 print:pt-4">
          <p className="text-3xl font-extrabold leading-snug text-brand-900 print:text-[23pt]">
            휴대폰 카메라로 QR을 스캔하여 출석해주세요.
          </p>
        </footer>
      </article>
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
