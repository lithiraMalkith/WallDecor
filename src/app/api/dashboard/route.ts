import { NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-data";
import { adminDb } from "@/lib/firebase-admin";
import type { Order } from "@/types";

export async function GET() {
  try {
    if (adminDb) {
      try {
        const snap = await adminDb.collection("orders").get();
        if (!snap.empty) {
          adminStore.orders = snap.docs.map((d) => d.data() as Order);
        }
      } catch (err) {
        console.warn("adminDb error in GET /api/dashboard:", err);
      }
    }

    const stats = adminStore.getDashboardStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard metrics" },
      { status: 500 },
    );
  }
}
