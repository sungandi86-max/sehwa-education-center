import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
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

  return (
    <div className="mx-auto min-h-[calc(100vh-3rem)] max-w-4xl rounded-md bg-white p-5 shadow-soft print:min-h-0 print:max-w-none print:rounded-none print:p-0 print:shadow-none">
      <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
        <Link
          href="/"
          className="rounded-md border border-slateblue-900 bg-white px-4 py-2 text-sm font-semibold text-slateblue-900 hover:bg-brand-50"
        >
          ← 홈으로
        </Link>
        <PrintPageButton />
      </div>

      <article className="mx-auto flex min-h-[270mm] max-w-[190mm] flex-col rounded-md border border-slate-200 bg-white px-8 py-8 text-center print:min-h-[273mm] print:max-w-none print:border-0 print:px-0 print:py-0">
        <header className="border-b border-slate-200 pb-6">
          <div className="flex justify-center">
            <BrandMark />
          </div>
          <h1 className="mt-7 text-3xl font-bold leading-tight text-slateblue-900">{event.제목}</h1>
          <div className="mt-5 grid gap-2 text-base font-semibold text-slate-600">
            <p>
              {formatDateOnly(event.시작일시)} {formatTimeOnly(event.시작일시)} - {formatTimeOnly(event.종료일시)}
            </p>
            <p>{event.장소}</p>
            <p>{event.담당부서}</p>
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-10">
          <div className="w-full max-w-[118mm] print:max-w-[120mm]">
            <QrDisplayCode value={attendanceUrl} large />
          </div>
          <p className="mt-8 break-all text-sm font-semibold text-slate-500 print:text-xs">{attendanceUrl}</p>
        </section>

        <footer className="border-t border-slate-200 pt-7">
          <p className="text-3xl font-bold leading-snug text-slateblue-900">
            휴대폰 카메라로 QR을 스캔하여
            <br />
            출석해주세요.
          </p>
        </footer>
      </article>
    </div>
  );
}
