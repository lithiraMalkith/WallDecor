import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { adminStore } from "@/lib/admin-data";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 1. Update in Firestore if available
    if (adminDb) {
      try {
        const cleanBody = Object.fromEntries(
          Object.entries(body).filter(([_, v]) => v !== undefined)
        );
        await adminDb.collection("reviews").doc(id).set(cleanBody, { merge: true });
      } catch (err) {
        console.warn("adminDb error in PUT /api/reviews/[id]:", err);
      }
    }

    // 2. Update in-memory store
    const index = adminStore.reviews.findIndex((r) => r.id === id);
    let updated;
    if (index !== -1) {
      updated = {
        ...adminStore.reviews[index],
        ...body,
      };
      adminStore.reviews[index] = updated;
    } else {
      updated = { id, ...body };
      adminStore.reviews.unshift(updated);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/reviews/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
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

    // 1. Delete from Firestore if available
    if (adminDb) {
      try {
        await adminDb.collection("reviews").doc(id).delete();
      } catch (err) {
        console.warn("adminDb error in DELETE /api/reviews/[id]:", err);
      }
    }

    // 2. Delete from in-memory store
    const index = adminStore.reviews.findIndex((r) => r.id === id);
    if (index !== -1) {
      adminStore.reviews.splice(index, 1);
    }

    return NextResponse.json({
      success: true,
      data: { id, message: "Review deleted" },
    });
  } catch (error) {
    console.error("DELETE /api/reviews/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete review" },
      { status: 500 },
    );
  }
}
