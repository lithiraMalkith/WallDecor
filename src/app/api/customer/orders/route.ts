import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getOrdersFromFirestore } from "@/lib/firestore-service";
import type { Order } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone")?.trim() || "";
    const email = searchParams.get("email")?.trim().toLowerCase() || "";

    if (!phone && !email) {
      return NextResponse.json(
        { success: false, error: "Phone number or email required" },
        { status: 400 },
      );
    }

    let sourceOrders: Order[] = [];

    // Query live Firestore via Admin SDK
    if (adminDb) {
      try {
        const snap = await adminDb
          .collection("orders")
          .orderBy("createdAt", "desc")
          .get();
        sourceOrders = snap.docs.map((doc) => doc.data() as Order);
      } catch (err) {
        console.warn("adminDb query error in /api/customer/orders:", err);
      }
    }

    if (sourceOrders.length === 0 && !adminDb) {
      const firestoreOrders = await getOrdersFromFirestore();
      if (firestoreOrders && firestoreOrders.length > 0) {
        sourceOrders = firestoreOrders;
      }
    }

    const matched = sourceOrders.filter((order) => {
      const matchPhone = phone && order.customer?.phone === phone;
      const matchEmail =
        email &&
        order.customer?.email &&
        order.customer.email.toLowerCase() === email;
      return matchPhone || matchEmail;
    });

    return NextResponse.json({ success: true, data: matched });
  } catch (error) {
    console.error("GET /api/customer/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer orders" },
      { status: 500 },
    );
  }
}
