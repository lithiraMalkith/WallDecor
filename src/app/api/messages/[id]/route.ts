import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { adminStore } from "@/lib/admin-data";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updatePayload = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // 1. Update in Firestore if available
    if (adminDb) {
      try {
        const cleanBody = Object.fromEntries(
          Object.entries(updatePayload).filter(([_, v]) => v !== undefined)
        );
        await adminDb.collection("messages").doc(id).set(cleanBody, { merge: true });
      } catch (err) {
        console.warn("adminDb error in PUT /api/messages/[id]:", err);
      }
    }

    // 2. Update in-memory store
    const index = adminStore.messages.findIndex((m) => m.id === id);
    let updated;
    if (index !== -1) {
      updated = {
        ...adminStore.messages[index],
        ...updatePayload,
      };
      adminStore.messages[index] = updated;
    } else {
      updated = { id, ...updatePayload };
      adminStore.messages.unshift(updated);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/messages/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update message" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Delete from Firestore if available
    if (adminDb) {
      try {
        await adminDb.collection("messages").doc(id).delete();
      } catch (err) {
        console.warn("adminDb error in DELETE /api/messages/[id]:", err);
      }
    }

    // 2. Delete from in-memory store
    const index = adminStore.messages.findIndex((m) => m.id === id);
    if (index !== -1) {
      adminStore.messages.splice(index, 1);
    }

    return NextResponse.json({
      success: true,
      data: { id, message: "Message deleted" },
    });
  } catch (error) {
    console.error("DELETE /api/messages/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
