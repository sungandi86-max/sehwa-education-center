import { NextResponse } from "next/server";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId")?.trim();

  if (!eventId) {
    return NextResponse.json({ message: "교육 정보를 찾을 수 없습니다." }, { status: 400 });
  }

  try {
    const data = await appsScriptClient.getAttendanceSummary(eventId);

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { message: "출석 현황을 불러오지 못했습니다. 잠시 후 다시 시도해주세요." },
      { status: 502 }
    );
  }
}
