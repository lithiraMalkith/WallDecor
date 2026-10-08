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
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (privateKey) {
  // Support both unescaped and escaped newline formats from env
  privateKey = privateKey.replace(/\\n/g, "\n");
}

export const isFirebaseAdminConfigured = Boolean(
  projectId && clientEmail && privateKey
);

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

if (typeof window === "undefined" && isFirebaseAdminConfigured) {
  try {
    if (!getApps().length) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      adminApp = getApp();
    }

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    try {
      adminDb.settings({ ignoreUndefinedProperties: true });
    } catch {
      // Ignore if settings already locked
    }
  } catch (err) {
    console.warn("Firebase Admin SDK initialization notice:", err);
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
