import { notFound } from "next/navigation";
import { QrAttendanceConfirm, type QrAttendanceEventInfo } from "@/components/qr-attendance-confirm";
import { PageHeader } from "@/components/ui";
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
    timeZone: "Asia/Seoul"
  }).format(new Date(value));

const toQrEvent = (event: TrainingEventRow): QrAttendanceEventInfo => ({
  eventId: event.eventId,
  title: event.제목,
  date: formatDateOnly(event.시작일시),
  time: `${formatTimeOnly(event.시작일시)} - ${formatTimeOnly(event.종료일시)}`,
  location: event.장소,
  department: event.담당부서
});

export default async function GroupQrAttendancePage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const events = await appsScriptClient.getGroupTrainings(groupId);

  if (events.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader title="묶음 QR 출석" description="한 번의 본인 확인과 전자서명으로 여러 교육 출석을 처리합니다." />
      <QrAttendanceConfirm groupId={groupId} events={events.map(toQrEvent)} />
    </div>
  );
}
