import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/lib/config";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    staffId?: string;
    staffName?: string;
    department?: string;
    year?: number;
  };

  if (!body.staffName?.trim()) {
    return NextResponse.json({ error: "성명을 입력해주세요." }, { status: 400 });
  }

  try {
    const result = await appsScriptClient.lookupMyTrainingStatus({
      staffId: body.staffId,
      staffName: body.staffName,
      department: body.department,
      year: body.year ?? APP_CONFIG.currentYear
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "이수현황을 불러오지 못했습니다. 잠시 후 다시 시도해주세요." }, { status: 502 });
  }
}
