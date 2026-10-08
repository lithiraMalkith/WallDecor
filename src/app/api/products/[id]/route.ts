import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-data";
import { adminDb } from "@/lib/firebase-admin";
import { saveProductToFirestore, deleteProductFromFirestore } from "@/lib/firestore-service";
import type { Product } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    let product: Product | null = null;

    if (adminDb) {
      try {
        const docSnap = await adminDb.collection("products").doc(id).get();
        if (docSnap.exists) {
          product = docSnap.data() as Product;
        } else {
          const qSnap = await adminDb
            .collection("products")
            .where("slug", "==", id)
            .limit(1)
            .get();
          if (!qSnap.empty) {
            product = qSnap.docs[0].data() as Product;
          }
        }
      } catch (err) {
        console.warn("adminDb error in GET /api/products/[id]:", err);
      }
    }

    if (!product) {
      product =
        adminStore.products.find((p) => p.id === id || p.slug === id) || null;
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
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

    let targetDocId = id;
    let currentProduct: Product | null = null;

    if (adminDb) {
      const docSnap = await adminDb.collection("products").doc(id).get();
      if (docSnap.exists) {
        currentProduct = docSnap.data() as Product;
        targetDocId = docSnap.id;
      } else {
        const qSnap = await adminDb
          .collection("products")
          .where("slug", "==", id)
          .limit(1)
          .get();
        if (!qSnap.empty) {
          currentProduct = qSnap.docs[0].data() as Product;
          targetDocId = qSnap.docs[0].id;
        }
      }
    }

    const index = adminStore.products.findIndex(
      (p) => p.id === id || p.slug === id,
    );

    if (!currentProduct && index !== -1) {
      currentProduct = adminStore.products[index];
      targetDocId = currentProduct.id;
    }

    if (!currentProduct && index === -1) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    const updated: Product = {
      ...(currentProduct || adminStore.products[index]),
      ...body,
      updatedAt: new Date().toISOString(),
    };

    const cleanProduct = JSON.parse(JSON.stringify(updated));
    if (adminDb) {
      await adminDb.collection("products").doc(targetDocId).set(cleanProduct, { merge: true });
    } else {
      await saveProductToFirestore(cleanProduct);
    }

    if (index !== -1) {
      adminStore.products[index] = updated;
    } else {
      adminStore.products.unshift(updated);
    }

    adminStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      userId: "usr_active",
      userEmail: "admin@ceylonwalldecor.lk",
      userRole: "staff",
      action: "product:update",
      entityType: "product",
      entityId: targetDocId,
      details: `Updated details/pricing for product "${updated.name}"`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    let targetDocId = id;
    let removedName = id;

    if (adminDb) {
      const docSnap = await adminDb.collection("products").doc(id).get();
      if (docSnap.exists) {
        removedName = (docSnap.data() as Product).name;
        targetDocId = docSnap.id;
      }
      await adminDb.collection("products").doc(targetDocId).delete();
    } else {
      await deleteProductFromFirestore(id);
    }

    const index = adminStore.products.findIndex(
      (p) => p.id === id || p.slug === id,
    );
    if (index !== -1) {
      const removed = adminStore.products.splice(index, 1)[0];
      removedName = removed.name;
    }

    adminStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      userId: "usr_active",
      userEmail: "admin@ceylonwalldecor.lk",
      userRole: "staff",
      action: "product:delete",
      entityType: "product",
      entityId: targetDocId,
      details: `Archived/deleted product "${removedName}"`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: { id: targetDocId, message: `Product "${removedName}" deleted successfully` },
    });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
