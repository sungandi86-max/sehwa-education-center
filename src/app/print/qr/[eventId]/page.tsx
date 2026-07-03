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
    <div className="mx-auto max-w-4xl print:max-w-none">
      <div className="print-actions mb-5 flex items-center justify-between gap-3 print:hidden">
        <Link href="/" className="btn-secondary min-h-12">
          <ArrowLeft size={17} />
          홈
        </Link>
        <div className="fixed right-5 top-5 z-40">
          <PrintPageButton />
        </div>
      </div>

      <article className="qr-print-page mx-auto flex min-h-[277mm] max-w-[190mm] flex-col gap-5 rounded-[36px] border border-slateblue-100 bg-gradient-to-b from-white to-slateblue-50/60 p-6 shadow-lift print:min-h-0 print:max-w-none print:gap-4 print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none">
        <section className="rounded-[32px] border border-slateblue-100 bg-white p-6 text-left shadow-[0_18px_48px_rgba(23,59,115,0.07)] print:rounded-[24px] print:p-5 print:shadow-none">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-brand-900 to-brand-500 text-white">
              <CalendarDays size={27} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-500">{APP_CONFIG.appName}</p>
              <h1 className="mt-2 text-[2.1rem] font-semibold leading-tight tracking-tight text-brand-900 print:text-[27pt]">
                {event.제목}
              </h1>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoCard icon={<CalendarDays size={19} />} label="일자" value={dateText} />
            <InfoCard icon={<Clock3 size={19} />} label="시간" value={timeText} />
            <InfoCard icon={<MapPin size={19} />} label="장소" value={event.장소} />
            <InfoCard icon={<Building2 size={19} />} label="담당부서" value={event.담당부서} />
          </div>
        </section>

        <section className="flex flex-1 flex-col items-center justify-center rounded-[34px] border border-slateblue-100 bg-white p-7 shadow-[0_20px_56px_rgba(23,59,115,0.08)] print:rounded-[24px] print:p-6 print:shadow-none">
          <div className="w-full max-w-[136mm] print:max-w-[136mm]">
            <QrDisplayCode value={attendanceUrl} large />
          </div>
          <p className="mt-4 break-all text-xs font-semibold text-slate-400 print:text-[8.5pt]">{attendanceUrl}</p>
        </section>

        <section className="rounded-[30px] border border-brand-100 bg-gradient-to-br from-white to-brand-50 p-6 text-center shadow-[0_16px_40px_rgba(23,59,115,0.055)] print:rounded-[22px] print:p-5 print:shadow-none">
          <p className="text-[1.9rem] font-semibold leading-snug text-brand-900 print:text-[23pt]">
            휴대폰 카메라로 QR을 스캔하여 출석해주세요.
          </p>
        </section>

        <footer className="mt-auto flex items-center justify-between gap-4 rounded-[26px] bg-white/80 px-5 py-4 text-left text-sm font-semibold text-slate-500 ring-1 ring-slateblue-100 print:rounded-none print:bg-white print:px-0 print:py-2 print:ring-0">
          <div>
            <p className="text-brand-900">{APP_CONFIG.appName}</p>
            <p className="mt-1">{APP_CONFIG.schoolName}</p>
          </div>
          <p className="text-right">문의: 담당부서</p>
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

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] bg-slateblue-50 px-4 py-3 print:rounded-[16px]">
      <span className="text-brand-600">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-0.5 text-base font-semibold text-brand-900 print:text-[12pt]">{value}</p>
      </div>
    </div>
  );
}
