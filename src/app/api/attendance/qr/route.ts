import { NextResponse } from "next/server";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    eventId?: string;
    staffId?: string;
    signature?: string;
  };

  if (!body.eventId || !body.staffId) {
    return NextResponse.json({ message: "교육 정보와 교직원 정보가 필요합니다." }, { status: 400 });
  }

  const result = await appsScriptClient.submitQrAttendance(body.eventId, body.staffId);

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    attendanceId: result.attendanceId,
    message: result.message
  });
}
