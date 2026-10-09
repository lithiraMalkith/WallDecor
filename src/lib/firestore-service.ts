// ============================================================================
// Ceylon Wall Decor — Firestore Database Service
// Handles all persistence for Products, Orders, Customers, Requests, & Reviews
// ============================================================================

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  limit,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import {
  initialProducts,
  initialOrders,
  initialCustomRequests,
  initialReviews,
  initialSiteSettings,
} from "./admin-data";
import type {
  Product,
  Order,
  CustomRequest,
  Review,
  Customer,
  CustomerUser,
  SiteSettings,
  OrderStatus,
  UserProfile,
} from "@/types";

// Collection Names
export const COLLECTIONS = {
  PRODUCTS: "products",
  ORDERS: "orders",
  CUSTOM_REQUESTS: "custom_requests",
  CUSTOMERS: "customers",
  REVIEWS: "reviews",
  SETTINGS: "settings",
  STAFF: "staff",
} as const;

/**
 * Returns current database runtime status
 */
export function getDatabaseStatus() {
  return {
    isConfigured: isFirebaseConfigured,
    mode: isFirebaseConfigured ? ("firestore" as const) : ("in-memory-fallback" as const),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "not-configured",
  };
}

/**
 * Automatically seeds Firestore if collections are empty or when manually requested
 */
export async function seedFirestoreIfEmpty(force = false): Promise<{
  success: boolean;
  message: string;
  count: number;
}> {
  if (!db || !isFirebaseConfigured) {
    return {
      success: false,
      message: "Firebase is not configured in .env.local. Add NEXT_PUBLIC_FIREBASE_API_KEY to connect live Firestore.",
      count: 0,
    };
  }

  try {
    const productsSnap = await getDocs(query(collection(db, COLLECTIONS.PRODUCTS), limit(1)));
    if (!productsSnap.empty && !force) {
      return {
        success: true,
        message: "Firestore already contains catalog data.",
        count: productsSnap.size,
      };
    }

    console.log("Seeding Firestore with catalog and initial store data...");
    const batch = writeBatch(db);
    let count = 0;

    // Seed products
    for (const p of initialProducts) {
      const ref = doc(db, COLLECTIONS.PRODUCTS, p.id);
      batch.set(ref, p, { merge: true });
      count++;
    }

    // Seed orders
    for (const o of initialOrders) {
      const ref = doc(db, COLLECTIONS.ORDERS, o.id);
      batch.set(ref, o, { merge: true });
      count++;
    }

    // Seed custom requests
    for (const r of initialCustomRequests) {
      const ref = doc(db, COLLECTIONS.CUSTOM_REQUESTS, r.id);
      batch.set(ref, r, { merge: true });
      count++;
    }

    // Seed reviews
    for (const rev of initialReviews) {
      const ref = doc(db, COLLECTIONS.REVIEWS, rev.id);
      batch.set(ref, rev, { merge: true });
      count++;
    }

    // Seed initial site settings
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, "site_config");
    batch.set(settingsRef, initialSiteSettings, { merge: true });
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
      const staffRef = doc(db, COLLECTIONS.STAFF, s.uid);
      batch.set(staffRef, s, { merge: true });
      count++;
    }

    await batch.commit();
    console.log(`Firestore seeding completed. Added ${count} documents.`);
    return {
      success: true,
      message: `Successfully seeded ${count} documents to Firestore DB.`,
      count,
    };
  } catch (err: any) {
    console.warn("Firestore auto-seed error:", err);
    return {
      success: false,
      message: err?.message || "Failed to seed Firestore",
      count: 0,
    };
  }
}

/**
 * ----------------------------------------------------------------------------
 * CUSTOMER / USER OPERATIONS
 * ----------------------------------------------------------------------------
 */
export async function saveCustomerToFirestore(customer: CustomerUser): Promise<void> {
  const cleanCustomer = JSON.parse(JSON.stringify(customer));

  // In browser: persist through the secure server route with admin authority
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/customer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanCustomer),
      });
      if (res.ok) return;
    } catch {
      // Fallback to client SDK below
    }
  }

  if (!db || !isFirebaseConfigured) return;

  try {
    const customerRef = doc(db, COLLECTIONS.CUSTOMERS, customer.id);
    await setDoc(
      customerRef,
      {
        ...cleanCustomer,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Failed to save customer to Firestore:", err);
  }
}

export async function getCustomerFromFirestore(idOrEmailOrPhone: string): Promise<CustomerUser | null> {
  // In browser: query through the secure server route to avoid permission issues
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/customer/profile?identifier=${encodeURIComponent(idOrEmailOrPhone)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data as CustomerUser;
        }
      }
    } catch {
      // Fallback to direct client query below
    }
  }

  if (!db || !isFirebaseConfigured) return null;

  try {
    // 1. Direct ID lookup
    const directRef = doc(db, COLLECTIONS.CUSTOMERS, idOrEmailOrPhone);
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) {
      return directSnap.data() as CustomerUser;
    }

    // 2. Email lookup
    const emailQ = query(
      collection(db, COLLECTIONS.CUSTOMERS),
      where("email", "==", idOrEmailOrPhone.toLowerCase()),
      limit(1)
    );
    const emailSnap = await getDocs(emailQ);
    if (!emailSnap.empty) {
      return emailSnap.docs[0].data() as CustomerUser;
    }

    // 3. Phone lookup
    const phoneQ = query(
      collection(db, COLLECTIONS.CUSTOMERS),
      where("phone", "==", idOrEmailOrPhone),
      limit(1)
    );
    const phoneSnap = await getDocs(phoneQ);
    if (!phoneSnap.empty) {
      return phoneSnap.docs[0].data() as CustomerUser;
    }

    return null;
  } catch (err) {
    console.error("Failed to query customer from Firestore:", err);
    return null;
  }
}

export async function getAllCustomersFromFirestore(): Promise<Customer[]> {
  if (!db || !isFirebaseConfigured) return [];

  try {
    const snap = await getDocs(collection(db, COLLECTIONS.CUSTOMERS));
    const customers: Customer[] = [];
    snap.forEach((d) => {
      const data = d.data() as any;
      customers.push({
        id: data.id || d.id,
        name: data.name || "Customer",
        email: data.email,
        phone: data.phone || "0770000000",
        address: data.address,
        district: data.district,
        orderCount: data.orderCount || 1,
        totalSpent: data.totalSpent || 0,
        isRepeat: !!data.isRepeat,
        tags: data.tags || ["Collector"],
        firstOrderAt: data.firstOrderAt || data.createdAt,
        lastOrderAt: data.lastOrderAt || data.createdAt,
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });
    return customers;
  } catch (err) {
    console.error("Failed to fetch customers from Firestore:", err);
    return [];
  }
}

/**
 * ----------------------------------------------------------------------------
 * PRODUCT OPERATIONS
 * ----------------------------------------------------------------------------
 */
export async function getProductsFromFirestore(): Promise<Product[] | null> {
  if (typeof window === "undefined") {
    try {
      const { adminDb } = await import("./firebase-admin");
      if (adminDb) {
        const snap = await adminDb.collection(COLLECTIONS.PRODUCTS).get();
        if (!snap.empty) {
          const prods: Product[] = [];
          snap.forEach((d) => prods.push(d.data() as Product));
          return prods;
        }
      }
    } catch (err) {
      console.warn("adminDb fetch in getProductsFromFirestore error:", err);
    }
  }

  if (!db || !isFirebaseConfigured) return null;

  try {
    const snap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    if (snap.empty) return null;

    const products: Product[] = [];
    snap.forEach((d) => products.push(d.data() as Product));
    return products;
  } catch (err) {
    console.error("Failed to fetch products from Firestore:", err);
    return null;
  }
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  const cleanProduct = JSON.parse(JSON.stringify(product));

  if (typeof window === "undefined") {
    try {
      const { adminDb } = await import("./firebase-admin");
      if (adminDb) {
        await adminDb.collection(COLLECTIONS.PRODUCTS).doc(product.id).set(cleanProduct, { merge: true });
        return;
      }
    } catch (err) {
      console.warn("adminDb save in saveProductToFirestore error:", err);
    }
  }

  if (!db || !isFirebaseConfigured) return;

  try {
    const ref = doc(db, COLLECTIONS.PRODUCTS, product.id);
    await setDoc(ref, cleanProduct, { merge: true });
  } catch (err) {
    console.error("Failed to save product to Firestore:", err);
  }
}

export async function deleteProductFromFirestore(id: string): Promise<void> {
  if (typeof window === "undefined") {
    try {
      const { adminDb } = await import("./firebase-admin");
      if (adminDb) {
        await adminDb.collection(COLLECTIONS.PRODUCTS).doc(id).delete();
        return;
      }
    } catch (err) {
      console.warn("adminDb delete in deleteProductFromFirestore error:", err);
    }
  }

  if (!db || !isFirebaseConfigured) return;

  try {
    const ref = doc(db, COLLECTIONS.PRODUCTS, id);
    await deleteDoc(ref);
  } catch (err) {
    console.error("Failed to delete product from Firestore:", err);
  }
}

/**
 * ----------------------------------------------------------------------------
 * ORDER OPERATIONS
 * ----------------------------------------------------------------------------
 */
export async function getOrdersFromFirestore(): Promise<Order[] | null> {
  if (!db || !isFirebaseConfigured) return null;

  try {
    const snap = await getDocs(collection(db, COLLECTIONS.ORDERS));
    if (snap.empty) return null;

    const orders: Order[] = [];
    snap.forEach((d) => orders.push(d.data() as Order));
    return orders;
  } catch (err) {
    console.error("Failed to fetch orders from Firestore:", err);
    return null;
  }
}

export async function getOrderByIdFromFirestore(idOrRef: string): Promise<Order | null> {
  if (!db || !isFirebaseConfigured) return null;

  try {
    const directRef = doc(db, COLLECTIONS.ORDERS, idOrRef);
    const snap = await getDoc(directRef);
    if (snap.exists()) {
      return snap.data() as Order;
    }

    const refQ = query(
      collection(db, COLLECTIONS.ORDERS),
      where("orderRef", "==", idOrRef),
      limit(1)
    );
    const refSnap = await getDocs(refQ);
    if (!refSnap.empty) {
      return refSnap.docs[0].data() as Order;
    }

    return null;
  } catch (err) {
    console.error("Failed to fetch order from Firestore:", err);
    return null;
  }
}

export async function saveOrderToFirestore(order: Order): Promise<void> {
  if (!db || !isFirebaseConfigured) return;

  try {
    const cleanOrder = JSON.parse(JSON.stringify(order));
    const ref = doc(db, COLLECTIONS.ORDERS, order.id);
    await setDoc(ref, cleanOrder, { merge: true });
  } catch (err) {
    console.error("Failed to save order to Firestore:", err);
  }
}

export async function updateOrderStatusInFirestore(
  orderId: string,
  status: OrderStatus,
  trackingNumber?: string,
  courierName?: string
): Promise<void> {
  if (!db || !isFirebaseConfigured) return;

  try {
    const ref = doc(db, COLLECTIONS.ORDERS, orderId);
    const updates: Record<string, any> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    if (courierName) updates.courierName = courierName;
    if (status === "completed") {
      updates.paymentStatus = "paid";
      updates.cashCollected = true;
    }
    const cleanUpdates = JSON.parse(JSON.stringify(updates));
    await setDoc(ref, cleanUpdates, { merge: true });
  } catch (err) {
    console.error("Failed to update order status in Firestore:", err);
  }
}

/**
 * ----------------------------------------------------------------------------
 * CUSTOM REQUEST OPERATIONS
 * ----------------------------------------------------------------------------
 */
export async function getCustomRequestsFromFirestore(): Promise<CustomRequest[] | null> {
  if (!db || !isFirebaseConfigured) return null;

  try {
    const snap = await getDocs(collection(db, COLLECTIONS.CUSTOM_REQUESTS));
    if (snap.empty) return null;

    const requests: CustomRequest[] = [];
    snap.forEach((d) => requests.push(d.data() as CustomRequest));
    return requests;
  } catch (err) {
    console.error("Failed to fetch custom requests from Firestore:", err);
    return null;
  }
}

export async function saveCustomRequestToFirestore(request: CustomRequest): Promise<void> {
  if (!db || !isFirebaseConfigured) return;

  try {
    const cleanRequest = JSON.parse(JSON.stringify(request));
    const ref = doc(db, COLLECTIONS.CUSTOM_REQUESTS, request.id);
    await setDoc(ref, cleanRequest, { merge: true });
  } catch (err) {
    console.error("Failed to save custom request to Firestore:", err);
  }
}

/**
 * ----------------------------------------------------------------------------
 * REVIEWS & SETTINGS OPERATIONS
 * ----------------------------------------------------------------------------
 */
export async function getReviewsFromFirestore(): Promise<Review[] | null> {
  if (!db || !isFirebaseConfigured) return null;

  try {
    const snap = await getDocs(collection(db, COLLECTIONS.REVIEWS));
    if (snap.empty) return null;

    const reviews: Review[] = [];
    snap.forEach((d) => reviews.push(d.data() as Review));
    return reviews;
  } catch (err) {
    console.error("Failed to fetch reviews from Firestore:", err);
    return null;
  }
}

export async function saveReviewToFirestore(review: Review): Promise<void> {
  if (!db || !isFirebaseConfigured) return;

  try {
    const cleanReview = JSON.parse(JSON.stringify(review));
    const ref = doc(db, COLLECTIONS.REVIEWS, review.id);
    await setDoc(ref, cleanReview, { merge: true });
  } catch (err) {
    console.error("Failed to save review to Firestore:", err);
  }
}

export async function getSettingsFromFirestore(): Promise<SiteSettings | null> {
  if (!db || !isFirebaseConfigured) return null;

  try {
    const ref = doc(db, COLLECTIONS.SETTINGS, "site_config");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as SiteSettings;
    }
    return null;
  } catch (err) {
    console.error("Failed to fetch site settings from Firestore:", err);
    return null;
  }
}

export async function saveSettingsToFirestore(settings: SiteSettings): Promise<void> {
  if (!db || !isFirebaseConfigured) return;

  try {
    const cleanSettings = JSON.parse(JSON.stringify(settings));
    const ref = doc(db, COLLECTIONS.SETTINGS, "site_config");
    await setDoc(ref, cleanSettings, { merge: true });
  } catch (err) {
    console.error("Failed to save site settings to Firestore:", err);
  }
}

/**
 * ----------------------------------------------------------------------------
 * STAFF / ADMIN USER OPERATIONS
 * ----------------------------------------------------------------------------
 */
export async function getStaffFromFirestore(uidOrEmail: string): Promise<UserProfile | null> {
  if (!db || !isFirebaseConfigured) return null;

  try {
    // 1. Direct UID lookup
    const directRef = doc(db, COLLECTIONS.STAFF, uidOrEmail);
    const snap = await getDoc(directRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }

    // 2. Email lookup
    const emailQ = query(
      collection(db, COLLECTIONS.STAFF),
      where("email", "==", uidOrEmail.toLowerCase()),
      limit(1)
    );
    const emailSnap = await getDocs(emailQ);
    if (!emailSnap.empty) {
      return emailSnap.docs[0].data() as UserProfile;
    }

    return null;
  } catch (err) {
    console.error("Failed to fetch staff profile from Firestore:", err);
    return null;
  }
}

export async function saveStaffToFirestore(staff: UserProfile): Promise<void> {
  if (!db || !isFirebaseConfigured) return;

  try {
    const cleanStaff = JSON.parse(JSON.stringify(staff));
    const ref = doc(db, COLLECTIONS.STAFF, staff.uid);
    await setDoc(ref, {
      ...cleanStaff,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.error("Failed to save staff profile to Firestore:", err);
  }
}

