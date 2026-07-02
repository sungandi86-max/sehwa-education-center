import { NextResponse } from "next/server";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    mode?: "single" | "group";
    eventId?: string;
    eventIds?: string[];
    groupId?: string;
    staffId?: string;
    staffName?: string;
    department?: string;
    position?: string;
    signature?: string;
  };

  if (!body.staffId || (!body.eventId && !body.eventIds?.length && !body.groupId)) {
    return NextResponse.json({ message: "교육 정보와 교직원 정보가 필요합니다." }, { status: 400 });
  }

  if (!body.signature) {
    return NextResponse.json({ message: "전자서명이 필요합니다." }, { status: 400 });
  }

  const isGroup = body.mode === "group" || Boolean(body.eventIds?.length);
  const result = await appsScriptClient.submitQrAttendance({
    mode: isGroup ? "group" : "single",
    eventId: isGroup ? undefined : body.eventId,
    eventIds: isGroup ? body.eventIds : undefined,
    groupId: isGroup ? body.groupId ?? "custom" : undefined,
    staffId: body.staffId,
    staffName: body.staffName,
    department: body.department,
    position: body.position,
    signature: body.signature
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    ...result,
    message: result.message
  });
}
