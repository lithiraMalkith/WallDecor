// ============================================================================
// Ceylon Wall Decor — Firebase Admin SDK (Server-Side Operations & Security)
// ============================================================================

import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

let privateKey: string | undefined = undefined;
if (rawPrivateKey) {
  let cleaned = rawPrivateKey.trim();
  // Strip wrapping double or single quotes if pasted from env file into Vercel UI
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  // Convert escaped newlines into real newlines
  cleaned = cleaned.replace(/\\n/g, "\n");
  privateKey = cleaned;
}

export const isFirebaseAdminConfigured = Boolean(
  projectId &&
    clientEmail &&
    privateKey &&
    privateKey.includes("-----BEGIN PRIVATE KEY-----")
);

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

if (typeof window === "undefined" && isFirebaseAdminConfigured && privateKey) {
  try {
    const existingApps = getApps();
    if (existingApps.length === 0) {
      adminApp = initializeApp({
        credential: cert({
          projectId: projectId!,
          clientEmail: clientEmail!,
          privateKey,
        }),
      });
    } else {
      adminApp = getApp();
    }

    if (adminApp) {
      adminAuth = getAuth(adminApp);
      adminDb = getFirestore(adminApp);
      try {
        adminDb.settings({ ignoreUndefinedProperties: true });
      } catch {
        // Settings already applied
      }
    }
  } catch (err) {
    console.warn("[Firebase Admin] Initialization failed, using in-memory store fallback:", err);
    adminApp = null;
    adminAuth = null;
    adminDb = null;
  }
}

export { adminApp, adminAuth, adminDb };

/**
 * Verify incoming staff or customer ID token from Authorization header
 */
export async function verifyAuthToken(authHeaderOrToken?: string | null): Promise<{
  valid: boolean;
  uid?: string;
  email?: string;
  role?: string;
  error?: string;
}> {
  if (!adminAuth || !isFirebaseAdminConfigured) {
    // If running in development without server credentials, allow preview
    return { valid: true, role: "superadmin" };
  }

  if (!authHeaderOrToken) {
    return { valid: false, error: "Missing authorization token" };
  }

  const token = authHeaderOrToken.startsWith("Bearer ")
    ? authHeaderOrToken.slice(7)
    : authHeaderOrToken;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return {
      valid: true,
      uid: decoded.uid,
      email: decoded.email,
      role: (decoded.role as string) || "user",
    };
  } catch (err: any) {
    return { valid: false, error: err?.message || "Invalid or expired Firebase ID token" };
  }
}
