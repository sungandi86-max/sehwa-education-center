import { NextResponse } from "next/server";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { eventId?: string };
  const eventId = body.eventId?.trim();

  if (!eventId) {
    return NextResponse.json({ message: "교육 정보를 찾을 수 없습니다." }, { status: 400 });
  }

  try {
    const data = await appsScriptClient.downloadAttendanceReport(eventId);

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { message: "최종 서명부를 생성하지 못했습니다. 잠시 후 다시 시도해주세요." },
      { status: 502 }
    );
  }
}
