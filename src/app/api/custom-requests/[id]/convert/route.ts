import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-data";
import { generateOrderRef } from "@/lib/utils";
import type { Order } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const request = adminStore.customRequests.find((r) => r.id === id);

    if (!request) {
      return NextResponse.json(
        { success: false, error: "Custom request not found" },
        { status: 404 },
      );
    }

    const price = body.quotedPrice || request.quotedPrice || 12000;
    const deliveryFee = body.deliveryFee ?? 650;
    const total = price + deliveryFee;
    const orderNumber = adminStore.orders.length + 109;
    const orderRef = generateOrderRef(orderNumber);
    const orderId = `ord_${Date.now()}`;

    const newOrder: Order = {
      id: orderId,
      orderRef,
      items: [
        {
          productId: `custom_${request.id}`,
          productName: `Custom Art Piece (${request.sizeLabel || "Custom Size"})`,
          productSlug: "custom-art",
          image:
            request.designUploadUrls[0] ||
            "https://res.cloudinary.com/dtxw88le2/image/upload/e_noise:20,q_auto,f_auto/v1791451908/ceylon-wall-decor/products/hero.jpg",
          sizeLabel: request.sizeLabel || "Custom",
          width: request.sizeWidth || 16,
          height: request.sizeHeight || 20,
          withFrame: !!request.framePreference,
          unitPrice: price,
          frameCost: 0,
          qty: 1,
          totalPrice: price,
        },
      ],
      subtotal: price,
      frameCost: 0,
      deliveryFee,
      discountAmount: 0,
      total,
      status: "confirmed",
      paymentMethod: "COD",
      paymentStatus: "pending",
      amountPaid: 0,
      currency: "LKR",
      customer: {
        name: request.customerName,
        email: request.customerEmail,
        phone: request.customerPhone,
      },
      deliveryAddress: {
        address: "To be confirmed on WhatsApp",
        city: "Colombo",
        district: "Colombo",
        notes: request.notes,
      },
      statusHistory: [
        {
          status: "confirmed",
          timestamp: new Date().toISOString(),
          updatedBy: "staff@ceylonwalldecor.lk",
          note: `Converted from Custom Design Request #${request.id}`,
        },
      ],
      internalNotes: `Converted from Custom Design Request #${request.id}. Frame: ${request.framePreference || "None"}. Notes: ${request.notes}`,
      phoneVerified: true,
      cashCollected: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to orders
    adminStore.orders.unshift(newOrder);

    // Mark custom request as converted
    request.status = "converted";
    request.convertedOrderId = orderId;
    request.updatedAt = new Date().toISOString();

    // Audit log
    adminStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      userId: "usr_staff",
      userEmail: "staff@ceylonwalldecor.lk",
      userRole: "staff",
      action: "custom_request:convert",
      entityType: "order",
      entityId: orderId,
      details: `Converted custom request #${request.id} into formal order ${orderRef} (Rs. ${total.toLocaleString("en-LK")})`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, data: newOrder },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/custom-requests/[id]/convert error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to convert request to order" },
      { status: 500 },
    );
  }
}
