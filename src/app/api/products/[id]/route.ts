import { NextRequest, NextResponse } from "next/server";
import { catalogDb, findProduct } from "@/lib/catalog-server";
import type { Product } from "@/types";
import { adminStore } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const missing = () => NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
const unavailable = () => NextResponse.json({ success: false, error: "The catalog is unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
function recordAudit(action: string, id: string, details: string) {
  adminStore.auditLogs.unshift({ id: `aud_${Date.now()}`, userId: "usr_active", userEmail: "admin@ceylonwalldecor.lk", userRole: "staff", action, entityType: "product", entityId: id, details, timestamp: new Date().toISOString() });
}

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const doc = await findProduct(id);
    if (!doc?.exists) return missing();
    return NextResponse.json({ success: true, data: { ...doc.data(), id: doc.id } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { console.error("Read product failed", error); return unavailable(); }
}

export async function PUT(req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();
    const doc = await findProduct(id);
    if (!doc?.exists) return missing();
    const updated = { ...doc.data(), ...body, id: doc.id, updatedAt: new Date().toISOString() } as Product;
    await doc.ref.update(JSON.parse(JSON.stringify(updated)), { lastUpdateTime: doc.updateTime! });
    recordAudit("product:update", doc.id, `Updated details/pricing for product "${updated.name}"`);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) { console.error("Update product failed", error); return unavailable(); }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const doc = await findProduct(id);
    if (!doc?.exists) return missing();
    const name = doc.data()?.name || doc.id;
    await catalogDb().collection("products").doc(doc.id).delete({ lastUpdateTime: doc.updateTime! });
    recordAudit("product:delete", doc.id, `Archived/deleted product "${name}"`);
    return NextResponse.json({ success: true, data: { id: doc.id, message: 'Product "' + name + '" deleted successfully' } });
  } catch (error) { console.error("Delete product failed", error); return unavailable(); }
}
