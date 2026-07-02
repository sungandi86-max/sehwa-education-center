import { notFound } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
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

export default async function QrDisplayPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const events = await appsScriptClient.getTrainings();
  const event = events.find((item) => item.eventId === eventId);

  if (!event) {
    notFound();
  }

  const attendanceUrl = `${PRODUCTION_ORIGIN}/qr/${event.eventId}`;

  return (
    <div className="min-h-[calc(100vh-3rem)] rounded-md bg-white px-6 py-8 shadow-soft md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-start md:justify-between">
          <BrandMark />
          <div className="rounded-md bg-slateblue-900 px-4 py-2 text-sm font-bold text-white">QR 출석 화면</div>
        </header>

        <section className="text-center">
          <p className="text-base font-bold text-teal-700">{event.담당부서}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-slateblue-900 md:text-5xl">{event.제목}</h1>
          <div className="mt-5 flex flex-wrap justify-center gap-3 text-base font-semibold text-slate-600 md:text-lg">
            <span>{formatDateOnly(event.시작일시)}</span>
            <span>{formatTimeOnly(event.시작일시)} - {formatTimeOnly(event.종료일시)}</span>
            <span>{event.장소}</span>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <QrDisplayCode value={attendanceUrl} />
          <div className="rounded-md border border-teal-100 bg-teal-50 p-6 text-center lg:text-left">
            <p className="text-2xl font-bold text-slateblue-900">휴대폰 카메라로 QR 코드를 스캔하여 출석해주세요.</p>
            <p className="mt-4 break-all rounded-md bg-white p-4 text-sm font-semibold text-slate-600">{attendanceUrl}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              QR을 스캔하면 교직원 본인 확인 후 출석 확인 화면으로 이동합니다.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
