import { NextResponse } from "next/server";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: unknown };
    const code = typeof body.code === "string" ? body.code : "";
    const result = await appsScriptClient.verifyAdminAccessCode(code);

    return NextResponse.json({
      success: true,
      data: {
        ok: result.ok,
        adminCodeHint: result.adminCodeHint ?? ""
      }
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "관리자 인증을 확인하지 못했습니다."
      },
      { status: 500 }
    );
  }
}
