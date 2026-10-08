import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/admin-data";
import { promotionSchema } from "@/lib/validations";
import type { Promotion } from "@/types";

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: adminStore.promotions });
  } catch (error) {
    console.error("GET /api/promotions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch promotions" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = promotionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed" },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const newPromo: Promotion = {
      id: `promo_${Date.now()}`,
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      minOrderValue: data.minOrderValue,
      maxDiscount: data.maxDiscount,
      usageLimit: data.usageLimit,
      usedCount: 0,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive,
      applicableCategories: data.applicableCategories,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    adminStore.promotions.unshift(newPromo);
    return NextResponse.json(
      { success: true, data: newPromo },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/promotions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create promotion" },
      { status: 500 },
    );
  }
}
