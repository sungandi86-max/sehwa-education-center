import { redirect } from "next/navigation";

export default async function QrAttendancePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  redirect(`/qr/${eventId}`);
}
