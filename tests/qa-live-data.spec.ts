import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { initializeApp, cert, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

function services() {
  if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) process.loadEnvFile('.env.local');
  const app = initializeApp({ credential: cert({ projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.trim().replace(/^['"]|['"]$/g, '').replace(/\\n/g, '\n') }) }, `qa-${randomUUID()}`);
  cloudinary.config({ cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true });
  return { app, db: getFirestore(app) };
}

test('TC-STORE-05: a real selected photo reaches Cloudinary and its request reaches Firestore', async ({ page, request }) => {
  test.setTimeout(90_000);
  const { app, db } = services();
  const customerName = `QA upload ${randomUUID()}`;
  let requestId: string | undefined, publicId: string | undefined;
  try {
    await page.goto('/custom-order');
    await page.getByPlaceholder('Your full name *').fill(customerName);
    await page.getByPlaceholder('Phone · 07XXXXXXXX *').fill('0770000000');
    await page.getByPlaceholder(/Tell us about the textures/).fill('Automated QA reference upload. Test record is removed after verification.');
    const png = await sharp({ create: { width: 32, height: 32, channels: 3, background: '#45654c' } }).png().toBuffer();
    await page.getByLabel('Reference photos').setInputFiles({ name: 'qa-reference.png', mimeType: 'image/png', buffer: png });
    const uploadResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/api/upload' && response.request().method() === 'POST');
    const createResponse = page.waitForResponse(response => new URL(response.url()).pathname === '/api/custom-requests' && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Submit Bespoke Request' }).click();
    const upload = await (await uploadResponse).json();
    publicId = upload.data?.publicId;
    expect(upload.success).toBe(true);
    expect(upload.data.url).toMatch(/^https:\/\/res\.cloudinary\.com\//);
    const created = await (await createResponse).json();
    requestId = created.data?.id;
    expect(created.success).toBe(true);
    await expect(page.getByRole('heading', { name: 'Request Received' })).toBeVisible();
    const stored = await db.collection('custom_requests').doc(requestId!).get();
    expect(stored.data()?.customerName).toBe(customerName);
    expect(stored.data()?.designUploadUrls).toEqual([upload.data.url]);
    const detail = await request.get(`/api/custom-requests/${requestId}`);
    expect(detail.ok()).toBe(true);
    expect((await detail.json()).data.designUploadUrls).toEqual([upload.data.url]);
  } finally {
    // Remove only the uniquely named record and asset created by this test.
    if (!requestId) {
      const created = await db.collection('custom_requests').where('customerName', '==', customerName).get();
      requestId = created.docs[0]?.id;
    }
    if (requestId) {
      const ref = db.collection('custom_requests').doc(requestId);
      if ((await ref.get()).data()?.customerName === customerName) await ref.delete();
    }
    if (publicId?.startsWith('ceylon-wall-decor/custom-requests/')) await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    await db.terminate();
    await deleteApp(app);
  }
});

test('TC-ADM-05: notification sources exactly match live Firestore records', async ({ request }) => {
  const { app, db } = services();
  try {
    const counts: Record<string, number> = {};
    for (const [collection, status] of [['orders', 'pending'], ['custom_requests', 'new']]) {
      const snapshot = await db.collection(collection).where('status', '==', status).get();
      counts[collection] = snapshot.size;
      const response = await request.get(`/api/${collection.replace('_', '-')}?status=${status}`);
      expect(response.ok()).toBe(true);
      expect(response.headers()['cache-control']).toContain('no-store');
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.map((record: { id: string }) => record.id).sort()).toEqual(snapshot.docs.map(doc => doc.id).sort());
    }
    const stats = await (await request.get('/api/dashboard')).json();
    expect(stats.success).toBe(true);
    expect(stats.data.ordersPending).toBe(counts.orders);
    expect(stats.data.newCustomRequests).toBe(counts.custom_requests);
  } finally { await db.terminate(); await deleteApp(app); }
});
