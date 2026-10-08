import { NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-data";

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: adminStore.auditLogs });
  } catch (error) {
    console.error("GET /api/audit error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 },
    );
  }
}
