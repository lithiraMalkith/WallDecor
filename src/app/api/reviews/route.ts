import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { adminStore, initialReviews } from "@/lib/admin-data";
import { reviewSchema } from "@/lib/validations";
import type { Review } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");

    let reviews: Review[] = [];

    if (adminDb) {
      try {
        const snap = await adminDb.collection("reviews").get();
        if (!snap.empty) {
          reviews = snap.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
            } as Review;
          });
        } else {
          // If Firestore collection is empty, seed initial reviews
          try {
            const batch = adminDb.batch();
            for (const r of initialReviews) {
              const cleanR = Object.fromEntries(
                Object.entries(r).filter(([_, v]) => v !== undefined)
              );
              batch.set(adminDb.collection("reviews").doc(r.id), cleanR);
            }
            await batch.commit();
            reviews = [...initialReviews];
          } catch (seedErr) {
            console.warn("Seeding initial reviews failed:", seedErr);
            reviews = [...adminStore.reviews];
          }
        }
      } catch (err) {
        console.warn("adminDb error in GET /api/reviews:", err);
      }
    }

    // Fallback to adminStore if Firestore was not available or empty
    if (reviews.length === 0) {
      reviews = [...adminStore.reviews];
    } else {
      adminStore.reviews = reviews;
    }

    // Filter in-memory
    if (status) {
      reviews = reviews.filter((r) => r.status === status);
    }
    if (featured === "true") {
      reviews = reviews.filter((r) => r.isFeaturedHomepage);
    }

    // Sort newest first
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({
      success: true,
      data: adminStore.reviews,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const newReview: Review = {
      id: `rev_${Date.now()}`,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      rating: data.rating,
      comment: data.comment,
      photoUrls: data.photoUrls || [],
      productName: data.productName,
      productId: data.productId,
      orderRef: data.orderRef,
      isVerifiedPurchase: data.isVerifiedPurchase ?? true,
      isFeaturedHomepage: data.isFeaturedHomepage ?? false,
      status: data.status || "approved",
      createdAt: new Date().toISOString(),
    };

    if (adminDb) {
      try {
        const cleanReview = Object.fromEntries(
          Object.entries(newReview).filter(([_, v]) => v !== undefined)
        );
        await adminDb.collection("reviews").doc(newReview.id).set(cleanReview);
      } catch (err) {
        console.warn("adminDb write error in POST /api/reviews:", err);
      }
    }

    adminStore.reviews.unshift(newReview);
    return NextResponse.json(
      { success: true, data: newReview },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 },
    );
  }
}
