import { NextResponse } from "next/server";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    department?: string;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ success: false, error: "성명을 입력해주세요." }, { status: 400 });
  }

  try {
    const staff = await appsScriptClient.findStaff({
      name: body.name,
      department: body.department || undefined
    });

    return NextResponse.json({
      success: true,
      data: staff.map((member) => ({
        staffId: member.교직원ID,
        staffName: member.성명,
        department: member.소속부서,
        position: member.직위,
        email: member.이메일
      }))
    });
  } catch {
    return NextResponse.json({ success: false, error: "교직원 조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}
