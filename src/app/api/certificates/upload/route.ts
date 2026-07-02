import { NextResponse } from "next/server";
import { appsScriptClient } from "@/lib/api/appsScriptClient";
import type { UploadCertificateInput } from "@/lib/api/appsScriptAdapter";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<UploadCertificateInput>;

  if (!body.eventId) {
    return NextResponse.json({ success: false, error: "교육을 선택해주세요." }, { status: 400 });
  }

  if (!body.staffId || !body.staffName) {
    return NextResponse.json({ success: false, error: "본인 확인 후 제출해주세요." }, { status: 400 });
  }

  if (!body.fileName) {
    return NextResponse.json({ success: false, error: "이수증 파일을 선택해주세요." }, { status: 400 });
  }

  try {
    const result = await appsScriptClient.uploadCertificate({
      eventId: body.eventId,
      staffId: body.staffId,
      staffName: body.staffName,
      name: body.staffName,
      department: body.department,
      fileName: body.fileName,
      fileBase64: body.fileBase64,
      fileId: body.fileId ?? `placeholder-${Date.now()}`,
      fileUrl: body.fileUrl ?? "placeholder://certificate-upload",
      certificateNumber: body.certificateNumber,
      trainingTitle: body.trainingTitle,
      completedAt: body.completedAt,
      trainingHours: body.trainingHours,
      issuer: body.issuer,
      rawText: body.rawText,
      confidence: body.confidence,
      aiReviewStatus: body.aiReviewStatus ?? "pending",
      memo: body.memo
    });

    const status = result.ok ? 200 : 502;

    return NextResponse.json(
      {
        success: result.ok,
        data: result,
        error: result.ok ? undefined : result.message || "이수증 제출에 실패했습니다. 잠시 후 다시 시도해주세요."
      },
      { status }
    );
  } catch {
    return NextResponse.json({ success: false, error: "이수증 제출에 실패했습니다. 잠시 후 다시 시도해주세요." }, { status: 502 });
  }
}
