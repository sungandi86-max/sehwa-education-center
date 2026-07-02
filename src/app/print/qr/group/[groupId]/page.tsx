import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
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
  const events = await appsScriptClient.getGroupTrainings(groupId);

  if (events.length === 0) {
    notFound();
  }

  const attendanceUrl = `${PRODUCTION_ORIGIN}/qr/group/${groupId}`;
  const firstEvent = events[0];
  const lastEvent = events[events.length - 1];
  const groupTitle = `${firstEvent.제목} 외 ${events.length - 1}개 연수`;

  return (
    <div className="mx-auto max-w-4xl print:max-w-none">
      <div className="mb-5 flex items-center justify-between gap-3 print:hidden">
        <Link href="/qr" className="btn-secondary">
          <ArrowLeft size={17} />
          QR 출석으로
        </Link>
        <PrintPageButton />
      </div>

      <article className="qr-print-page mx-auto flex min-h-[270mm] max-w-[190mm] flex-col bg-white px-8 py-8 text-center shadow-soft print:min-h-[273mm] print:max-w-none print:px-0 print:py-0 print:shadow-none">
        <header className="border-b border-slateblue-100 pb-6">
          <p className="text-lg font-extrabold text-brand-900">세화 교직원 교육센터</p>
          <p className="mt-7 text-sm font-semibold text-brand-600">묶음 교육 QR</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-brand-900">{groupTitle}</h1>
          <div className="mt-5 grid gap-2 text-base font-bold text-slate-600">
            <p>
              {formatDateOnly(firstEvent.시작일시)} {formatTimeOnly(firstEvent.시작일시)} - {formatTimeOnly(lastEvent.종료일시)}
            </p>
            <p>{firstEvent.장소}</p>
          </div>
        </header>

        <section className="py-7 text-left">
          <p className="text-sm font-bold text-brand-700">교육 목록</p>
          <div className="mt-3 grid gap-2">
            {events.map((event, index) => (
              <div key={event.eventId} className="rounded-2xl border border-slateblue-100 px-4 py-3">
                <p className="text-xs font-bold text-brand-600">{index + 1}번째 교육</p>
                <p className="mt-1 font-bold text-brand-900">{event.제목}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDateOnly(event.시작일시)} {formatTimeOnly(event.시작일시)} - {formatTimeOnly(event.종료일시)} · {event.장소}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-1 flex-col items-center justify-center py-4">
          <div className="w-full max-w-[105mm] print:max-w-[112mm]">
            <QrDisplayCode value={attendanceUrl} large />
          </div>
        </section>

        <footer className="border-t border-slateblue-100 pt-7">
          <p className="text-3xl font-extrabold leading-snug text-brand-900">
            휴대폰 카메라로 QR을 스캔하여
            <br />
            출석해주세요.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-900 print:hidden">
            <Printer size={16} />
            Ctrl+P로 바로 인쇄할 수 있습니다.
          </p>
        </footer>
      </article>
    </div>
  );
}
