import { catalogDb } from "@/lib/catalog-server";
import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-data";
import { customRequestSchema } from "@/lib/validations";
import type { CustomRequest } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const snapshot = await catalogDb().collection("custom_requests").get();
    let list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as CustomRequest).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    adminStore.customRequests = list;

    if (status && status !== "all") {
      list = list.filter((r) => r.status === status);
    }

    return NextResponse.json({ success: true, data: list }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/custom-requests error:", error);
    return NextResponse.json({ success: false, error: "Custom requests are temporarily unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = customRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const newRequest: CustomRequest = {
      id: `req_${Date.now()}`,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      designUploadUrls: data.designUploadUrls,
      sizeWidth: data.sizeWidth,
      sizeHeight: data.sizeHeight,
      sizeLabel:
        data.sizeLabel ||
        (data.sizeWidth && data.sizeHeight
          ? `${data.sizeWidth}×${data.sizeHeight}`
          : "Custom Size"),
      framePreference: data.framePreference,
      notes: data.notes,
      status: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const cleanRequest = JSON.parse(JSON.stringify(newRequest));
    await catalogDb().collection("custom_requests").doc(newRequest.id).set(cleanRequest);

    adminStore.customRequests.unshift(newRequest);

    adminStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      userId: "usr_guest",
      userEmail: data.customerEmail || data.customerPhone,
      userRole: "customer",
      action: "custom_request:submit",
      entityType: "custom_request",
      entityId: newRequest.id,
      details: `New custom design request from ${data.customerName}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, data: newRequest },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/custom-requests error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit custom request" },
      { status: 500 },
    );
  }
}
