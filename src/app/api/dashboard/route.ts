import { readProducts, catalogDb } from '@/lib/catalog-server';
import { NextResponse } from 'next/server';
import { adminStore } from '@/lib/admin-data';
import type { Order, CustomRequest } from '@/types';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const db = catalogDb();
    const [products, orders, requests] = await Promise.all([readProducts(), db.collection('orders').get(), db.collection('custom_requests').get()]);
    adminStore.orders = orders.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Order);
    adminStore.customRequests = requests.docs.map(doc => ({ ...doc.data(), id: doc.id }) as CustomRequest);
    return NextResponse.json({ success: true, data: adminStore.getDashboardStats(products) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json({ success: false, error: 'Dashboard data unavailable' }, { status: 503 });
  }
}
