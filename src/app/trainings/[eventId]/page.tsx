import { redirect } from "next/navigation";

export default async function TrainingDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  redirect(`/trainings/${eventId}/qr`);
}
