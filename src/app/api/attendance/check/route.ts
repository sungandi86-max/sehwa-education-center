import { NextResponse } from "next/server";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    mode?: "single" | "group";
    eventId?: string;
    eventIds?: string[];
    groupId?: string;
    staffId?: string;
  };

  if (!body.staffId || (!body.eventId && !body.eventIds?.length && !body.groupId)) {
    return NextResponse.json({ message: "교육 정보와 교직원 정보가 필요합니다." }, { status: 400 });
  }

  try {
    const isGroup = body.mode === "group" || Boolean(body.eventIds?.length || body.groupId);
    const result = await appsScriptClient.checkAttendanceEligibility({
      mode: isGroup ? "group" : "single",
      eventId: isGroup ? undefined : body.eventId,
      eventIds: isGroup ? body.eventIds : undefined,
      groupId: isGroup ? body.groupId : undefined,
      staffId: body.staffId
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch {
    return NextResponse.json(
      { message: "출석 가능 여부를 확인하지 못했습니다. 잠시 후 다시 시도해주세요." },
      { status: 502 }
    );
  }
}
