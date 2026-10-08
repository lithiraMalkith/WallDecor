import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getCustomRequestsFromFirestore } from "@/lib/firestore-service";
import type { CustomRequest } from "@/types";

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

    let sourceRequests: CustomRequest[] = [];

    if (adminDb) {
      try {
        const snap = await adminDb
          .collection("custom_requests")
          .orderBy("createdAt", "desc")
          .get();
        sourceRequests = snap.docs.map((doc) => doc.data() as CustomRequest);
      } catch (err) {
        console.warn("adminDb error in GET /api/customer/custom-requests:", err);
      }
    }

    if (sourceRequests.length === 0 && !adminDb) {
      const remote = await getCustomRequestsFromFirestore();
      if (remote && remote.length > 0) {
        sourceRequests = remote;
      }
    }

    const matched = sourceRequests.filter((req) => {
      const matchPhone = phone && req.customerPhone === phone;
      const matchEmail =
        email &&
        req.customerEmail &&
        req.customerEmail.toLowerCase() === email;
      return matchPhone || matchEmail;
    });

    return NextResponse.json({ success: true, data: matched });
  } catch (error) {
    console.error("GET /api/customer/custom-requests error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer custom requests" },
      { status: 500 },
    );
  }
}
