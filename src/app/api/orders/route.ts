import { catalogDb } from "@/lib/catalog-server";
import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-data";
import { orderCreateSchema } from "@/lib/validations";
import { generateOrderRef } from "@/lib/utils";
import { adminDb } from "@/lib/firebase-admin";
import { saveOrderToFirestore } from "@/lib/firestore-service";
import type { Order } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const status = searchParams.get("status");

    const snapshot = await catalogDb().collection("orders").get();
    const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Order).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    adminStore.orders = orders;

    let filtered = [...orders];

    if (search) {
      filtered = filtered.filter(
        (o) =>
          o.orderRef.toLowerCase().includes(search) ||
          o.id.toLowerCase().includes(search) ||
          o.customer.name.toLowerCase().includes(search) ||
          o.customer.phone.includes(search) ||
          (o.customer.email && o.customer.email.toLowerCase().includes(search)) ||
          (o.trackingNumber && o.trackingNumber.toLowerCase().includes(search)),
      );
    }

    if (status && status !== "all") {
      filtered = filtered.filter((o) => o.status === status);
    }

    return NextResponse.json({ success: true, data: filtered }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ success: false, error: "Orders are temporarily unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = orderCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order data",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Determine next sequential order number from Firestore count
    let totalOrderCount = 0;
    if (adminDb) {
      try {
        const countSnap = await adminDb.collection("orders").count().get();
        totalOrderCount = countSnap.data().count;
      } catch {
        totalOrderCount = adminStore.orders.length;
      }
    } else {
      totalOrderCount = adminStore.orders.length;
    }

    const orderNumber = totalOrderCount + 101;
    const orderRef = generateOrderRef(orderNumber);
    const newId = `ord_${Date.now()}`;

    // Calculate subtotal and frame cost from items
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.qty,
      0,
    );
    const frameCost = data.items.reduce(
      (sum, item) => sum + item.frameCost * item.qty,
      0,
    );
    const total =
      subtotal +
      frameCost +
      (data.deliveryFee || 0) -
      (data.discountAmount || 0);

    const newOrder: Order = {
      id: newId,
      orderRef,
      items: data.items,
      subtotal,
      frameCost,
      deliveryFee: data.deliveryFee || 0,
      discountAmount: data.discountAmount || 0,
      discountCode: data.discountCode,
      total,
      status: "pending",
      paymentMethod: "COD",
      paymentStatus: "pending",
      amountPaid: 0,
      currency: "LKR",
      customer: data.customer,
      deliveryAddress: data.deliveryAddress,
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date().toISOString(),
          updatedBy: "system",
          note: "Order placed via website checkout (COD)",
        },
      ],
      internalNotes: data.internalNotes,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      ttclid: data.ttclid,
      phoneVerified: false,
      cashCollected: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Sanitize order payload to prevent any undefined fields in Firestore
    const cleanOrder = JSON.parse(JSON.stringify(newOrder));

    // Save directly into live Firestore with full administrative authority
    if (adminDb) {
      await adminDb.collection("orders").doc(newId).set(cleanOrder);
      console.log(`[Firebase Admin] Order ${orderRef} (${newId}) saved directly to Firestore.`);
    } else {
      await saveOrderToFirestore(cleanOrder);
    }

    // Mirror to in-memory store
    adminStore.orders.unshift(newOrder);

    // Audit log
    adminStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      userId: "usr_guest",
      userEmail: data.customer.email || data.customer.phone,
      userRole: "customer",
      action: "order:create",
      entityType: "order",
      entityId: newId,
      details: `New order ${orderRef} placed for Rs. ${total.toLocaleString("en-LK")}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, data: newOrder },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create order" },
      { status: 500 },
    );
  }
}
