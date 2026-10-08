import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-data";
import { orderStatusUpdateSchema } from "@/lib/validations";
import { adminDb } from "@/lib/firebase-admin";
import { saveOrderToFirestore, getOrderByIdFromFirestore } from "@/lib/firestore-service";
import type { Order, StatusHistoryEntry } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    let order: Order | null = null;

    // 1. Query live Firestore via Admin SDK
    if (adminDb) {
      try {
        const docRef = adminDb.collection("orders").doc(id);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          order = docSnap.data() as Order;
        } else {
          // Lookup by orderRef
          const qSnap = await adminDb
            .collection("orders")
            .where("orderRef", "==", id)
            .limit(1)
            .get();
          if (!qSnap.empty) {
            order = qSnap.docs[0].data() as Order;
          }
        }
      } catch (err) {
        console.warn("adminDb lookup error in GET /api/orders/[id]:", err);
      }
    }

    // 2. Client SDK fallback (only if adminDb is not active)
    if (!order && !adminDb) {
      order = await getOrderByIdFromFirestore(id);
    }

    // 3. In-memory fallback
    if (!order) {
      order = adminStore.orders.find((o) => o.id === id || o.orderRef === id) || null;
    }

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
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
    const parsed = orderStatusUpdateSchema.safeParse(body);

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

    // Fetch existing order first
    let currentOrder: Order | null = null;
    let targetDocId = id;

    if (adminDb) {
      const docSnap = await adminDb.collection("orders").doc(id).get();
      if (docSnap.exists) {
        currentOrder = docSnap.data() as Order;
        targetDocId = docSnap.id;
      } else {
        const qSnap = await adminDb
          .collection("orders")
          .where("orderRef", "==", id)
          .limit(1)
          .get();
        if (!qSnap.empty) {
          currentOrder = qSnap.docs[0].data() as Order;
          targetDocId = qSnap.docs[0].id;
        }
      }
    }

    if (!currentOrder) {
      const idx = adminStore.orders.findIndex(
        (o) => o.id === id || o.orderRef === id,
      );
      if (idx !== -1) {
        currentOrder = adminStore.orders[idx];
        targetDocId = currentOrder.id;
      }
    }

    if (!currentOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    const data = parsed.data;
    const now = new Date().toISOString();

    const historyEntry: StatusHistoryEntry = {
      status: data.status,
      timestamp: now,
      updatedBy: "staff@ceylonwalldecor.lk",
      note:
        data.note ||
        (data.status === "dispatched"
          ? `Dispatched via ${data.courierName || "Courier"}. Tracking: ${data.trackingNumber}`
          : undefined),
    };

    const updatedOrder: Order = {
      ...currentOrder,
      status: data.status,
      trackingNumber: data.trackingNumber ?? currentOrder.trackingNumber,
      courierName: data.courierName ?? currentOrder.courierName,
      cancellationReason:
        data.cancellationReason ?? currentOrder.cancellationReason,
      phoneVerified:
        data.phoneVerified !== undefined
          ? data.phoneVerified
          : currentOrder.phoneVerified,
      cashCollected:
        data.cashCollected !== undefined
          ? data.cashCollected
          : currentOrder.cashCollected,
      paymentStatus:
        data.status === "completed" || data.cashCollected
          ? ("paid" as const)
          : currentOrder.paymentStatus,
      amountPaid:
        data.status === "completed" || data.cashCollected
          ? currentOrder.total
          : currentOrder.amountPaid,
      statusHistory: [...(currentOrder.statusHistory || []), historyEntry],
      updatedAt: now,
    };

    // Sanitize updated order payload
    const cleanUpdatedOrder = JSON.parse(JSON.stringify(updatedOrder));

    // Save directly to Firestore via Admin SDK
    if (adminDb) {
      await adminDb.collection("orders").doc(targetDocId).set(cleanUpdatedOrder, { merge: true });
    } else {
      await saveOrderToFirestore(cleanUpdatedOrder);
    }

    // Mirror to in-memory store
    const memIdx = adminStore.orders.findIndex((o) => o.id === targetDocId);
    if (memIdx !== -1) {
      adminStore.orders[memIdx] = updatedOrder;
    } else {
      adminStore.orders.unshift(updatedOrder);
    }

    // Log to audit
    adminStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      userId: "usr_staff",
      userEmail: "staff@ceylonwalldecor.lk",
      userRole: "staff",
      action: "order:status_update",
      entityType: "order",
      entityId: id,
      details: `Moved order ${currentOrder.orderRef} to status "${data.status}"`,
      timestamp: now,
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 },
    );
  }
}
