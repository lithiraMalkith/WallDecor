import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-data";
import { adminDb } from "@/lib/firebase-admin";
import { getSettingsFromFirestore, saveSettingsToFirestore } from "@/lib/firestore-service";
import type { SiteSettings } from "@/types";

export async function GET() {
  try {
    let settings: SiteSettings | null = null;

    if (adminDb) {
      try {
        const snap = await adminDb.collection("settings").doc("site_config").get();
        if (snap.exists) {
          settings = snap.data() as SiteSettings;
        }
      } catch (err) {
        console.warn("adminDb error in GET /api/settings:", err);
      }
    }

    if (!settings) {
      settings = await getSettingsFromFirestore();
    }

    if (!settings) {
      settings = adminStore.settings;
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({
      success: true,
      data: adminStore.settings,
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = {
      ...adminStore.settings,
      ...body,
    };
    adminStore.settings = updated;

    if (adminDb) {
      await adminDb.collection("settings").doc("site_config").set(updated, { merge: true });
    } else {
      await saveSettingsToFirestore(updated);
    }

    adminStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      userId: "usr_owner_001",
      userEmail: "owner@ceylonwalldecor.lk",
      userRole: "superadmin",
      action: "settings:update",
      entityType: "settings",
      entityId: "global_settings",
      details: "Updated store configuration and pricing parameters",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
