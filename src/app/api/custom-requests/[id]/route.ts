import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-data";
import { adminDb } from "@/lib/firebase-admin";
import type { CustomRequest } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!adminDb) return NextResponse.json({ success: false, error: "Firestore unavailable" }, { status: 503 });
    const snapshot = await adminDb.collection("custom_requests").doc(id).get();
    const item = snapshot.exists ? { ...snapshot.data(), id: snapshot.id } : null;

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Custom request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("GET /api/custom-requests/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch request" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (!adminDb) return NextResponse.json({ success: false, error: "Firestore unavailable" }, { status: 503 });
    const snapshot = await adminDb.collection("custom_requests").doc(id).get();

    if (!snapshot.exists) {
      return NextResponse.json(
        { success: false, error: "Custom request not found" },
        { status: 404 },
      );
    }

    const updated: CustomRequest = {
      ...snapshot.data() as CustomRequest,
      ...body,
      id: snapshot.id,
      updatedAt: new Date().toISOString(),
    };

    await snapshot.ref.update(JSON.parse(JSON.stringify(updated)), { lastUpdateTime: snapshot.updateTime! });

    adminStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      userId: "usr_staff",
      userEmail: "staff@ceylonwalldecor.lk",
      userRole: "staff",
      action: "custom_request:update",
      entityType: "custom_request",
      entityId: id,
      details: `Updated custom request for ${updated.customerName} (Status: ${updated.status}, Quote: Rs. ${updated.quotedPrice || 0})`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/custom-requests/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update request" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const index = adminStore.customRequests.findIndex((r) => r.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Custom request not found" },
        { status: 404 },
      );
    }

    const removed = adminStore.customRequests.splice(index, 1)[0];

    if (adminDb) {
      try {
        await adminDb.collection("custom_requests").doc(id).delete();
      } catch (err) {
        console.warn("adminDb custom_request delete error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      data: { id, message: "Custom request deleted" },
    });
  } catch (error) {
    console.error("DELETE /api/custom-requests/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete request" },
      { status: 500 },
    );
  }
}
