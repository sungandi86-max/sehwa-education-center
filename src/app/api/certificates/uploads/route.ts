import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/lib/config";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ success: false, error: "조회할 성명 또는 교직원ID가 필요합니다." }, { status: 400 });
  }

  try {
    const uploads = await appsScriptClient.getMyUploads(query, APP_CONFIG.currentYear);

    return NextResponse.json({
      success: true,
      data: uploads
    });
  } catch {
    return NextResponse.json({ success: false, error: "제출 상태를 불러오지 못했습니다. 잠시 후 다시 시도해주세요." }, { status: 502 });
  }
}
