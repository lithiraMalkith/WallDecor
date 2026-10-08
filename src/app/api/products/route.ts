import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-data";
import { productSchema } from "@/lib/validations";
import { slugify, generateSKU } from "@/lib/utils";
import { adminDb } from "@/lib/firebase-admin";
import { saveProductToFirestore, getProductsFromFirestore } from "@/lib/firestore-service";
import type { Product } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const room = searchParams.get("room");
    const style = searchParams.get("style");
    const visibility = searchParams.get("visibility");

    let productsList: Product[] = [];

    if (adminDb) {
      try {
        const snap = await adminDb.collection("products").get();
        productsList = snap.docs.map((d) => d.data() as Product);
      } catch (err) {
        console.warn("adminDb query error in /api/products:", err);
      }
    }

    if (productsList.length === 0) {
      const firestoreProducts = await getProductsFromFirestore();
      if (firestoreProducts && firestoreProducts.length > 0) {
        productsList = firestoreProducts;
      } else {
        productsList = adminStore.products;
      }
    }

    adminStore.products = productsList;
    let filtered = [...productsList];

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          p.shortDescription.toLowerCase().includes(search),
      );
    }

    if (room && room !== "all") {
      filtered = filtered.filter((p) => p.room.includes(room));
    }

    if (style && style !== "all") {
      filtered = filtered.filter((p) => p.style.includes(style));
    }

    if (visibility && visibility !== "all") {
      filtered = filtered.filter((p) => p.visibility === visibility);
    }

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({
      success: true,
      data: adminStore.products,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const newId = `prod_${Date.now()}`;
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);
    const sku = data.sku || generateSKU(data.name);

    const newProduct: Product = {
      id: newId,
      name: data.name,
      slug,
      sku,
      shortDescription: data.shortDescription,
      longDescription: data.longDescription,
      images: data.images,
      video: data.video || "",
      tiktokVideoLink: data.tiktokVideoLink || "",
      room: data.room,
      style: data.style,
      colourTags: data.colourTags || [],
      sizes: data.sizes,
      frameOption: data.frameOption,
      framePricePerSqInch: data.framePricePerSqInch ?? 6,
      material: data.material || "Textured plaster on canvas",
      technique: data.technique || "Hand-sculpted relief",
      leadTimeDays: data.leadTimeDays || 5,
      stockType: data.stockType,
      quantity: data.quantity,
      isFeatured: data.isFeatured ?? false,
      isBestseller: data.isBestseller ?? false,
      isNew: data.isNew ?? true,
      featuredOrder: data.featuredOrder,
      featuredBadge: data.featuredBadge,
      visibility: data.visibility || "published",
      metaTitle: data.metaTitle || `${data.name} | Ceylon Wall Decor`,
      metaDescription: data.metaDescription || data.shortDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const cleanProduct = JSON.parse(JSON.stringify(newProduct));
    if (adminDb) {
      await adminDb.collection("products").doc(newId).set(cleanProduct);
    } else {
      await saveProductToFirestore(cleanProduct);
    }

    adminStore.products.unshift(newProduct);

    // Log audit
    adminStore.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      userId: "usr_active",
      userEmail: "admin@ceylonwalldecor.lk",
      userRole: "staff",
      action: "product:create",
      entityType: "product",
      entityId: newId,
      details: `Created new artwork design "${newProduct.name}" (${newProduct.sku})`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, data: newProduct },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 },
    );
  }
}
