import { CertificateUploadClient } from "@/components/certificate-upload-client";
import { PageHeader } from "@/components/ui";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

export default async function UploadPage() {
  const events = await appsScriptClient.getTrainings();
  const uploadableEvents = events.filter((event) => {
    const raw = event as unknown as Record<string, unknown>;
    const status = String(event.상태 ?? raw["상태"] ?? "").trim();
    const uploadType = String(raw["제출유형"] ?? raw["submissionType"] ?? "").trim();
    const enabled = String(raw["사용여부"] ?? raw["enabled"] ?? "사용").trim();
    const statusOk = status === "active" || status === "scheduled" || status === "진행중" || status === "예정";
    const typeOk = !uploadType || uploadType === "이수증업로드" || uploadType === "certificateUpload";
    const enabledOk = enabled !== "미사용" && enabled !== "FALSE" && enabled !== "false";

    return statusOk && typeOk && enabledOk;
  });

  return (
    <div className="space-y-8">
      <PageHeader title="이수증 제출" description="본인 확인 후 외부 연수 또는 온라인 연수 이수증을 제출합니다." />
      <CertificateUploadClient events={uploadableEvents.length > 0 ? uploadableEvents : events} />
    </div>
  );
}
