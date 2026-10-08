import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-data";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const item = adminStore.customRequests.find((r) => r.id === id);

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
    const index = adminStore.customRequests.findIndex((r) => r.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Custom request not found" },
        { status: 404 },
      );
    }

    const updated = {
      ...adminStore.customRequests[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    adminStore.customRequests[index] = updated;

    if (adminDb) {
      try {
        await adminDb
          .collection("custom_requests")
          .doc(id)
          .set(JSON.parse(JSON.stringify(updated)), { merge: true });
      } catch (err) {
        console.warn("adminDb custom_request update error:", err);
      }
    }

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
