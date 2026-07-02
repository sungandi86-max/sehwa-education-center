import { notFound } from "next/navigation";
import { QrAttendanceConfirm } from "@/components/qr-attendance-confirm";
import { PageHeader } from "@/components/ui";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

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

export default async function QrAttendancePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const events = await appsScriptClient.getTrainings();
  const event = events.find((item) => item.eventId === eventId);

  if (!event) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader title="QR 출석" description="교육 정보를 확인하고 전자서명 후 출석을 저장합니다." />

      <QrAttendanceConfirm
        event={{
          eventId: event.eventId,
          title: event.제목,
          date: formatDateOnly(event.시작일시),
          time: `${formatTimeOnly(event.시작일시)} - ${formatTimeOnly(event.종료일시)}`,
          location: event.장소,
          department: event.담당부서
        }}
      />
    </div>
  );
}
