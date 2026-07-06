import { NextResponse } from "next/server";
import { appsScriptClient } from "@/lib/api/appsScriptClient";

export async function GET() {
  try {
    const config = await appsScriptClient.getAdminLoginConfig();

    return NextResponse.json({
      success: true,
      data: {
        adminCodeHint: config.adminCodeHint ?? ""
      }
    });
  } catch {
    return NextResponse.json({
      success: true,
      data: {
        adminCodeHint: ""
      }
    });
  }
}
