import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QrAttendanceConfirm, type QrAttendanceEventInfo } from "@/components/qr-attendance-confirm";
import { appsScriptClient } from "@/lib/api/appsScriptClient";
import type { TrainingEventRow } from "@/types/training";

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
    hour12: false,
    timeZone: "Asia/Seoul"
  }).format(new Date(value));

const formatSignatureWindow = (openAt?: string, closeAt?: string) => {
  if (openAt && closeAt) return `${formatTimeOnly(openAt)} ~ ${formatTimeOnly(closeAt)}`;
  if (openAt) return `${formatTimeOnly(openAt)}부터`;
  if (closeAt) return `${formatTimeOnly(closeAt)}까지`;
  return "";
};

const toQrEvent = (event: TrainingEventRow): QrAttendanceEventInfo => ({
  eventId: event.eventId,
  title: event.제목,
  subtitle: event.attendanceSubtitle || "연수 참여 전자서명",
  date: formatDateOnly(event.시작일시),
  time: `${formatTimeOnly(event.시작일시)} - ${formatTimeOnly(event.종료일시)}`,
  location: event.장소,
  department: event.담당부서,
  signatureWindow: formatSignatureWindow(event.signatureOpenAt, event.signatureCloseAt),
  notice: event.attendanceNotice
});

export default async function GroupQrAttendancePage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const events = await appsScriptClient.getGroupTrainings(groupId).catch(() => null);

  if (!events) {
    return <GroupQrLoadError />;
  }

  if (events.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md space-y-4 md:max-w-2xl">
      <QrAppBar title="묶음 QR 출석" />
      <QrAttendanceConfirm groupId={groupId} events={events.map(toQrEvent)} />
    </div>
  );
}

function GroupQrLoadError() {
  return (
    <div className="mx-auto max-w-md space-y-4 md:max-w-2xl">
      <QrAppBar title="묶음 QR 출석" />
      <section className="app-card p-6 text-center">
        <h1 className="text-2xl font-semibold text-brand-900">정보를 불러오지 못했습니다.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">잠시 후 다시 시도해주세요. 계속 문제가 있으면 교육 담당자에게 문의해주세요.</p>
      </section>
    </div>
  );
}

function QrAppBar({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <Link href="/qr" className="flex size-11 items-center justify-center rounded-2xl bg-white text-brand-900 shadow-[0_10px_24px_rgba(23,59,115,0.06)] ring-1 ring-slateblue-100">
        <ArrowLeft size={21} />
        <span className="sr-only">QR 출석으로 돌아가기</span>
      </Link>
      <h1 className="text-lg font-semibold text-brand-900">{title}</h1>
      <div className="size-11" aria-hidden />
    </div>
  );
}
