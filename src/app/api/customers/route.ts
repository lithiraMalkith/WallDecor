import { NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-data";
import { adminDb } from "@/lib/firebase-admin";
import { getAllCustomersFromFirestore } from "@/lib/firestore-service";
import type { Customer } from "@/types";

export async function GET() {
  try {
    let firestoreCustomers: Customer[] = [];
    if (adminDb) {
      try {
        const snap = await adminDb.collection("customers").get();
        firestoreCustomers = snap.docs.map((d) => d.data() as Customer);
      } catch (err) {
        console.warn("adminDb error in /api/customers:", err);
      }
    }

    if (firestoreCustomers.length === 0) {
      firestoreCustomers = await getAllCustomersFromFirestore();
    }

    const localCustomers = adminStore.getCustomers();

    // Merge customers by email/phone with full normalization
    const customerMap = new Map<string, Customer>();

    for (const c of localCustomers) {
      const key = c.phone || c.email || c.id;
      customerMap.set(key, {
        ...c,
        tags: Array.isArray(c.tags) ? c.tags : ["First Time Buyer"],
        orderCount: c.orderCount || 0,
        totalSpent: c.totalSpent || 0,
        isRepeat: Boolean(c.isRepeat),
      });
    }

    for (const c of firestoreCustomers) {
      const key = c.phone || c.email || c.id;
      const existing = customerMap.get(key);
      const normalized: Customer = {
        id: c.id || existing?.id || `cust_${Date.now()}`,
        name: c.name || existing?.name || "Customer",
        email: c.email || existing?.email,
        phone: c.phone || existing?.phone || "",
        address: c.address || existing?.address,
        district: c.district || existing?.district,
        orderCount: c.orderCount ?? existing?.orderCount ?? 0,
        totalSpent: c.totalSpent ?? existing?.totalSpent ?? 0,
        isRepeat: Boolean(c.isRepeat ?? existing?.isRepeat ?? false),
        tags: Array.isArray(c.tags) && c.tags.length > 0
          ? c.tags
          : (existing?.tags && existing.tags.length > 0
              ? existing.tags
              : ["First Time Buyer"]),
        firstOrderAt: c.firstOrderAt || existing?.firstOrderAt || c.createdAt,
        lastOrderAt: c.lastOrderAt || existing?.lastOrderAt || c.createdAt,
        createdAt: c.createdAt || existing?.createdAt || new Date().toISOString(),
      };
      customerMap.set(key, normalized);
    }

    return NextResponse.json({ success: true, data: Array.from(customerMap.values()) });
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}
