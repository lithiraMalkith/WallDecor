import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-data";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const index = adminStore.promotions.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Promotion not found" },
        { status: 404 },
      );
    }

    adminStore.promotions.splice(index, 1);
    return NextResponse.json({
      success: true,
      data: { id, message: "Promotion deleted" },
    });
  } catch (error) {
    console.error("DELETE /api/promotions/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete promotion" },
      { status: 500 },
    );
  }
}
