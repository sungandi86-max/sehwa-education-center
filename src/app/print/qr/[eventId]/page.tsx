import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, Clock3, MapPin } from "lucide-react";
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
  const dateText = formatDateOnly(event.시작일시);
  const timeText = `${formatTimeOnly(event.시작일시)} - ${formatTimeOnly(event.종료일시)}`;

  return (
    <div className="mx-auto max-w-3xl print:max-w-none">
      <div className="print-actions mb-5 flex items-center justify-between gap-3 print:hidden">
        <Link href="/" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-slateblue-100 bg-white px-5 text-sm font-semibold text-brand-900 shadow-[0_12px_30px_rgba(23,59,115,0.08)] transition hover:-translate-y-0.5 hover:bg-brand-50">
          <ArrowLeft size={17} />
          홈
        </Link>
        <div className="fixed right-5 top-5 z-40">
          <PrintPageButton />
        </div>
      </div>

      <article className="qr-print-page mx-auto overflow-hidden rounded-[40px] border border-white/80 bg-white/[0.82] p-4 shadow-[0_30px_90px_rgba(23,59,115,0.13)] backdrop-blur print:overflow-visible print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none">
        <div className="flex flex-col gap-4 rounded-[34px] border border-slateblue-100 bg-gradient-to-b from-white via-white to-slateblue-50/70 p-5 print:rounded-[28px] print:p-5">
          <section className="rounded-[32px] border border-slateblue-100 bg-white p-5 text-left shadow-[0_18px_48px_rgba(23,59,115,0.07)] print:rounded-[24px] print:p-5 print:shadow-none">
            <span className="inline-flex rounded-full bg-softpurple-50 px-3 py-1.5 text-xs font-semibold text-[#5E4BE8] ring-1 ring-softpurple-100">
              QR 출석용
            </span>
            <h1 className="mt-4 text-[2.15rem] font-semibold leading-tight tracking-tight text-brand-900 print:text-[28pt]">
              {event.제목}
            </h1>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoCard icon={<CalendarDays size={19} />} label="일자" value={dateText} />
              <InfoCard icon={<Clock3 size={19} />} label="시간" value={timeText} />
              <InfoCard icon={<MapPin size={19} />} label="장소" value={event.장소} />
              <InfoCard icon={<Building2 size={19} />} label="담당부서" value={event.담당부서} />
            </div>
          </section>

          <section className="rounded-[34px] border border-slateblue-100 bg-white p-6 text-center shadow-[0_20px_56px_rgba(23,59,115,0.08)] print:rounded-[26px] print:p-6 print:shadow-none">
            <div className="mx-auto w-full max-w-[420px] print:max-w-[132mm]">
              <QrDisplayCode value={attendanceUrl} large />
            </div>
            <p className="mt-4 break-all text-xs font-semibold text-slate-400 print:text-[8.5pt]">{attendanceUrl}</p>
          </section>

          <section className="rounded-[30px] border border-brand-100 bg-gradient-to-br from-white via-brand-50 to-softpurple-50 p-5 text-center shadow-[0_16px_40px_rgba(23,59,115,0.055)] print:rounded-[22px] print:p-5 print:shadow-none">
            <p className="text-[1.55rem] font-semibold leading-snug text-brand-900 print:text-[21pt]">
              휴대폰 카메라로
              <br />
              QR을 스캔하여 출석해주세요.
            </p>
            <p className="mt-3 text-base font-semibold leading-6 text-slate-500 print:text-[11pt]">
              전자서명 후 출석이 저장됩니다.
            </p>
          </section>

          <footer className="flex items-center justify-between gap-4 rounded-[26px] bg-white/[0.84] px-5 py-4 text-left text-sm font-semibold text-slate-500 ring-1 ring-slateblue-100 print:rounded-[18px] print:bg-white print:px-4 print:py-3">
            <div>
              <p className="text-brand-900">{APP_CONFIG.appName}</p>
              <p className="mt-1">{APP_CONFIG.schoolName}</p>
            </div>
            <p className="text-right">문의: 담당부서</p>
          </footer>
        </div>
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

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-[22px] bg-slateblue-50 px-4 py-3 ring-1 ring-slateblue-100 print:rounded-[16px]">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[14px] bg-white text-brand-600 shadow-[0_8px_18px_rgba(23,59,115,0.06)]">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-0.5 text-base font-semibold text-brand-900 print:text-[12pt]">{value}</p>
      </div>
    </div>
  );
}
