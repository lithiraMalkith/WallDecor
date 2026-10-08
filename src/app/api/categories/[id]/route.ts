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
        await adminDb.collection("categories").doc(id).set(cleanBody, { merge: true });
      } catch (err) {
        console.warn("adminDb error in PUT /api/categories/[id]:", err);
      }
    }

    // 2. Update in-memory store
    const index = adminStore.categories.findIndex((c) => c.id === id);
    let updated;
    if (index !== -1) {
      updated = {
        ...adminStore.categories[index],
        ...updatePayload,
      };
      adminStore.categories[index] = updated;
    } else {
      updated = { id, ...updatePayload };
      adminStore.categories.push(updated);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/categories/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
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
        await adminDb.collection("categories").doc(id).delete();
      } catch (err) {
        console.warn("adminDb error in DELETE /api/categories/[id]:", err);
      }
    }

    // 2. Delete from in-memory store
    const index = adminStore.categories.findIndex((c) => c.id === id);
    let name = "Category";
    if (index !== -1) {
      name = adminStore.categories[index].name;
      adminStore.categories.splice(index, 1);
    }

    return NextResponse.json({
      success: true,
      data: { id, message: `Category "${name}" deleted` },
    });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
