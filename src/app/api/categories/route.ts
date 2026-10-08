import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { adminStore, initialCategories } from "@/lib/admin-data";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import type { CategoryNode } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let list: CategoryNode[] = [];

    if (adminDb) {
      try {
        const snap = await adminDb.collection("categories").get();
        if (!snap.empty) {
          list = snap.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            } as CategoryNode;
          });
        } else {
          // If Firestore collection is empty, seed initialCategories
          try {
            const batch = adminDb.batch();
            for (const cat of initialCategories) {
              const cleanCat = Object.fromEntries(
                Object.entries(cat).filter(([_, v]) => v !== undefined)
              );
              batch.set(adminDb.collection("categories").doc(cat.id), cleanCat);
            }
            await batch.commit();
            list = [...initialCategories];
          } catch (seedErr) {
            console.warn("Seeding initial categories failed:", seedErr);
            list = [...adminStore.categories];
          }
        }
      } catch (err) {
        console.warn("adminDb error in GET /api/categories:", err);
      }
    }

    if (list.length === 0) {
      list = [...adminStore.categories];
    } else {
      adminStore.categories = list;
    }

    if (type && type !== "all") {
      list = list.filter((c) => c.type === type);
    }

    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

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
    const newCategory: CategoryNode = {
      id: `cat_${Date.now()}`,
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description,
      image: data.image,
      type: data.type,
      parentId: data.parentId,
      depth: data.depth,
      order: data.order || adminStore.categories.length + 1,
      isActive: data.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (adminDb) {
      try {
        const cleanCat = Object.fromEntries(
          Object.entries(newCategory).filter(([_, v]) => v !== undefined)
        );
        await adminDb.collection("categories").doc(newCategory.id).set(cleanCat);
      } catch (err) {
        console.warn("adminDb write error in POST /api/categories:", err);
      }
    }

    adminStore.categories.push(newCategory);
    return NextResponse.json(
      { success: true, data: newCategory },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 },
    );
  }
}
