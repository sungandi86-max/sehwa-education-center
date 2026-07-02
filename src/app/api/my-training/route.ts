import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/lib/config";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    staffName?: string;
    department?: string;
    year?: number;
  };

  if (!body.staffName?.trim()) {
    return NextResponse.json({ error: "성명을 입력해주세요." }, { status: 400 });
  }

  const result = await appsScriptClient.lookupMyTrainingStatus({
    staffName: body.staffName,
    department: body.department,
    year: body.year ?? APP_CONFIG.currentYear
  });

  return NextResponse.json(result);
}
