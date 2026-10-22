import { NextRequest, NextResponse } from "next/server";
import { getDatabaseStatus, seedFirestoreIfEmpty } from "@/lib/firestore-service";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import {
  initialOrders,
  initialCustomRequests,
  initialReviews,
  initialSiteSettings,
} from "@/lib/admin-data";
import type { UserProfile } from "@/types";

export async function GET() {
  try {
    const status = getDatabaseStatus();
    return NextResponse.json({
      success: true,
      data: {
        ...status,
        isAdminSdkConfigured: isFirebaseAdminConfigured,
        timestamp: new Date().toISOString(),
        note: isFirebaseAdminConfigured || status.isConfigured
          ? "Connected to live Google Cloud Firestore DB."
          : "Running in local developer fallback mode.",
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      data: {
        isConfigured: false,
        mode: "in-memory-fallback",
        isAdminSdkConfigured: false,
        timestamp: new Date().toISOString(),
        note: "Fallback mode active.",
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const force = Boolean(body.force);

    // If Server Admin SDK is configured, seed with full administrative authority
    if (adminDb && isFirebaseAdminConfigured) {
      const productsSnap = await adminDb.collection("products").limit(1).get();
      if (!productsSnap.empty && !force) {
        return NextResponse.json({
          success: true,
          message: "Firestore already contains catalog data.",
          count: productsSnap.size,
        });
      }

      console.log("[Firebase Admin] Seeding Firestore with catalog and initial store data...");
      const batch = adminDb.batch();
      let count = 0;

      // Seed orders
      for (const o of initialOrders) {
        const ref = adminDb.collection("orders").doc(o.id);
        batch.set(ref, JSON.parse(JSON.stringify(o)), { merge: true });
        count++;
      }

      // Seed custom requests
      for (const r of initialCustomRequests) {
        const ref = adminDb.collection("custom_requests").doc(r.id);
        batch.set(ref, JSON.parse(JSON.stringify(r)), { merge: true });
        count++;
      }

      // Seed reviews
      for (const rev of initialReviews) {
        const ref = adminDb.collection("reviews").doc(rev.id);
        batch.set(ref, JSON.parse(JSON.stringify(rev)), { merge: true });
        count++;
      }

      // Seed initial site settings
      const settingsRef = adminDb.collection("settings").doc("site_config");
      batch.set(settingsRef, JSON.parse(JSON.stringify(initialSiteSettings)), { merge: true });
      count++;

      // Seed default staff members
      const defaultStaff: UserProfile[] = [
        {
          uid: "usr_owner_001",
          email: "owner@ceylonwalldecor.lk",
          displayName: "Lithira Gunasekara (Owner)",
          role: "superadmin",
          phone: "0782518184",
          createdAt: "2026-01-15T08:00:00Z",
          lastLoginAt: new Date().toISOString(),
          isActive: true,
        },
        {
          uid: "usr_mgr_002",
          email: "manager@ceylonwalldecor.lk",
          displayName: "Anura Perera (Store Manager)",
          role: "manager",
          phone: "0771234567",
          createdAt: "2026-02-01T09:30:00Z",
          lastLoginAt: new Date().toISOString(),
          isActive: true,
        },
      ];

      for (const s of defaultStaff) {
        const staffRef = adminDb.collection("staff").doc(s.uid);
        batch.set(staffRef, JSON.parse(JSON.stringify(s)), { merge: true });
        count++;
      }

      await batch.commit();
      console.log(`[Firebase Admin] Firestore seeding complete! Added ${count} documents.`);

      return NextResponse.json({
        success: true,
        message: `Successfully seeded ${count} documents to live Firestore DB.`,
        count,
      });
    }

    // Client fallback seeding
    const result = await seedFirestoreIfEmpty(force);
    return NextResponse.json({
      success: result.success,
      message: result.message,
      count: result.count,
    });
  } catch (error: any) {
    console.error("POST /api/database/status error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}
