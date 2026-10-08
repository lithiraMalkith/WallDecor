import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { adminStore } from "@/lib/admin-data";
import type { CustomerUser } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = (searchParams.get("identifier") || searchParams.get("id") || "").trim();

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Identifier parameter required" },
        { status: 400 },
      );
    }

    let customer: CustomerUser | null = null;

    if (adminDb) {
      try {
        // 1. Direct doc ID lookup
        const docSnap = await adminDb.collection("customers").doc(identifier).get();
        if (docSnap.exists) {
          customer = docSnap.data() as CustomerUser;
        }

        // 2. Email lookup
        if (!customer && identifier.includes("@")) {
          const emailSnap = await adminDb
            .collection("customers")
            .where("email", "==", identifier.toLowerCase())
            .limit(1)
            .get();
          if (!emailSnap.empty) {
            customer = emailSnap.docs[0].data() as CustomerUser;
          }
        }

        // 3. Phone lookup
        if (!customer) {
          const phoneSnap = await adminDb
            .collection("customers")
            .where("phone", "==", identifier)
            .limit(1)
            .get();
          if (!phoneSnap.empty) {
            customer = phoneSnap.docs[0].data() as CustomerUser;
          }
        }
      } catch (err) {
        console.warn("adminDb customer lookup notice in GET /api/customer/profile:", err);
      }
    }

    // Fallback: check in-memory store
    if (!customer) {
      const mem = adminStore.getCustomers().find(
        (c: any) =>
          c.id === identifier ||
          (c.email && c.email.toLowerCase() === identifier.toLowerCase()) ||
          c.phone === identifier,
      );
      if (mem) {
        customer = {
          id: mem.id,
          name: mem.name,
          email: mem.email,
          phone: mem.phone,
          district: mem.district,
          city: "Colombo",
          address: mem.address,
          avatarUrl: "",
          provider: "phone",
          createdAt: mem.createdAt,
        };
      }
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("GET /api/customer/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer profile" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json();
    const user: CustomerUser = rawData.user || rawData;

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: "Valid customer user required" },
        { status: 400 },
      );
    }

    // Strip undefined values to prevent Firestore rejection
    const cleanUser = JSON.parse(JSON.stringify(user));
    cleanUser.updatedAt = new Date().toISOString();

    if (adminDb) {
      try {
        await adminDb.collection("customers").doc(cleanUser.id).set(cleanUser, { merge: true });
        console.log(`[Firebase Admin] Customer profile synced to Firestore: ${cleanUser.id}`);
      } catch (err) {
        console.warn("adminDb customer save error:", err);
      }
    }

    return NextResponse.json({ success: true, data: cleanUser });
  } catch (error) {
    console.error("POST /api/customer/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save customer profile" },
      { status: 500 },
    );
  }
}
